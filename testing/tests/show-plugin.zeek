# @TEST-EXEC: zeek -NN zeekjs::redis |sed -e 's/version.*)/version)/g' >output
# @TEST-EXEC: btest-diff output
