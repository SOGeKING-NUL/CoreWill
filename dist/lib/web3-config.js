import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { cookieStorage, createStorage } from 'wagmi';
export const coreTestnet2 = {
    id: 1114,
    name: 'Core Blockchain Testnet2',
    nativeCurrency: {
        decimals: 18,
        name: 'tCORE2',
        symbol: 'tCORE2',
    },
    rpcUrls: {
        default: {
            http: [process.env.NEXT_CORE_RPC_URL || 'https://rpc.test2.btcs.network'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Core Testnet2 Explorer',
            url: 'https://scan.test2.btcs.network',
        },
    },
    testnet: true,
};
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'YOUR_PROJECT_ID';
if (!projectId) {
    throw new Error('Project ID is not defined');
}
export const networks = [coreTestnet2];
export const wagmiAdapter = new WagmiAdapter({
    storage: createStorage({
        storage: cookieStorage
    }),
    ssr: true,
    projectId,
    networks
});
export const config = wagmiAdapter.wagmiConfig;
export const modal = createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [coreTestnet2],
    defaultNetwork: coreTestnet2,
    metadata: {
        name: 'CoreWill',
        description: 'Wallet inheritance made simple',
        url: 'https://core-will.vercel.app/',
        icons: ['https://avatars.githubusercontent.com/u/37784886']
    },
    features: {
        analytics: true,
    }
});
