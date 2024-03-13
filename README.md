ZeekJS-Redis
=================================

**Work in Progress...**

This [zkg](https://docs.zeek.org/projects/package-manager/en/stable/zkg.html) package implements a method of parsing [Zeek](https://zeek.org/) logs to [Redis](https://redis.io/).

[ZeekJS](https://zeekjs.readthedocs.io) is utilised to achieve this. A local Unix socket is used to enable data transmission from Zeek to Redis. 

The intent with the development of this package was to "[kick the tyres](https://dictionary.cambridge.org/dictionary/english/kick-the-tires)" and gain familiarity with ZeekJS. The overall experience was positive; it was possible to create a working version of features that would have taken me much longer to develop in Zeek's standard C++ plugin architecture. Time saved enabled implemention of more involved config options.  

### Example

```shell
/opt/zeek/var/lib/zkg/clones/package/zeekjs-redis.git# zeek -C LogAscii::use_json=T -r testing/Traces/zeekjs-redis-test.pcap ./scripts/index.js
```
```shell
/opt/zeek/var/lib/zkg/clones/package/zeekjs-redis.git# redis-cli -s /var/run/redis/redis.sock
```
```
redis /var/run/redis/redis.sock> KEYS *
1) "zeek_conn_logs"
```
```
redis /var/run/redis/redis.sock> LRANGE zeek_conn_logs 0 -1
1)  "{\"ts\":1616775350.763199,\"uid\":\"CNT4R81EW9Y2E6nXLl\",\"id\":{\"orig_h\":\"192.168.220.35\",\"orig_p\":53537,\"resp_h\":\"192.168.220.1\",\"resp_p\":31981},\"proto\":\"tcp\",\"conn_state\":\"S0\",\"local_orig\":true,\"local_resp\":true,\"missed_bytes\":0,\"history\":\"S\",\"orig_pkts\":1,\"orig_ip_bytes\":44,\"resp_pkts\":0,\"resp_ip_bytes\":0}"
...
24) "{\"ts\":...
```

### Build

Install with zkg:
```
zkg install https://github.com/mbispham/zeekjs-redis.git
```

The following options can be used to create a suitable environmental for the package

    --install-npm-dependencies Install npm dependencies from package.json (N/y)
    --install-redis-cli        Install redis-cli if not present (N/y)
    --redis-conf-path=PATH     The path to Redis config (Default = /etc/redis/redis.conf)
    --redis-socket-path=PATH   The path to Redis socket (Default = /var/run/redis/redis.sock)
    --start-redis-server       Start redis server (N/y)

If you want to install npm dependencies separately, use default settings, or modify scipts/.env directly install with:
```
zkg install https://github.com/mbispham/zeekjs-redis.git --force
```

### Filtered Log Usage

Rather than sending all Zeek logs to Redis a common use case could be to output a section of a specific log type.
Let's show how to implement that...

...TODO - Add example of filtered log

### Acknowledgements

- [**Christian Kreibich**](https://github.com/ckreibich): Zeek project technical lead
- [**Arne Welzel**](https://github.com/awelzel): Main author of [ZeekJS](https://zeekjs.readthedocs.io)
- [**Simeon Miteff**](https://github.com/simeonmiteff): The structure of this project was inspired by Simeon's work on integrating telegram with Zeek [zeekjs-notice-telegram](https://github.com/corelight/zeekjs-notice-telegram)
- [**WRCCDC**](https://wrccdc.org): test.pcap is carved from a publicly available trace released under a [creative commons license](https://creativecommons.org/licenses/by-sa/4.0/)

### License 
zeekjs-redis is free and open-source software licensed under the [3-clause BSD license](LICENSE)

### Feedback and Contributions
Feedback and/or contributions are welcome if anyone finds this package useful 
