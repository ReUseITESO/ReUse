#!/bin/sh
set -e

exec npm run start -- -p ${PORT:-3000}
