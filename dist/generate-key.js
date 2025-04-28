"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
const nostr_tools_1 = require("nostr-tools");
// Generate a new private key
const generatePrivateKey = () => {
    return crypto.randomBytes(32).toString("hex");
};
// Get public key from private key
const getPublicKey = (privateKey) => {
    const pubkeyHex = Buffer.from(privateKey, "hex").toString("hex");
    return nostr_tools_1.nip19.npubEncode(pubkeyHex);
};
// Generate keys
const privateKey = generatePrivateKey();
const publicKey = getPublicKey(privateKey);
console.log("Generated Nostr Keys:");
console.log("---------------------");
console.log(`Private key (hex): ${privateKey}`);
console.log(`Public key (npub): ${publicKey}`);
console.log("\nIMPORTANT: Save your private key securely and never share it!");
console.log("Add your private key to your .env file as NOSTR_PRIVATE_KEY=yourPrivateKey");
// Create a sample .env file content
console.log("\nSample .env file content:");
console.log("------------------------");
console.log(`NOSTR_PRIVATE_KEY=${privateKey}`);
console.log("RELAYS=wss://relay.damus.io,wss://relay.nostr.info,wss://nostr-pub.wellorder.net");
console.log("BOT_NAME=NostrBot");
