#!/bin/bash

set -eu

mkdir -p "${HOME}/.tedious"

cat >"${HOME}/.tedious/test-connection.json" <<EOF
{
  "config": {
    "server": "aganeshen-tediousjs-testing.database.windows.net",
    "authentication": {
      "type": "azure-active-directory-msi-vm",
      "options": {}
    },
    "options": {
      "database": "test",
      "trustServerCertificate": true
    }
  }
}
EOF
