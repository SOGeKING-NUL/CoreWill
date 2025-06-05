import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import { useWalletClient, usePublicClient } from 'wagmi'
import { ContractDetails } from '@/types/contract'
import { INHERITANCE_ABI } from '@/lib/abis'
import { Copy, RefreshCw, Plus, Clock, DollarSign, User, AlertTriangle, CheckCircle } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'
import { useState } from 'react'

interface UserContractsCardProps {
  contracts: ContractDetails[]
  loading: boolean
  onRefresh: () => void
}

export default function UserContractsCard({ contracts, loading, onRefresh }: UserContractsCardProps) {
  const router = useRouter()
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
        return <AlertTriangle className="h-3 w-3" />
      case 'Claimed':
        return <CheckCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const resetActivity = async (contractAddress: string) => {
    if (!walletClient) return
    
    setActionLoading(`reset-${contractAddress}`)
    try {
      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: INHERITANCE_ABI,
        functionName: 'resetActivity'
      })

      await publicClient!.waitForTransactionReceipt({ hash })
      alert('Activity reset successful!')
      onRefresh()
    } catch (err) {
      console.error('Reset activity failed:', err)
      alert('Failed to reset activity')
    } finally {
      setActionLoading(null)
    }
  }

  const emergencyWithdraw = async (contractAddress: string) => {
    if (!walletClient) return
    
    const confirmed = confirm('Are you sure you want to emergency withdraw? This will permanently close the contract.')
    if (!confirmed) return

    setActionLoading(`withdraw-${contractAddress}`)
    try {
      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: INHERITANCE_ABI,
        functionName: 'emergencyWithdraw'
      })

      await publicClient!.waitForTransactionReceipt({ hash })
      alert('Emergency withdrawal successful!')
      onRefresh()
    } catch (err) {
      console.error('Emergency withdraw failed:', err)
      alert('Failed to withdraw')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">My Inheritance Contracts</CardTitle>
            <CardDescription className="text-sm">
              Contracts you've created for your beneficiaries ({contracts.length} total)
            </CardDescription>
          </div>
          <div className="flex gap-2">
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
            <Button 
              onClick={() => router.push('/create')} 
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Plus className="h-3 w-3" />
              Create New
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {contracts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-2">No inheritance contracts yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Create your first inheritance contract to secure your digital assets for your beneficiaries.
            </p>
            <Button onClick={() => router.push('/create')} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Contract
            </Button>
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
                          <span>Beneficiary: {formatAddress(contract.beneficiary)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => copyToClipboard(contract.beneficiary)}
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
                          <span>Amount</span>
                        </div>
                        <p className="font-medium text-sm">{contract.amount} tCORE2</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Time Remaining</span>
                        </div>
                        <p className={`font-medium text-sm ${
                          contract.timeRemaining <= 0 ? 'text-red-600' : 
                          contract.timeRemaining < 86400 ? 'text-yellow-600' : 'text-green-600'
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
                    {!contract.triggered && (
                      <div className="flex gap-2 pt-2 border-t">
                        <Button 
                          onClick={() => resetActivity(contract.contractAddress)}
                          variant="outline"
                          size="sm"
                          disabled={actionLoading === `reset-${contract.contractAddress}`}
                          className="flex-1 text-xs"
                        >
                          {actionLoading === `reset-${contract.contractAddress}` ? (
                            <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          Reset Activity
                        </Button>
                        <Button 
                          onClick={() => emergencyWithdraw(contract.contractAddress)}
                          variant="destructive"
                          size="sm"
                          disabled={actionLoading === `withdraw-${contract.contractAddress}`}
                          className="flex-1 text-xs"
                        >
                          {actionLoading === `withdraw-${contract.contractAddress}` ? (
                            <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          )}
                          Emergency Withdraw
                        </Button>
                      </div>
                    )}

                    {contract.triggered && (
                      <div className="pt-2 border-t">
                        <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                          <p className="text-xs text-orange-800 font-medium">
                            ⚠️ Inheritance has been triggered. Your beneficiary can now claim the funds.
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
