# nuswhispers-dump-json
> Dumps NUSWhispers public confessions to JSON format. Not meant to be used in production.

This runs a SSH tunnel into a server (virtual machine), connects to MySQL database and dumps all featured and published confessions. Connection configurations can be adjusted by using an `.env` file (see `.env-example`).
