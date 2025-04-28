"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const nostr_tools_1 = require("nostr-tools");
// Initialize dotenv
dotenv_1.default.config();
// Configuration
const privateKey = process.env.NOSTR_PRIVATE_KEY || "";
const relayUrls = process.env.RELAYS
    ? process.env.RELAYS.split(",")
    : ["wss://relay.damus.io"];
const botName = process.env.BOT_NAME || "NostrBot";
if (!privateKey) {
    console.error("Error: NOSTR_PRIVATE_KEY is not set in .env file");
    console.log("If you need to generate a key, run: npx ts-node src/generate-key.ts");
    process.exit(1);
}
// Get public key from private key
const getPublicKey = (privateKey) => {
    const pubkeyHex = Buffer.from(privateKey, "hex").toString("hex");
    return nostr_tools_1.nip19.npubEncode(pubkeyHex);
};
// Create and sign an event
const createSignedEvent = (content, kind = 1, tags = []) => {
    const event = {
        kind,
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content,
        pubkey: Buffer.from(privateKey, "hex").toString("hex"),
    };
    event.id = (0, nostr_tools_1.getEventHash)(event);
    event.sig = (0, nostr_tools_1.signEvent)(event, privateKey);
    return event;
};
// Connect to relays
const relays = [];
const connectToRelays = async () => {
    console.log(`Connecting to ${relayUrls.length} relays...`);
    for (const url of relayUrls) {
        try {
            const relay = (0, nostr_tools_1.relayInit)(url);
            relay.on("connect", () => {
                console.log(`Connected to ${url}`);
            });
            relay.on("error", () => {
                console.log(`Failed to connect to ${url}`);
            });
            await relay.connect();
            relays.push(relay);
        }
        catch (error) {
            const err = error;
            console.error(`Error connecting to ${url}:`, err.message);
        }
    }
    console.log(`Connected to ${relays.length} relays`);
};
// Set up event subscription
const setupSubscription = () => {
    for (const relay of relays) {
        const sub = relay.sub([
            {
                kinds: [1],
                "#p": [Buffer.from(privateKey, "hex").toString("hex")],
            },
        ]);
        sub.on("event", (event) => {
            handleEvent(event, relay);
        });
        sub.on("eose", () => {
            console.log(`Subscription to ${relay.url} is active and up to date`);
        });
    }
};
// Handle incoming events
const handleEvent = async (event, relay) => {
    console.log(`Received event from ${event.pubkey.substring(0, 8)}...`);
    // Check if the event mentions our bot
    if (event.content.toLowerCase().includes(botName.toLowerCase())) {
        const response = `Hello @${event.pubkey.substring(0, 8)}! I'm ${botName}, a Nostr bot. I received your message: "${event.content}"`;
        // Create a response event
        const responseEvent = createSignedEvent(response, 1, [
            ["p", event.pubkey],
            ["e", event.id],
        ]);
        // Publish the response
        await publishEvent(responseEvent);
    }
};
// Publish an event to all connected relays
const publishEvent = async (event) => {
    console.log("Publishing event:", event.content);
    const promises = relays.map((relay) => new Promise((resolve) => {
        // const pub = relay.publish(event as Event) as PublishResponse;
        relay
            .publish(event)
            .then(() => {
            console.log(`Event published to ${relay.url}`);
            resolve();
        })
            .catch((reason) => {
            console.log(`Failed to publish to ${relay.url}: ${reason}`);
            resolve();
        });
    }));
    await Promise.all(promises);
};
// Main function
const main = async () => {
    console.log(`Starting ${botName}...`);
    await connectToRelays();
    if (relays.length === 0) {
        console.error("Error: Could not connect to any relays");
        process.exit(1);
    }
    // Announce the bot is online
    const startupEvent = createSignedEvent(`${botName} is now online! 🤖`, 1);
    await publishEvent(startupEvent);
    // Set up subscription to listen for mentions
    setupSubscription();
    console.log(`${botName} is running and listening for events`);
};
// Start the bot
main().catch((error) => {
    console.error("Error in main function:", error);
    process.exit(1);
});
