'use client'
import { useAppKit } from '@reown/appkit/react'
import { useAccount, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger,} from '@/components/ui/dropdown-menu'
import { ChevronDown, LogOut } from 'lucide-react'

export default function Header() {
  const { open } = useAppKit()
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getChainName = () => {
    if (!chain) return 'Unknown'
    return chain.name
  }

  const isCorrectNetwork = chain?.id === 1114

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <div className="flex items-center">
            <h1 className="text-xl font-bold text-foreground">
              Core Will
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {!isConnected ? (
              <Button 
                onClick={() => open()} 
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              >
                Connect Wallet
              </Button>
            ) : (
              <div className="flex items-center gap-2">

                <Badge variant={isCorrectNetwork ? "default" : "destructive"}
                    className="hidden sm:flex "
                >
                  {getChainName()}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="hidden sm:inline">
                          {formatAddress(address!)}
                        </span>
                      </div>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => disconnect()} className="flex items-center gap-2 text-destructive">
                        <LogOut className="h-4 w-4" />
                        Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
