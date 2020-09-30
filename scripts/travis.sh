set -e
# if this build was triggered via a cron job, run tests on sauce labs
if [ "${TRAVIS_EVENT_TYPE}" = "cron" ] ; then
    yarn test:e2e
else
    # run the lint, unit and e2e tests (on chrome headless)
    yarn test
fi
