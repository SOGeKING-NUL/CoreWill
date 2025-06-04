'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { useState } from 'react';
import { config } from '@/lib/web3-config';
export default function Providers({ children }) {
    const [queryClient] = useState(() => new QueryClient());
    return (<WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>);
}
