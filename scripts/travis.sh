set -e
# if this build was triggered via a cron job, run tests on sauce labs
if [ "${TRAVIS_EVENT_TYPE}" = "cron" ] ; then
	yarn pretest
    yarn test:e2e
else
    # run the lint, unit and e2e tests (on chrome headless)
    rm -f ./node_modules/@okta/okta-react
    mkdir ./node_modules/@okta/okta-react
    cp -r ./dist/ ./node_modules/@okta/okta-react/
    yarn test
fi
