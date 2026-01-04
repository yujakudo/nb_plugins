import { Plugin } from '@nocobase/server';
import { apiProxy, testLogCache } from './apiProxy';

/**
 * APIプロキシプラグインのサーバーサイド実装クラス
 */
export class PluginApiProxyServer extends Plugin {
  private proxyBasePath = process.env.API_PROXY_PATH || '/api/proxy';

  async afterAdd() { }

  async beforeLoad() { }

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

    // テストログ取得アクションの追加
    this.app.resource({
      name: 'api_proxy_apis',
      actions: {
        getTestLog: async (ctx, next) => {
          const { token } = ctx.action.params;
          if (!token) {
            ctx.status = 400;
            ctx.body = { message: 'Token is required' };
            return;
          }
          const log = testLogCache.get(token);
          if (!log) {
            ctx.status = 404;
            ctx.body = { message: 'Log not found or expired' };
            return;
          }
          ctx.body = { data: log };
          await next();
        },
        getProxyConfig: async (ctx, next) => {
          ctx.body = {
            data: {
              proxyBasePath: this.proxyBasePath,
            },
          };
          await next();
        },
      },
    });
  }

  async install() { }

  async afterEnable() { }

  async afterDisable() { }

  async remove() { }
}

export default PluginApiProxyServer;
