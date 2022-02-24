# Okta React Router DOM v6 Sample App

Sample app to demonstrate how to use `react-router-dom` v6 with `@okta/okta-react`.

**NOTE:** This sample is not runnable before fixing issue [#187](https://github.com/okta/okta-react/issues/187). See [this comment](https://github.com/okta/okta-react/issues/187#issuecomment-1043059092) for potential workaround.

## Install
```bash
$ git clone https://github.com/okta/okta-react.git
$ yarn
```

## Configure
Add an `testenv` file with the following fields
```
SPA_CLIENT_ID=<YOUR CLIENT ID>
ISSUER=<YOUR ISSUER URL>
```

## Start
```bash
$ yarn workspace @okta/samples.react.react-router-dom-v6 start
```
OR
```bash
$ cd ./samples/react-router-dom-v6
$ yarn start
```
