// Output question Q44.10: the template step of the nginx image, as our model in concepts/envsubst-model.ts renders it
// (our model of nginx/docker-nginx's 20-envsubst-on-templates.sh read 2026-10-22; the script itself is never run).
import { renderTemplate } from '../../modules/44-fullstack-delivery-and-operations/concepts/envsubst-model';
import { captureLogs } from '../capture';

describe('44 · Q44.10', () => {
  it('Q44.10 only listed defined variables are substituted', async () => {
    const template = 'api=${API_URL} path=$uri missing=${UNSET} home=${HOME}';
    const env = { API_URL: 'https://api.example.com', HOME: '/root' };
    const lines = await captureLogs((log) => {
      log('no filter:', renderTemplate(template, env));
      log('filter ^API_:', renderTemplate(template, env, '^API_'));
    });
    expect(lines).toEqual([
      'no filter: api=https://api.example.com path=$uri missing=${UNSET} home=/root',
      'filter ^API_: api=https://api.example.com path=$uri missing=${UNSET} home=${HOME}',
    ]);
  });
});
