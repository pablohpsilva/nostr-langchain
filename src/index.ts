import dotenv from "dotenv";
import {
  relayInit,
  getEventHash,
  nip19,
  Event,
  Relay,
  getSignature,
} from "nostr-tools";

// Initialize dotenv
dotenv.config();

// Define interfaces
interface NostrEvent {
  kind: number;
  created_at: number;
  tags: string[][];
  content: string;
  pubkey: string;
  id?: string;
  sig?: string;
}

const privateKey: string = process.env.NOSTR_PRIVATE_KEY || "";
const relayUrls: string[] = process.env.RELAYS
  ? process.env.RELAYS.split(",")
  : ["wss://relay.damus.io"];
const botName: string = process.env.BOT_NAME || "NostrBot";

if (!privateKey) {
  console.error("Error: NOSTR_PRIVATE_KEY is not set in .env file");
  console.log(
    "If you need to generate a key, run: npx ts-node src/generate-key.ts"
  );
  process.exit(1);
}

// Get public key from private key
const getPublicKey = (privateKey: string): string => {
  const pubkeyHex = Buffer.from(privateKey, "hex").toString("hex");
  return nip19.npubEncode(pubkeyHex);
};

// Create and sign an event
const createSignedEvent = (
  content: string,
  kind: number = 1,
  tags: string[][] = []
): NostrEvent => {
  const event: NostrEvent = {
    kind,
    created_at: Math.floor(Date.now() / 1000),
    tags,
    content,
    pubkey: Buffer.from(privateKey, "hex").toString("hex"),
  };

  event.id = getEventHash(event as Event);
  event.sig = getSignature(event as Event, privateKey);

  return event;
};

// Connect to relays
const relays: Relay[] = [];
const connectToRelays = async (): Promise<void> => {
  console.log(`Connecting to ${relayUrls.length} relays...`);

  for (const url of relayUrls) {
    try {
      const relay = relayInit(url);
      relay.on("connect", () => {
        console.log(`Connected to ${url}`);
      });
      relay.on("error", () => {
        console.log(`Failed to connect to ${url}`);
      });

      await relay.connect();
      relays.push(relay);
    } catch (error) {
      const err = error as Error;
      console.error(`Error connecting to ${url}:`, err.message);
    }
  }

  console.log(`Connected to ${relays.length} relays`);
};

// Set up event subscription
const setupSubscription = (): void => {
  for (const relay of relays) {
    const sub = relay.sub([
      {
        kinds: [1],
        "#p": [Buffer.from(privateKey, "hex").toString("hex")],
      },
    ]);

    sub.on("event", (event: Event) => {
      handleEvent(event, relay);
    });

    sub.on("eose", () => {
      console.log(`Subscription to ${relay.url} is active and up to date`);
    });
  }
};

// Handle incoming events
const handleEvent = async (event: Event, relay: Relay): Promise<void> => {
  console.log(`Received event from ${event.pubkey.substring(0, 8)}...`);

  // Check if the event mentions our bot
  if (event.content.toLowerCase().includes(botName.toLowerCase())) {
    const response = `Hello @${event.pubkey.substring(
      0,
      8
    )}! I'm ${botName}, a Nostr bot. I received your message: "${
      event.content
    }"`;

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
const publishEvent = async (event: NostrEvent): Promise<void> => {
  console.log("Publishing event:", event.content);

  const promises = relays.map(
    (relay) =>
      new Promise<void>((resolve) => {
        // const pub = relay.publish(event as Event) as PublishResponse;
        relay
          .publish(event as Event)
          .then(() => {
            console.log(`Event published to ${relay.url}`);
            resolve();
          })
          .catch((reason: string) => {
            console.log(`Failed to publish to ${relay.url}: ${reason}`);
            resolve();
          });
      })
  );

  await Promise.all(promises);
};

// Main function
const main = async (): Promise<void> => {
  console.log(`Starting ${botName}...`);
  await connectToRelays();

  if (relays.length === 0) {
    console.error("Error: Could not connect to any relays");
    process.exit(1);
  }

  // Announce the bot is online
  const startupEvent = createSignedEvent(`${botName} is now online! 🤖 `, 1);
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
