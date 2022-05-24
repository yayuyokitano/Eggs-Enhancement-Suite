#yarn web-ext sign -s build/firefox -a build --api-key="$(head -n 1 key.txt)" --api-secret="$(tail -n 1 key.txt)"
npm run build
[ -f build/firefox.zip ] && rm build/firefox.zip
zip -r build/firefox.zip build/firefox -j
yarn mocha --require ts-node/register test/**/*.test.ts --timeout 60000