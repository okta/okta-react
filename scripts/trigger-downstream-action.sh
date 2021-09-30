echo $1
curl -H "Authorization: token $1" -H "Accept: application/vnd.github.v3+json" -H "Content-Type: application/json" https://api.github.com/repos/okta/samples-js-react/dispatches -d '{ "event_type": "custom_event_type"}'
