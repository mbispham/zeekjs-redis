ZeekJS-Redis
=================================

***work in progress*** ...

This zkg package implements a method of parsing Zeek logs to Redis.

```# zeek -C LogAscii::use_json=T -r testing/Traces/zeekjs-redis-test.pcap ./scripts/index.js```

```
# redis-cli
127.0.0.1:6379> KEYS *
1) "zeek_conn_logs"
127.0.0.1:6379> LRANGE zeek_conn_logs 0 -1
1)  "{\"ts\":1616775350.763199,\"uid\":\"CNT4R81EW9Y2E6nXLl\",\"id\":{\"orig_h\":\"192.168.220.35\",\"orig_p\":53537,\"resp_h\":\"192.168.220.1\",\"resp_p\":31981},\"proto\":\"tcp\",\"conn_state\":\"S0\",\"local_orig\":true,\"local_resp\":true,\"missed_bytes\":0,\"history\":\"S\",\"orig_pkts\":1,\"orig_ip_bytes\":44,\"resp_pkts\":0,\"resp_ip_bytes\":0}"
...
24) "{\"ts\":...
```

- **index.js**: Utilizes Node.js's net module to send Zeek logs to a Redis server
- **redisClient.js**: Creates and manages a Redis client instance
- **socketServer.js**: Establishes a socket to handle and process incoming Zeek data
- **ZeekRedis.js**: Hooks into Zeek logs, flattens the JSON and sends the logs to a Redis server.

### Build

For now Git clone and then:
```
bash build/zeekjs_redis.sh 2>&1 | tee zeekjs_redis_output.log
```

In the build you get a prompt to:
1. Create a redis password 
2. A local certificate
3. Install dependencies using npm

TODO - Change so handled by Zeek plugin configuration  

### Filtered Log Usage

Rather than sending all Zeek logs to Redis a common could be to output a section of a specific log type.

TODO - Add example of filtered log


### Considerations for production environments

Security - No validation or sanitization for Zeek derived data that enters Redis has been implemented.
Ensure your redis server is not accessible from the internet - unless that is a desired feature.

Persistence Configuration - No persistence is configured

Replication - No data is replicated which may be a consideration for a production environment

Hardware - Ensure you have enough RAM - redis is memory intensive - Zeek can churn out a lot of data

Performance - single threaded

### Acknowledgements

- [**Christian Kreibich**](https://github.com/ckreibich): Zeek project technical lead
- [**Arne Welzel**](https://github.com/awelzel): Main author of [ZeekJS](https://zeekjs.readthedocs.io)
- [**Simeon Miteff**](https://github.com/simeonmiteff): The structure of this project was inspired by Simeon's work on integrating telegram with Zeek [zeekjs-notice-telegram](https://github.com/corelight/zeekjs-notice-telegram)
- [**WRCCDC**](https://wrccdc.org): test.pcap is carved from a publicly available trace released under a [creative commons license](https://creativecommons.org/licenses/by-sa/4.0/)

### License 
zeekjs-redis is free and open-source software licensed under the [3-clause BSD license](LICENSE).
