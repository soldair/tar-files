#!/bin/bash
cd `dirname $0`
if [ ! -f "./test/fixture.tgz" ]; then
  curl http://registry.npmjs.org/npm/-/npm-2.14.0.tgz > ./test/fixture.tgz
fi

tape ./test/*.js
e=$?

rm test/*.md 2> /dev/null

exit $e
