// @ts-ignore
import pkg from './../../package.json';
import { useApp } from '@nocobase/client';

export function useT() {
    const app = useApp();
    return (str: string) => app.i18n.t(str, { ns: [pkg.name, 'client'] });
}
