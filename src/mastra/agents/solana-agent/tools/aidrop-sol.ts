import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { getNetworkFromRpcUrl, isValidBase58, isAirdropSupported } from "./network-utils";


interface AirdropSOLInput {
amount?: number;
pubkey?: string;
}

interface AirdropSOLOutput {
signature: string;
}

export const airdropSOLTool = createTool({
id: "airdropSOL",
description: "Airdrop SOL to the user's wallet (works on devnet/testnet/localhost).",
inputSchema: z.object({ amount: z.number().optional().default(1), pubkey: z.string().optional() }),
outputSchema: z.object({ signature: z.string() }),

execute: async (args: any): Promise<AirdropSOLOutput> => {
    // Accept input directly (not from args.context)
    const input = args.context;

    // Ensure amount is always a valid number (default to 1 if null/undefined)
    let { amount, pubkey } = input;
    const solAmount = (amount == null ? 1 : amount);
    if (typeof solAmount !== 'number' || isNaN(solAmount) || solAmount <= 0) {
        throw new Error("Amount must be a positive number");
    }
    
    const rpcUrl = "https://api.devnet.solana.com";
    if (!rpcUrl) {
    throw new Error("Missing SOLANA_RPC_URL in environment variables");
    }
    
    const conn = new Connection(rpcUrl, "confirmed");
    const network = getNetworkFromRpcUrl(rpcUrl);
    console.log(`Connected to Solana ${network} network`);
    
    // Check if airdrop is supported on this network
    if (!isAirdropSupported(network)) {
    throw new Error("SOL airdrop is not supported on mainnet. Please use devnet, testnet, or localhost for testing.");
    }
        
    let targetPubkey: PublicKey;
    if (pubkey) {
    if (!isValidBase58(pubkey)) {
        throw new Error("Invalid pubkey: not a valid Solana base58 address.");
    }
    targetPubkey = new PublicKey(pubkey);
    } else {
    // Support both base58 and JSON array secret keys
    let user: Keypair;
    try {
        user = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.SOLANA_SECRET_KEY!)));
    } catch {
        user = Keypair.fromSecretKey(bs58.decode(process.env.SOLANA_SECRET_KEY!));
    }
    if (!isValidBase58(user.publicKey.toBase58())) {
        throw new Error("Invalid user public key: not a valid Solana base58 address.");
    }
    targetPubkey = user.publicKey;
    }
    
    console.log(`Airdropping ${solAmount} SOL to ${targetPubkey.toBase58()} on ${network}`);
    const sig = await conn.requestAirdrop(targetPubkey, solAmount * LAMPORTS_PER_SOL);
    await conn.confirmTransaction(sig);
    console.log(`Airdrop successful! Signature: ${sig}`);
    return { signature: sig };
},
});
