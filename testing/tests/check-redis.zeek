# @TEST-EXEC: ./$SCRIPTS/check-redis |sed -e 's/installed/set up/g' >output
# @TEST-EXEC: btest-diff output
