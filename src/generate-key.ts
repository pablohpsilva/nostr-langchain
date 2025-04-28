import * as crypto from "crypto";
import { nip19 } from "nostr-tools";

// Generate a new private key
const generatePrivateKey = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

// Get public key from private key
const getPublicKey = (privateKey: string): string => {
  const pubkeyHex = Buffer.from(privateKey, "hex").toString("hex");
  return nip19.npubEncode(pubkeyHex);
};

// Generate keys
const privateKey: string = generatePrivateKey();
const publicKey: string = getPublicKey(privateKey);

console.log("Generated Nostr Keys:");
console.log("---------------------");
console.log(`Private key (hex): ${privateKey}`);
console.log(`Public key (npub): ${publicKey}`);
console.log("\nIMPORTANT: Save your private key securely and never share it!");
console.log(
  "Add your private key to your .env file as NOSTR_PRIVATE_KEY=yourPrivateKey"
);

// Create a sample .env file content
console.log("\nSample .env file content:");
console.log("------------------------");
console.log(`NOSTR_PUBLIC_KEY=${publicKey}`);
console.log(`NOSTR_PRIVATE_KEY=${privateKey}`);
console.log(
  "RELAYS=wss://relay.damus.io,wss://relay.nostr.info,wss://nostr-pub.wellorder.net"
);
console.log("BOT_NAME=NostrBot");
