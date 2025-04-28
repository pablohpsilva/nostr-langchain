# Nostr Bot

A simple bot for the [Nostr](https://nostr.com/) protocol that responds to mentions, built with TypeScript.

## Setup

1. Clone this repository
2. Install [pnpm](https://pnpm.io/installation) if you haven't already:
   ```bash
   npm install -g pnpm
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Generate a new Nostr private key:
   ```bash
   pnpm generate-key
   ```
5. Create a `.env` file in the root directory with the following content (you can copy this from the output of the previous command):
   ```
   NOSTR_PUBLIC_KEY=your_public_key_here
   NOSTR_PRIVATE_KEY=your_private_key_here
   RELAYS=wss://relay.damus.io,wss://relay.nostr.info,wss://nostr-pub.wellorder.net
   BOT_NAME=NostrBot
   ```
6. Build the TypeScript code:
   ```bash
   pnpm build
   ```
7. Start the bot:
   ```bash
   pnpm start
   ```

## Development

For development, you can use the watch mode to automatically recompile the TypeScript code when changes are made:

```bash
pnpm watch
```

And in another terminal window, run the bot:

```bash
pnpm dev
```

## How It Works

- The bot connects to the specified Nostr relays
- It listens for notes (kind 1 events) that mention its public key
- When it receives a mention, it responds with a greeting

## Customization

You can customize the bot's behavior by editing the `handleEvent` function in `src/index.ts`. For example, you can add commands or integrate with other services.

## Package Manager

This project uses [pnpm](https://pnpm.io/) as its package manager. Please do not use npm or yarn to install dependencies, as this may lead to unexpected behavior.

## License

MIT
