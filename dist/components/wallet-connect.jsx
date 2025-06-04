'use client';
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
export default function WalletConnect() {
    const { open } = useAppKit();
    const { address, isConnected, chain } = useAccount();
    const { disconnect } = useDisconnect();
    const formatAddress = (addr) => {
        return `${addr}`;
    };
    return (<Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Wallet Connection</CardTitle>
        <CardDescription>
          Connect your wallet to access CoreWill
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (<Button onClick={() => open()} className="w-full" size="lg">
            Connect Wallet
          </Button>) : (<div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Address:</span>
              <Badge variant="secondary">
                {formatAddress(address)}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Network:</span>
              <Badge variant={(chain === null || chain === void 0 ? void 0 : chain.id) === 1116 ? "default" : "destructive"}>
                {(chain === null || chain === void 0 ? void 0 : chain.name) || 'Unknown'}
              </Badge>
            </div>

            {(chain === null || chain === void 0 ? void 0 : chain.id) !== 1116 && (<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  Please switch to Core DAO network to continue
                </p>
              </div>)}

            <div className="flex gap-2">
              <Button onClick={() => open({ view: 'Account' })} variant="outline" className="flex-1">
                Account
              </Button>
              <Button onClick={() => disconnect()} variant="destructive" className="flex-1">
                Disconnect
              </Button>
            </div>
          </div>)}
      </CardContent>
    </Card>);
}
