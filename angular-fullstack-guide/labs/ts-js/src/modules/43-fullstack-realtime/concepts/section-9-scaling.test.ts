// Section 9 claims, about our model (broker-model.ts) of a simple broker per instance, a relay to one external broker,
// Spring's per-session send buffer and user destinations across two instances. Nothing here runs Spring or a broker,
// opens a connection or reads a clock.
import { Cluster, SESSION_NOT_RELIABLE, messageFrame, type ClusterConfig, type OverflowStrategy } from './broker-model';
import { encodeFrame } from './stomp-frame';

function chatRoom(config: ClusterConfig) {
  const cluster = new Cluster(config, ['A', 'B']);
  const a = cluster.instance('A');
  const b = cluster.instance('B');
  const tab1 = a.connect('s1', 'alice');
  const tab2 = b.connect('s2', 'bob');
  a.subscribe(tab1, '/topic/room.1');
  b.subscribe(tab2, '/topic/room.1');
  a.send(tab1, '/app/room.1', 'hi');
  return { cluster, tab1, tab2 };
}

describe('Module 43 · section 9', () => {
  it('Section 9: with a simple broker per instance a message published on A never reaches a subscriber on B', () => {
    const { cluster, tab1, tab2 } = chatRoom({ mode: 'simple' });

    expect(tab1.received().map((frame) => frame.body)).toEqual(['hi']);
    expect(tab2.received()).toEqual([]);
    expect(cluster.hops).toEqual([
      'A clientInboundChannel',
      'A @MessageMapping',
      'A brokerChannel',
      'A simple broker',
      'A clientOutboundChannel',
    ]);
  });

  it('Section 9: with a shared relay the message reaches subscribers on both instances', () => {
    const { cluster, tab1, tab2 } = chatRoom({ mode: 'relay' });

    expect(tab1.received().map((frame) => frame.body)).toEqual(['hi']);
    expect(tab2.received()).toEqual([messageFrame('/topic/room.1', 'm-1', 'sub-0', 'hi')]);
    // The return value keeps the sender's session id, so A's relay sends it on that client's own TCP connection.
    expect(cluster.hops).toEqual([
      'A clientInboundChannel',
      'A @MessageMapping',
      'A brokerChannel',
      'A relay, session s1',
      'external broker',
      'A relay',
      'A clientOutboundChannel',
      'B relay',
      'B clientOutboundChannel',
    ]);

    // Application code has no session id, so the relay uses the system connection.
    cluster.hops.length = 0;
    cluster.instance('B').publish('/topic/room.1', 'from a service');
    expect(cluster.hops.slice(0, 2)).toEqual(['B brokerChannel', 'B relay, system connection']);
  });

  it('Section 9: a session whose buffer passes the limit is terminated under TERMINATE and loses messages under DROP', () => {
    // A limit of exactly one encoded MESSAGE frame: the second frame waiting in the buffer passes it.
    const oneFrame = encodeFrame(messageFrame('/topic/prices', 'm-1', 'sub-0', 'p1')).length;
    const run = (overflow: OverflowStrategy) => {
      const cluster = new Cluster({ mode: 'simple' }, ['A']);
      const a = cluster.instance('A');
      const phone = a.connect('s1', 'alice', { bufferSizeLimit: oneFrame, overflow });
      a.subscribe(phone, '/topic/prices');
      a.publish('/topic/prices', 'p1');
      phone.slow = true; // a send is still in progress, so later frames wait in the buffer
      for (const price of ['p2', 'p3', 'p4']) a.publish('/topic/prices', price);
      phone.drain();
      return phone;
    };

    const terminated = run('terminate');
    expect(terminated.open).toBe(false);
    expect(terminated.closeCode).toBe(SESSION_NOT_RELIABLE);
    expect(terminated.received().map((frame) => frame.body)).toEqual(['p1']);

    // A client keeping up never fills the buffer, so the limit is never checked.
    const cluster = new Cluster({ mode: 'simple' }, ['A']);
    const fast = cluster.instance('A').connect('s2', 'bob', { bufferSizeLimit: 1, overflow: 'terminate' });
    cluster.instance('A').subscribe(fast, '/topic/prices');
    for (const price of ['p1', 'p2', 'p3']) cluster.instance('A').publish('/topic/prices', price);
    expect(fast.open).toBe(true);
    expect(fast.received()).toHaveLength(3);

    const dropping = run('drop');
    expect(dropping.open).toBe(true);
    expect(dropping.dropped).toBe(2);
    // DROP removes the oldest buffered frames, so the newest price survives.
    expect(dropping.received().map((frame) => frame.body)).toEqual(['p1', 'p4']);
  });

  it('Section 9: a user destination reaches the user on the other instance only with a registry or unresolved-message broadcast', () => {
    const deliver = (config: ClusterConfig) => {
      const cluster = new Cluster(config, ['A', 'B']);
      const alice = cluster.instance('A').connect('s1', 'alice');
      cluster.instance('A').subscribe(alice, '/user/queue/notices');
      cluster.instance('B').sendToUser('alice', '/queue/notices', 'order shipped');
      return alice.received();
    };

    expect(deliver({ mode: 'simple' })).toEqual([]);
    expect(deliver({ mode: 'relay' })).toEqual([]);
    const expected = [messageFrame('/user/queue/notices', 'm-1', 'sub-0', 'order shipped')];
    // B's registry knows alice's session on A, so B resolves it and the external broker delivers it.
    expect(deliver({ mode: 'relay', userRegistryBroadcast: true })).toEqual(expected);
    // B finds no session, so the message is broadcast and A resolves it for its own session.
    expect(deliver({ mode: 'relay', userDestinationBroadcast: true })).toEqual(expected);
  });
});
