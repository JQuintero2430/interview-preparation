// Output question Q43.12: STOMP heart-beat negotiation through our stomp-frame.ts model (STOMP 1.2 "Heart-beating"; the
// client's tolerance mirrors @stomp/stompjs 7.5.0 `_setupHeartbeat`). Spring's own check of a silent client is read, not run.
import { negotiateHeartBeat, parseHeartBeat } from '../../modules/43-fullstack-realtime/concepts/stomp-frame';
import { captureLogs } from '../capture';

describe('43 · Q43.12', () => {
  it('Q43.12 heart-beat intervals for a server answering 0,0 and 10000,10000', async () => {
    const lines = await captureLogs((log) => {
      const client = parseHeartBeat('10000,10000');
      for (const answer of ['0,0', '10000,10000']) {
        const agreed = negotiateHeartBeat(client, parseHeartBeat(answer), 2);
        log(
          `server ${answer}: client sends ${agreed.clientSendsEvery}, server sends ${agreed.serverSendsEvery}, ` +
            `client gives up after ${agreed.clientGivesUpAfter}`,
        );
      }
    });
    expect(lines).toEqual([
      'server 0,0: client sends 0, server sends 0, client gives up after 0',
      'server 10000,10000: client sends 10000, server sends 10000, client gives up after 20000',
    ]);
  });
});
