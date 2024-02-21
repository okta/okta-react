# Okta React Router DOM v6 createBrowserRouter Sample App

Sample app to demonstrate how to use `react-router-dom` `v6.4+` with `@okta/okta-react`.  
Uses `createBrowserRouter` that [supports new data APIs](https://reactrouter.com/en/main/routers/picking-a-router#using-v64-data-apis).  
Demonstrated usage of [loader](https://reactrouter.com/en/main/route/loader) and [Await](https://reactrouter.com/en/main/components/await) with `@okta/okta-react`. 



## Install
```bash
$ git clone https://github.com/okta/okta-react.git
$ yarn
```

## Configure
Add an `testenv` file with the following fields
```
CLIENT_ID=<YOUR CLIENT ID>
ISSUER=<YOUR ISSUER URL>
```

## Start
```bash
$ yarn workspace @okta/samples.react.react-router-dom-v6-data start
```
OR
```bash
$ cd ./samples/react-router-dom-v6-data
$ yarn start
```
