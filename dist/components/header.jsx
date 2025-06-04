'use client';
import { useEffect, useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, LogOut, AlertTriangle } from 'lucide-react';
export default function Header() {
    const { open } = useAppKit();
    const { address, isConnected, chain } = useAccount();
    const { disconnect } = useDisconnect();
    const [monitoringActive, setMonitoringActive] = useState(null);
    useEffect(() => {
        const fetchStatus = async () => {
            var _a, _b;
            if (isConnected) {
                try {
                    const response = await fetch('/api/monitoring/status');
                    const data = await response.json();
                    setMonitoringActive((_b = (_a = data === null || data === void 0 ? void 0 : data.status) === null || _a === void 0 ? void 0 : _a.isRunning) !== null && _b !== void 0 ? _b : false);
                }
                catch (_c) {
                    setMonitoringActive(false);
                }
            }
            else {
                setMonitoringActive(null);
            }
        };
        fetchStatus();
        let interval;
        if (isConnected) {
            interval = setInterval(fetchStatus, 30000);
        }
        return () => {
            if (interval)
                clearInterval(interval);
        };
    }, [isConnected]);
    const formatAddress = (addr) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };
    const getChainName = () => {
        if (!chain)
            return 'Unknown';
        return chain.name;
    };
    const isCorrectNetwork = (chain === null || chain === void 0 ? void 0 : chain.id) === 1114;
    const getBadgeStyle = () => {
        if (!isConnected || !isCorrectNetwork) {
            return isCorrectNetwork ? "default" : "destructive";
        }
        if (monitoringActive === null) {
            return "secondary"; // Loading state
        }
        return monitoringActive ? "default" : "destructive";
    };
    const getBadgeClasses = () => {
        if (!isConnected || !isCorrectNetwork) {
            return "hidden sm:flex";
        }
        if (monitoringActive === null) {
            return "hidden sm:flex bg-gray-500/20 text-gray-700 border-gray-300";
        }
        return monitoringActive
            ? "hidden sm:flex bg-green-500/20 text-green-700 border-green-300"
            : "hidden sm:flex bg-red-500/20 text-red-700 border-red-300";
    };
    return (<div className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md shadow-lg transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <div className="flex items-center">
            <h1 className="text-xl font-bold text-foreground">
              Core Will
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {!isConnected ? (<Button onClick={() => open()} variant="default" size="sm" className="flex items-center gap-2">
                Connect Wallet
              </Button>) : (<div className="flex items-center gap-2">

                <Badge variant={getBadgeStyle()} className={getBadgeClasses()}>
                  <div className="flex items-center gap-1.5">
                    {isCorrectNetwork && monitoringActive === false && (<AlertTriangle className="h-3 w-3"/>)}
                    <span>{getChainName()}</span>
                    {isCorrectNetwork && monitoringActive !== null && (<div className={`w-1.5 h-1.5 rounded-full ${monitoringActive ? 'bg-green-500' : 'bg-red-500'}`}/>)}
                  </div>
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="hidden sm:inline">
                          {formatAddress(address)}
                        </span>
                      </div>
                      <ChevronDown className="h-3 w-3"/>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => disconnect()} className="flex items-center gap-2 text-destructive">
                        <LogOut className="h-4 w-4"/>
                        Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>)}
          </div>
        </div>
      </div>
    </div>);
}
