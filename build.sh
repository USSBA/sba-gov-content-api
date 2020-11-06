#!/bin/bash
mkdir build
mkdir workspace
cp package.json build/
cp -R src/* build/
cd build
find . -name '*.test.js' -delete
find . -name '*.integration-test.js' -delete
npm i --prod --silent
rm package.json
zip -r -q ../workspace/sba-gov-content-api.zip .
cd ..
rm -rf build