// redisClient.test.js
jest.mock('redis', () => jest.requireActual('jest-redis-mock'));

const RedisClient = require('./../../scripts/redisClient.js');

describe('RedisClient', () => {
    let redisClient;

    beforeAll(() => {
        redisClient = new RedisClient();
    });

    it('should connect successfully', async () => {
        await expect(redisClient.connect()).resolves.not.toThrow();
        expect(redisClient.isConnected).toBeTruthy();
    });

    // TODO - Add other methods `scan`, `disconnect`, etc.
});
