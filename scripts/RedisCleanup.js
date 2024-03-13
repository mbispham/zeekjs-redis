// RedisCleanup.js
const redisClient = require('./redisClient.js');  // Assuming the same Redis client configuration

async function cleanupOldEntries() {
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    const pattern = 'zeek_*_logs'; //If a different key pattern is implemented this would have to be modified

    try {
        let cursor = '0';
        do {
            const [newCursor, keys] = await redisClient.scan(cursor, 'MATCH', pattern);
            cursor = newCursor;
            for (const key of keys) {
                await redisClient.zremrangebyscore(key, '-inf', thirtyDaysAgo);
            }
        } while (cursor !== '0');

        console.log('Cleanup completed for all matching keys.');
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await redisClient.disconnect(); // Close the Redis connection
    }
}

cleanupOldEntries()
    .then(() => {
        console.log('Cleanup process completed successfully.');
    })
    .catch((error) => {
        console.error('An error occurred during cleanup:', error);
    });
