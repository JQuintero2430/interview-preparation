// Section 5 claims, about our model (stomp-frame.ts) of STOMP 1.2 frames, heart-beat negotiation and user
// destinations. Nothing here runs Spring or stompjs, opens a connection or reads a clock.
import {
  decodeFrames,
  encodeFrame,
  negotiateHeartBeat,
  parseHeartBeat,
  resolveUserDestination,
  type StompFrame,
} from './stomp-frame';

describe('Module 43 · section 5', () => {
  it('Section 5: a SEND frame encodes to command, headers, a blank line, the body and a NULL byte', () => {
    const send: StompFrame = {
      command: 'SEND',
      headers: { destination: '/app/room.1', 'content-type': 'text/plain' },
      body: 'hello',
    };
    expect(encodeFrame(send)).toBe('SEND\ndestination:/app/room.1\ncontent-type:text/plain\n\nhello\0');

    // Every frame but CONNECT and CONNECTED escapes a colon in a header value as \c.
    const escaped = encodeFrame({ command: 'SEND', headers: { destination: '/app/a:b' }, body: '' });
    expect(escaped).toBe('SEND\ndestination:/app/a\\cb\n\n\0');
    expect(decodeFrames(escaped).frames[0]?.headers).toEqual({ destination: '/app/a:b' });
    expect(encodeFrame({ command: 'CONNECT', headers: { host: 'a:8080' }, body: '' })).toBe('CONNECT\nhost:a:8080\n\n\0');
  });

  it('Section 5: decoding two frames from one chunk returns both', () => {
    const chunk =
      'MESSAGE\ndestination:/topic/room.1\nmessage-id:m-1\nsubscription:sub-0\n\nhi\0\n' +
      'MESSAGE\r\ndestination:/topic/room.1\r\nmessage-id:m-2\r\nsubscription:sub-0\r\n\r\nbye\0\nRECEI';
    const { frames, heartBeats, rest } = decodeFrames(chunk);

    expect(frames.map((frame) => [frame.command, frame.headers['message-id'], frame.body])).toEqual([
      ['MESSAGE', 'm-1', 'hi'],
      ['MESSAGE', 'm-2', 'bye'],
    ]);
    expect(heartBeats).toBe(2);
    expect(rest).toBe('RECEI');
    expect(decodeFrames('\n\n\r\n')).toEqual({ frames: [], heartBeats: 3, rest: '' });
  });

  it('Section 5: heart-beat 10000,10000 against 0,0 disables both directions', () => {
    const connected = decodeFrames('CONNECTED\nversion:1.2\nheart-beat:0,0\n\n\0').frames[0];
    const server = parseHeartBeat(connected?.headers['heart-beat']);

    expect(server).toEqual([0, 0]);
    expect(negotiateHeartBeat([10000, 10000], server)).toEqual({
      clientSendsEvery: 0,
      serverSendsEvery: 0,
      clientGivesUpAfter: 0,
    });
    // A missing header counts as 0,0.
    expect(parseHeartBeat(undefined)).toEqual([0, 0]);
  });

  it('Section 5: heart-beat 10000,10000 against 10000,10000 sends every 10 s and checks within 20 s with a tolerance of 2', () => {
    expect(negotiateHeartBeat([10000, 10000], parseHeartBeat('10000,10000'), 2)).toEqual({
      clientSendsEvery: 10000,
      serverSendsEvery: 10000,
      clientGivesUpAfter: 20000,
    });
    // Each direction is MAX(what the sender can do, what the receiver wants).
    expect(negotiateHeartBeat([5000, 20000], [10000, 4000])).toEqual({
      clientSendsEvery: 5000,
      serverSendsEvery: 20000,
      clientGivesUpAfter: 40000,
    });
  });

  it('Section 5: a /user/queue destination resolves to the user\'s sessions only', () => {
    const sessionsByUser = new Map([
      ['alice', ['s1', 's2']],
      ['bob', ['s3']],
    ]);

    expect(resolveUserDestination('/user/alice/queue/errors', sessionsByUser)).toEqual([
      { sessionId: 's1', destination: '/queue/errors' },
      { sessionId: 's2', destination: '/queue/errors' },
    ]);
    expect(resolveUserDestination('/user/carol/queue/errors', sessionsByUser)).toEqual([]);
    expect(resolveUserDestination('/topic/room.1', sessionsByUser)).toBeNull();
  });
});
