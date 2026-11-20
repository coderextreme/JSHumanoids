#!/bin/bash

. ../shell/classpath

${GRAALJS} --experimental-options --polyglot --vm.Djs.allowAllAccess=true --vm.Xss1g --vm.Xmx4g --jvm --vm.classpath="${GRAAL_CLASSPATH}" -f "$1" -f ../graaljs/net/coderextreme/rescale.js
