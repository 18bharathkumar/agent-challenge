import { Agent } from "@mastra/core/agent";
import { model } from "../../config";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { getSolBalanceTool , getAccountInfoTool , getTokenSupplyTool ,getTransactionTool ,createTokenTool ,airdropSOLTool} from "./tools";
import { instructions } from "./instruction";

const name = "Solana-SPL-Agent";

const memory = new Memory({
    storage: new LibSQLStore({
        url: "file:../mastra.db", // Or your database URL
    }),
});


export const SolanaSPLAgent = new Agent({
	name,
	instructions,
	model,
	tools: { 
            GetSolBalance:getSolBalanceTool,
            AirdropSOL:airdropSOLTool,
            CreateToken:createTokenTool,
            GetAccountInfo:getAccountInfoTool,
            GetTransactionInfo:getTransactionTool,
            GetTokenSupply:getTokenSupplyTool
       },
      memory
});
