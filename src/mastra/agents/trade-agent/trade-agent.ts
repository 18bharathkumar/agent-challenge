import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import {
  saveUserPublicKeyTool,
  checkBalanceByPublicKeyTool,
  checkBalanceByNameTool,
  sendSolToPublicKeyTool,
  sendSolToNameTool,
  getAllSavedPublicKeysTool,
  checkMybalance
} from "./trade-tool";
import { model } from "../../config";
import { redis } from "./memory";
import { tradeAgentInstructions } from "./instructions";

// If you need utility functions, import from trade-utils.ts
// import { isValidSolanaPublicKey, getPublicKeyBuffer, getSavedPublicKeyByName, getAllSavedPublicKeys } from "./trade-utils";

const name = "Trade Agent";

const instructions = `
Capabilities:
- Save a Solana public key under a user-specified name (no duplicate names allowed).
- Check the SOL balance of a public key or a saved name.
- Send SOL to a public key or a saved name.
- List all saved names and their associated public keys.

Behavior:
- When saving a public key, use saveUserPublicKeyTool. If the name exists, inform the user.
- When checking balance:
  * If the user provides a valid Solana public key, use checkBalanceByPublicKeyTool.
  * If the user provides a name, always use checkBalanceByNameTool with the name as the argument.
  * Never use checkBalanceByPublicKeyTool with a name or an unknown value.
  * Never guess or transform names into public keys.
  * If a name is not found, inform the user and suggest they add it first.
- When sending SOL, use sendSolToPublicKeyTool if a public key is provided, or sendSolToNameTool if a name is provided.
- To list all saved names and public keys, or when the user asks to 'show contact' or similar, use getAllSavedPublicKeysTool.
`;


export const tradeAgent = new Agent({
  name,
  instructions: tradeAgentInstructions,
  model,
  tools: {
    saveUserPublicKeyTool,
    checkBalanceByPublicKeyTool,
    checkBalanceByNameTool,
    sendSolToPublicKeyTool,
    sendSolToNameTool,
    getAllSavedPublicKeysTool,
    checkMybalance
  },

  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db",
    }),
  }),
});
