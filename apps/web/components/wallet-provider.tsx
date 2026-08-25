"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { EXPECTED_CHAIN_HEX } from "@/lib/genlayer/config";
import { makeWriteClient } from "@/lib/genlayer/client";

type WalletState = {
  address: `0x${string}` | "";
  chainId: string;
  connecting: boolean;
  error: string;
  connected: boolean;
  correctNetwork: boolean;
  connect: () => Promise<void>;
  switchNetwork: () => Promise<void>;
  clearError: () => void;
};

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<`0x${string}` | "">("");
  const [chainId, setChainId] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  const refreshChain = useCallback(async () => {
    if (!window.ethereum) return;
    try { setChainId(String(await window.ethereum.request({ method: "eth_chainId" })).toLowerCase()); } catch { setChainId(""); }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) { setError("No injected wallet detected."); return; }
    setConnecting(true); setError("");
    try {
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      const first = accounts?.[0];
      if (!first) throw new Error("Wallet returned no account.");
      setAddress(first as `0x${string}`);
      await refreshChain();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Wallet connection failed."); }
    finally { setConnecting(false); }
  }, [refreshChain]);

  const switchNetwork = useCallback(async () => {
    if (!address) { setError("Connect a wallet first."); return; }
    setError("");
    try {
      const client = makeWriteClient(address);
      await client.connect("studionet");
      await refreshChain();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Network switch failed."); }
  }, [address, refreshChain]);

  useEffect(() => {
    if (!window.ethereum?.on) return;
    const accountsChanged = (...args: unknown[]) => {
      const accounts = (args[0] ?? []) as string[];
      setAddress((accounts?.[0] as `0x${string}` | undefined) ?? "");
    };
    const chainChanged = (...args: unknown[]) => setChainId(String(args[0] ?? "").toLowerCase());
    const disconnected = () => { setAddress(""); setChainId(""); };
    window.ethereum.on("accountsChanged", accountsChanged);
    window.ethereum.on("chainChanged", chainChanged);
    window.ethereum.on("disconnect", disconnected);
    return () => {
      window.ethereum?.removeListener?.("accountsChanged", accountsChanged);
      window.ethereum?.removeListener?.("chainChanged", chainChanged);
      window.ethereum?.removeListener?.("disconnect", disconnected);
    };
  }, []);

  const value = useMemo<WalletState>(() => ({
    address, chainId, connecting, error,
    connected: Boolean(address),
    correctNetwork: chainId.toLowerCase() === EXPECTED_CHAIN_HEX.toLowerCase(),
    connect, switchNetwork, clearError: () => setError(""),
  }), [address, chainId, connect, connecting, error, switchNetwork]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const value = useContext(WalletContext);
  if (!value) throw new Error("useWallet must be used inside WalletProvider");
  return value;
}
