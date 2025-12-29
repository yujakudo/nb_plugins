import { Plugin } from '@nocobase/server';
import { apiProxy } from './apiProxy';

export class PluginApiProxyServer extends Plugin {
  private proxyBasePath = process.env.API_PROXY_PATH || '/api/proxy';

  async afterAdd() {}

  async beforeLoad() {}

  async load() {
    this.app.use(async (ctx, next) => {
      // ctx.path を使ってパスのみをチェック
      if (ctx.path.startsWith(this.proxyBasePath)) {
        await apiProxy(ctx, this.proxyBasePath);
      } else {
        await next();
      }
    });
    this.app.acl.allow('api_proxy_apis', '*', 'loggedIn');
  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PluginApiProxyServer;
