ZeekJS-Redis
=================================

***work in progress*** ...

This zkg package implements a method of parsing Zeek logs to Redis.

`# zeek -r test.pcap ./index.js`

```
# redis-cli
127.0.0.1:6379> KEYS *
1) "zeek_files_logs"
2) "zeek_conn_logs"
3) "zeek_x509_logs"
4) "zeek_ocsp_logs"
5) "zeek_dns_logs"
6) "zeek_ssl_logs"
127.0.0.1:6379> LRANGE  zeek_ssl_logs 1 1
1) "{\"ts\":1616842959.548026,\"uid\":\"CRBuXY2wUBdXhpiS55\",\"id.orig_h\":\"192.168.220.7\",\"id.orig_p\":55224,\"id.resp_h\":\"93.184.215.201\",\"id.resp_p\":443,\"version\":\"TLSv10\",\"cipher\":\"TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA\",\"curve\":\"secp256r1\",\"server_name\":\"software-download.office.microsoft.com\",\"resumed\":false,\"established\":true,\"ssl_history\":\"CsxuknGIi\",\"cert_chain_fps\":[\"cd29bc427d93bc4453d129a294cfd5e082eacbf3fe9a19b7718a50422b6e6cc5\",\"c1ad7778796d20bca65c889a2655021156528bb62ff5fa43e1b8e5a83e3d2eaa\",\"4348a0e9444c78cb265e058d5e8944b4d84f9662bd26db257f8934a443c70161\"],\"client_cert_chain_fps\":[],\"subject\":\"CN=*.vo.msecnd.net,O=Microsoft Corporation,L=Redmond,ST=Washington,C=US\",\"issuer\":\"CN=DigiCert SHA2 Secure Server CA,O=DigiCert Inc,C=US\",\"sni_matches_cert\":true}"
```

- `index.js` utilizes Node.js's net module to send Zeek logs to a Redis server over a socket.
- `ZeekRedis.js` - hooks into Zeek logs, flattens the JSON and sends the logs to a Redis server.
- `redisClient.js` - creates a redis client. A `.env` file can be updated to change the default `hostname:port` of the redis server.

### Dependencies

- [Node.js](https://nodejs.org/)
- [Redis](https://redis.io/) 
- [Winston](https://github.com/winstonjs/winston) - For logging.
- [Dotenv](https://github.com/motdotla/dotenv) - For loading environment variables from `.env` file.
- Zeek must be on `$PATH` - [Zeek Documentation](https://docs.zeek.org/en/current/install.html#configuring-the-run-time-environment)

### Warning

Currently, no validation or sanitization for Zeek derived data that enters Redis has been implemented.

### Acknowledgements

- [**Christian Kreibich**](https://github.com/ckreibich): Zeek project technical lead
- [**Arne Welzel**](https://github.com/awelzel): Main author of [ZeekJS](https://zeekjs.readthedocs.io)
- [**Simeon Miteff**](https://github.com/simeonmiteff): The structure of this project was inspired by Simeon's work on integrating telegram with Zeek [zeekjs-notice-telegram](https://github.com/corelight/zeekjs-notice-telegram)