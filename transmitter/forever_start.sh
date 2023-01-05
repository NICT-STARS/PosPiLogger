#!/bin/sh

cd `dirname $0`
mkdir log 2>/dev/null
forever start -m 0 -a -l `pwd`/log/app.log --sourceDir `pwd` --killSignal SIGINT app.js
