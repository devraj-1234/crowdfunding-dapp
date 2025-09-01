type EthereumEventMap = {
  accountsChanged: string[];
  chainChanged: string;
  connect: { chainId: string };
  disconnect: { code: number; message: string };
  message: { type: string; data: unknown };
};

type RequestArguments = {
  method: string;
  params?: unknown[] | object;
};

interface EthereumProvider {
  isMetaMask?: boolean;
  request: <T = unknown>(args: RequestArguments) => Promise<T>;
  on<K extends keyof EthereumEventMap>(
    event: K,
    handler: (payload: EthereumEventMap[K]) => void
  ): void;
  removeListener<K extends keyof EthereumEventMap>(
    event: K,
    handler: (payload: EthereumEventMap[K]) => void
  ): void;
  selectedAddress?: string;
  chainId?: string;
  isConnected?: boolean;
}

interface Window {
  ethereum?: EthereumProvider;
}
