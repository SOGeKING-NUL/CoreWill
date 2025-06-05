import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useWalletClient, usePublicClient } from 'wagmi'
import { ContractDetails } from '@/types/contract'
import { INHERITANCE_ABI } from '@/lib/abis'
import { Copy, RefreshCw, Clock, DollarSign, User, AlertTriangle, CheckCircle, Gift, Coins } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'
import { useState } from 'react'

interface BeneficiaryContractsCardProps {
  contracts: ContractDetails[]
  loading: boolean
  onRefresh: () => void
}

export default function BeneficiaryContractsCard({ contracts, loading, onRefresh }: BeneficiaryContractsCardProps) {
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Sort contracts by creation time (latest first) - using lastActivity as proxy
  const sortedContracts = [...contracts].sort((a, b) => b.lastActivity - a.lastActivity)

  const formatDuration = (seconds: number): string => {
    if (seconds <= 0) return 'Expired'
    
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'default'
      case 'Triggered - Ready to claim':
        return 'destructive'
      case 'Claimed':
        return 'secondary'
      case 'Inactive':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="h-3 w-3" />
      case 'Triggered - Ready to claim':
        return <Gift className="h-3 w-3" />
      case 'Claimed':
        return <Coins className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const claimInheritance = async (contractAddress: string) => {
    if (!walletClient) return
    
    const confirmed = confirm('Are you sure you want to claim this inheritance? This action cannot be undone.')
    if (!confirmed) return

    setActionLoading(`claim-${contractAddress}`)
    try {
      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: INHERITANCE_ABI,
        functionName: 'claimInheritance'
      })

      await publicClient!.waitForTransactionReceipt({ hash })
      alert('Inheritance claimed successfully!')
      onRefresh()
    } catch (err) {
      console.error('Claim failed:', err)
      alert('Failed to claim inheritance')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">Beneficiary Contracts</CardTitle>
            <CardDescription className="text-sm">
              Contracts where you're the beneficiary ({contracts.length} total)
            </CardDescription>
          </div>
          <Button 
            onClick={onRefresh} 
            disabled={loading} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {contracts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Gift className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-2">No inheritance contracts</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              You haven't been assigned as a beneficiary to any inheritance contracts yet.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-4 pr-4">
              {sortedContracts.map((contract, index) => (
                <div key={contract.contractAddress}>
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">
                            Contract {formatAddress(contract.contractAddress)}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(contract.contractAddress)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>Owner: {formatAddress(contract.owner)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => copyToClipboard(contract.owner)}
                          >
                            <Copy className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      </div>
                      <Badge 
                        variant={getStatusVariant(contract.status)}
                        className="flex items-center gap-1 text-xs"
                      >
                        {getStatusIcon(contract.status)}
                        {contract.status}
                      </Badge>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          <span>Inheritance Amount</span>
                        </div>
                        <p className="font-medium text-sm text-green-600">{contract.amount} tCORE2</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Time Remaining</span>
                        </div>
                        <p className={`font-medium text-sm ${
                          contract.timeRemaining <= 0 ? 'text-red-600' : 
                          contract.timeRemaining < 86400 ? 'text-yellow-600' : 'text-blue-600'
                        }`}>
                          {formatDuration(contract.timeRemaining)}
                        </p>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="text-xs text-muted-foreground mb-4">
                      <p>Inactivity Period: {formatDuration(contract.inactivityTime)}</p>
                      <p>Last Activity: {new Date(contract.lastActivity * 1000).toLocaleDateString()}</p>
                    </div>

                    {/* Action Buttons */}
                    {contract.triggered && !contract.claimed && (
                      <div className="pt-2 border-t">
                        <Button 
                          onClick={() => claimInheritance(contract.contractAddress)}
                          disabled={actionLoading === `claim-${contract.contractAddress}`}
                          className="w-full"
                          size="sm"
                        >
                          {actionLoading === `claim-${contract.contractAddress}` ? (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin mr-2" />
                              Claiming...
                            </>
                          ) : (
                            <>
                              <Gift className="h-3 w-3 mr-2" />
                              Claim Inheritance
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {contract.claimed && (
                      <div className="pt-2 border-t">
                        <div className="bg-green-50 border border-green-200 rounded-md p-3">
                          <p className="text-xs text-green-800 font-medium flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Inheritance has been successfully claimed!
                          </p>
                        </div>
                      </div>
                    )}

                    {!contract.triggered && !contract.claimed && contract.status === 'Active' && (
                      <div className="pt-2 border-t">
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                          <p className="text-xs text-blue-800 font-medium">
                            💡 This inheritance is being monitored. You'll be able to claim it if the owner becomes inactive.
                          </p>
                        </div>
                      </div>
                    )}

                    {contract.status === 'Inactive - Pending trigger' && (
                      <div className="pt-2 border-t">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                          <p className="text-xs text-yellow-800 font-medium">
                            ⏳ Owner has been inactive. Inheritance will be triggered soon by the monitoring service.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {index < sortedContracts.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
