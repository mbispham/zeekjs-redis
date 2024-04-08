ZeekJS-Redis
=================================

**Work in Progress...**

This [zkg](https://docs.zeek.org/projects/package-manager/en/stable/zkg.html) package implements a method of parsing [Zeek](https://zeek.org/) logs to [Redis](https://redis.io/).

[ZeekJS](https://zeekjs.readthedocs.io) is utilised to achieve this. The [net](https://nodejs.org/api/net.html) module from [Node.js](https://nodejs.org/) is used to create a socket over which data is sent from Zeek to Redis. 

- [**redisClient.js**](https://github.com/mbispham/zeekjs-redis/blob/main/scripts/redisClient.js): Creates a Redis client instance
- [**socketServer.js**](https://github.com/mbispham/zeekjs-redis/blob/main/scripts/socketServer.js): Establishes a socket to handle and process data from Zeek to Redis
- [**ZeekRedis.js**](https://github.com/mbispham/zeekjs-redis/blob/main/scripts/ZeekRedis.js): Hooks into Zeek logs and sends the logs to a Redis server

The intent with the development of this package was to "kick the tyres" and gain familiarity with ZeekJS.
The overall experience was that you could quickly have a working version of features that would have taken me much longer to develop in Zeek's standard C++ plugin architecture. Time saved enabled more focus on implementing some config options such as a flag to install required Node.js packages during the build.  

### Example

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

### Build

Install with zkg:
```
zkg install https://github.com/mbispham/zeekjs-redis.git
```

The following options can be used to aid with creating a suitable environmental for the package

    --install-npm-dependencies Install npm dependencies from package.json
    --install-redis-cli        Install redis-cli if not present
    --start-redis              Setup a local redis server
    --node-env=ENV             Node environment (prod or dev)
    --file-log-level=LEVEL     File log level (e.g., info, error)
    --redis-host=HOST          Redis Host
    --redis-port=PORT          Redis Client Port (integer)
    --redis-password=PASSWORD  Redis Password
    --days-valid=DAYS          Validity days for Redis cert
    --redis-cert-path=PATH     Redis Cert Path
    --redis-conf-path=PATH     Redis Conf Path
    --socket-host=HOST         Socket Host
    --socket-port=PORT         Socket Port (integer)

### Filtered Log Usage

Rather than sending all Zeek logs to Redis a common use case could be to output a section of a specific log type.
Let's show how to implement that...

...TODO - Add example of filtered log

### Production Worthy?

This package was not written with the intention of being running in production envs. Some considerations below if you want to use it in such an environment.

- **Security**:
  - No validation or sanitization for Zeek derived data that enters Redis has been implemented.
  - Ensure your redis server is not accessible from the internet - unless that is a desired feature.
  - The Redis Password is written out to a .env file - consider a more secure implementation
- **Persistence**: 
  - No persistence is configured
- **Replication**
  - No data is replicated which may be a consideration for a production environment
- **Hardware**
  - Ensure you have enough RAM - redis is memory intensive - Zeek can churn out a lot of data
- **Performance** 
  - Single threaded

### Acknowledgements

- [**Christian Kreibich**](https://github.com/ckreibich): Zeek project technical lead
- [**Arne Welzel**](https://github.com/awelzel): Main author of [ZeekJS](https://zeekjs.readthedocs.io)
- [**Simeon Miteff**](https://github.com/simeonmiteff): The structure of this project was inspired by Simeon's work on integrating telegram with Zeek [zeekjs-notice-telegram](https://github.com/corelight/zeekjs-notice-telegram)
- [**WRCCDC**](https://wrccdc.org): test.pcap is carved from a publicly available trace released under a [creative commons license](https://creativecommons.org/licenses/by-sa/4.0/)

### License 
zeekjs-redis is free and open-source software licensed under the [3-clause BSD license](LICENSE).

### Feedback and Contributions
Feedback and/or contributions are welcome if anyone finds this package useful. 
