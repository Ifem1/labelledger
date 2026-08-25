import { createClient } from "genlayer-js";
import { targetChain } from "./config";

export const readClient = createClient({ chain: targetChain });

export function makeWriteClient(address: `0x${string}`) {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No injected EIP-1193 wallet was found.");
  }
  return createClient({
    chain: targetChain,
    account: address,
    provider: window.ethereum,
  });
}
