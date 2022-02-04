# Okta Reach Router Test App

## Install
```bash
$ git clone https://github.com/okta/okta-react.git
$ yarn
```

## Configure
Add an `testenv` file (at the repo root directory) with the following fields
```
SPA_CLIENT_ID=<YOUR CLIENT ID>
ISSUER=<YOUR ISSUER URL>
```

## Start
```bash
$ yarn workspace @okta/test.app.reach-router start
```
OR
```bash
$ cd ./test/apps/react-routing/reach-router
$ yarn start
```
