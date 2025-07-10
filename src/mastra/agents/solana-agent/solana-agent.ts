import { Agent } from "@mastra/core/agent";
import { model } from "../../config";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { getSolBalanceTool , getAccountInfoTool , getTokenSupplyTool ,getTransactionTool ,createTokenTool , getTokenAccountsByOwnerTool, getTokenLargestAccountsTool ,deployToNosanaTool } from "./tools";
import { instructions } from "./instruction";

const name = "Solana-Agent";

const memory = new Memory({
    storage: new LibSQLStore({
        url: "file:../mastra.db", // Or your database URL
    }),
});


export const SolanaAgent = new Agent({
	name,
	instructions,
	model,
	tools: { 
            GetSolBalance:getSolBalanceTool,
            // CreateToken:createTokenTool,
            // GetAccountInfo:getAccountInfoTool,
            // GetTransactionInfo:getTransactionTool,
            // GetTokenSupply:getTokenSupplyTool,
            // GetTokenAccountsByOwner:getTokenAccountsByOwnerTool,
            // GetTokenLargetAccounts:getTokenLargestAccountsTool,
            DeployToNosanaNetwork:deployToNosanaTool
       },
      memory
});
