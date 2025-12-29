import { Plugin } from '@nocobase/client';
declare class ApiProxyPluginClient extends Plugin {
    load(): Promise<void>;
}
export default ApiProxyPluginClient;
