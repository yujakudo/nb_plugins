import { mockServer } from '@nocobase/test';
import { getRepositoryData } from '../apiService';
import PluginApiProxyServer from '../plugin';
import apiProxyApis from '../collections/api_proxy_apis';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('api-proxy:drift-safety', () => {
    let app;
    let db;

    beforeEach(async () => {
        app = mockServer({
            plugins: [PluginApiProxyServer],
        });
        // Manually register collection because directory scan might fail in this mock context
        app.db.collection(apiProxyApis);

        await app.load();
        db = app.db;
        await db.sync();
    });

    afterEach(async () => {
        await app.destroy();
        vi.restoreAllMocks();
    });

    it('should pre-consume (double count) when request is within danger zone', async () => {
        // 1. Setup Env (Mock 300s delay)
        vi.stubGlobal('process', { ...process, env: { ...process.env, API_PROXY_RESET_DELAY: '300' } });

        // 2. Create API
        const repo = db.getRepository('api_proxy_apis');
        const api = await repo.create({
            values: {
                name: 'drift-test',
                url: 'http://example.com',
                limit: 'daily',
                maxRequests: 100,
                timezone: 'UTC',
                // Start time 00:00 UTC
            },
        });

        // 3. Set state to "Danger Zone"
        // Danger Zone = [nextResetAt - 300s, nextResetAt]
        // Let's say nextResetAt is 10 minutes from now. We want to be 2 minutes before reset.
        // So we set nextResetAt to now + 2 minutes.
        const now = new Date();
        const twoMinutesLater = new Date(now.getTime() + 2 * 60 * 1000);

        await repo.update({
            filter: { id: api.id },
            values: {
                nextResetAt: twoMinutesLater,
                currentAccessCount: 5,
                reserveCount: 0,
                lastAccessAt: now,
            }
        });

        // 4. Call logic
        // We need a mock context with db
        const ctx = { db } as any;
        await getRepositoryData(ctx, 'drift-test');

        // 5. Verify
        const updated = await repo.findOne({ filter: { id: api.id } });
        expect(updated.currentAccessCount).toBe(6); // +1 normal
        expect(updated.reserveCount).toBe(1); // +1 double count
    });

    it('should not reset if within reset delay window (after reset time)', async () => {
        // 1. Setup Env
        vi.stubGlobal('process', { ...process, env: { ...process.env, API_PROXY_RESET_DELAY: '300' } });

        // 2. Create API
        const repo = db.getRepository('api_proxy_apis');
        const api = await repo.create({
            values: {
                name: 'delay-test',
                url: 'http://example.com',
                limit: 'daily',
                maxRequests: 100,
                timezone: 'UTC',
            },
        });

        // 3. Set state to "Delayed Window"
        // Reset time passed 1 minute ago, but Delay is 5 minutes.
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 1 * 60 * 1000);

        await repo.update({
            filter: { id: api.id },
            values: {
                nextResetAt: oneMinuteAgo,
                currentAccessCount: 10,
                reserveCount: 1, // Suppose we had some reserve
                lastAccessAt: now,
            }
        });

        // 4. Call logic
        const ctx = { db } as any;
        await getRepositoryData(ctx, 'delay-test');

        // 5. Verify
        const updated = await repo.findOne({ filter: { id: api.id } });
        expect(updated.currentAccessCount).toBe(11); // No reset, just +1
        expect(updated.nextResetAt.getTime()).toBe(oneMinuteAgo.getTime()); // Not updated
    });

    it('should reset and apply reserve count after delay window passed', async () => {
        // 1. Setup Env
        vi.stubGlobal('process', { ...process, env: { ...process.env, API_PROXY_RESET_DELAY: '300' } });

        // 2. Create API
        const repo = db.getRepository('api_proxy_apis');
        const api = await repo.create({
            values: {
                name: 'reset-exec-test',
                url: 'http://example.com',
                limit: 'daily',
                maxRequests: 100,
                timezone: 'UTC',
            },
        });

        // 3. Set state to "After Delay"
        // Reset time passed 10 minutes ago (Delay is 5 mins).
        const now = new Date();
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

        await repo.update({
            filter: { id: api.id },
            values: {
                nextResetAt: tenMinutesAgo,
                currentAccessCount: 99,
                reserveCount: 5, // 5 requests were reserved
                lastAccessAt: now,
            }
        });

        // 4. Call logic
        const ctx = { db } as any;
        await getRepositoryData(ctx, 'reset-exec-test');

        // 5. Verify
        const updated = await repo.findOne({ filter: { id: api.id } });
        // Should reset. New count = reserveCount + 1 (current request)
        expect(updated.currentAccessCount).toBe(5 + 1);
        expect(updated.reserveCount).toBe(0);
        // Next reset should be tomorrow (relative to tenMinutesAgo approx)
        expect(updated.nextResetAt.getTime()).toBeGreaterThan(tenMinutesAgo.getTime());
    });
});
