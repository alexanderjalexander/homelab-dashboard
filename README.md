# Express WakeOnLan

This is meant to be a simple, personal wake-on-lan utility for my little laptop homelab so I can turn things off and on.

Features
- Single-admin authentication and login using express-session.
  - Admin and passwords created through a

## Usage

This server runs on `npm`.

First, install the dependencies:
```sh
$ npm install
```

Then, in the root of the repo, and each package, add `.env` files where necessary and follow the examples in `example.env`.

Then run the server:
```sh
$ npm start
```