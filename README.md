# Homelab Dashboard

This is meant to be a simple, personal dashboard for my little laptop homelab so I can manage some of my cool things at home.

Features
- Single-admin authentication and login using cookie-based JWT

## Usage

This server runs on `bun`, because I'm tired of `npm`, lol.

First, install the dependencies:
```sh
$ bun install
```

Then, in the root of the repo, and each package, add `.env` files where necessary and follow the examples in `example.env`.

Then run the server:
```sh
$ bun start
```

Optionally, start it in watch mode for hard reloads on changes:
```sh
$ bun start:watch
```

To run in dev mode, run the following:
```sh
$ bun dev
```