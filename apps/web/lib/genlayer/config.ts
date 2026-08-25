import { studionet } from "genlayer-js/chains";

export const targetChain = studionet;
export const EXPECTED_CHAIN_ID = 61999;
export const EXPECTED_CHAIN_HEX = `0x${EXPECTED_CHAIN_ID.toString(16)}`;
export const GENLAYER_ENDPOINT = process.env.NEXT_PUBLIC_GENLAYER_ENDPOINT ?? "https://studio.genlayer.com/api";
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_LABELLEDGER_CONTRACT ?? "") as `0x${string}` | "";
export const DATA_MODE = process.env.NEXT_PUBLIC_LABELLEDGER_DATA === "fixture" ? "fixture" : "live";
export const EXPLORER_BASE = "https://explorer-studio.genlayer.com";

export const hasContract = /^0x[0-9a-fA-F]{40}$/.test(CONTRACT_ADDRESS);
