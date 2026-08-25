type EthereumRequest = { method: string; params?: unknown[] | Record<string, unknown> };

interface EthereumProvider {
  request(args: EthereumRequest): Promise<unknown>;
  on?(event: string, listener: (...args: unknown[]) => void): void;
  removeListener?(event: string, listener: (...args: unknown[]) => void): void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export {};
