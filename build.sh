#!/bin/bash

npm install

export JAVA_HOME="C:/Users/john/Downloads/openjdk-21_windows-x64_bin/jdk-21"

cp /c/x3d-code/www.web3d.org/x3d/stylesheets/X3dToJson.xslt lib/stylesheets

# generate helpful JavaScript classes
#pushd src/main/python
#py autoclass.py
#py nodeclasses.py
#py fieldTypesGenerator.py
#py mapToMethodGenerator.py
#popd

pushd shell
bash several.sh ../data/JinLOA4.x3d ../data/Jin_LOA4-V2SingleMesh.x3d
popd
