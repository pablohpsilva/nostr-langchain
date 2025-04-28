const crypto = require("crypto");
const { nip19 } = require("nostr-tools");

// Generate a new private key
const generatePrivateKey = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Get public key from private key
const getPublicKey = (privateKey) => {
  return nip19.npubEncode(Buffer.from(privateKey, "hex"));
};

// Generate keys
const privateKey = generatePrivateKey();
const publicKey = getPublicKey(privateKey);

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
console.log(`NOSTR_PRIVATE_KEY=${privateKey}`);
console.log(
  "RELAYS=wss://relay.damus.io,wss://relay.nostr.info,wss://nostr-pub.wellorder.net"
);
console.log("BOT_NAME=NostrBot");
