import { Plugin } from '@nocobase/server';
export declare class PluginApiProxyServer extends Plugin {
    private proxyBasePath;
    afterAdd(): Promise<void>;
    beforeLoad(): Promise<void>;
    load(): Promise<void>;
    install(): Promise<void>;
    afterEnable(): Promise<void>;
    afterDisable(): Promise<void>;
    remove(): Promise<void>;
}
export default PluginApiProxyServer;
