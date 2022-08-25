#!/bin/bash

# A command that modifies the package.json of all workspaces that depdend on @okta/okta-auth-js to use a consistent version

workspaces=$(yarn -s workspaces info | jq 'map(..|objects|select(.location).location)[1:] | @sh' | tr -d \'\")

for loc in $workspaces
do
  echo $loc
  json=$(cat $loc/package.json |  jq --arg version $@ 'if .dependencies | has("@okta/okta-auth-js") then .dependencies["@okta/okta-auth-js"] = $version else . end') && \
  echo -E "${json}" > $loc/package.json
done