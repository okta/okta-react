set -e
# if this build was triggered via a cron job, run tests on sauce labs
if [ "${TRAVIS_EVENT_TYPE}" = "cron" ] ; then
	yarn pretest
    yarn test:e2e
else
    # run the lint, unit tests
    yarn lint
    yarn test:unit
fi
