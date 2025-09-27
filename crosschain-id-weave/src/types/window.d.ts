interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request?: (...args: any[]) => Promise<any>;
    selectedAddress?: string | null;
    networkVersion?: string;
    [key: string]: any;
  };
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export {};