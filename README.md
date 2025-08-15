## Build

To build simply run `npm run build` which assumed you have `emcc` installed. The make file also assumed linux environment to execute the scripts. Alternatively, you can run via docker by executing `npm run build:docker`. The dist folder will be created with the artifacts. If that folder was built by docker, it will most likely retain permission on the docker user (the clean command, for example, may not work properly because of that).

## Pack

After building, `npm pack` will create a gziped tar with the artifact which can be, in turn, installed localy in any node project (or worker/bare) by running `npm install ${name_of_artifact}`.

## Test

After building, `npm run test` will run the unit tests.

## Release

To create a release, simply tag the current HEAD as `vx.x.x` e.g.: v0.0.2 and the push to the github remote. It is expected that the contents of [package.json](./package.json) will be aligned with the tag.

```
blake3$ git tag -a v0.0.1 -m "Release version 0.0.1"
blake3$ git push origin v0.0.1
```