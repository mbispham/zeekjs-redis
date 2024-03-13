# @TEST-EXEC: zeek -NN zeekjsredis::isight |sed -e 's/version.*)/version)/g' >output
# @TEST-EXEC: btest-diff output
