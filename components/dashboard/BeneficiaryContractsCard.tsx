"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useWalletClient, usePublicClient } from "wagmi"
import type { ContractDetails } from "@/types/contract"
import { INHERITANCE_ABI } from "@/lib/abis"
import { Copy, RefreshCw, Clock, DollarSign, User, CheckCircle, Gift, Coins, Users } from "lucide-react"
import { copyToClipboard } from "@/lib/utils"
import { useState } from "react"

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
    if (seconds <= 0) return "Expired"

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
      case "Active":
        return "default"
      case "Triggered - Ready to claim":
        return "destructive"
      case "Claimed":
        return "secondary"
      case "Inactive":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-3 w-3" />
      case "Triggered - Ready to claim":
        return <Gift className="h-3 w-3" />
      case "Claimed":
        return <Coins className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const claimInheritance = async (contractAddress: string) => {
    if (!walletClient) return

    const confirmed = confirm("Are you sure you want to claim this inheritance? This action cannot be undone.")
    if (!confirmed) return

    setActionLoading(`claim-${contractAddress}`)
    try {
      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: INHERITANCE_ABI,
        functionName: "claimInheritance",
      })

      await publicClient!.waitForTransactionReceipt({ hash })
      alert("Inheritance claimed successfully!")
      onRefresh()
    } catch (err) {
      console.error("Claim failed:", err)
      alert("Failed to claim inheritance")
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <Card className="h-full border-0 shadow-2xl bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-slate-50">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Beneficiary Contracts</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Contracts where you're the beneficiary ({contracts.length} total)
                </CardDescription>
              </div>
            </div>
          </div>
          <Button
            onClick={onRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {contracts.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
              <Gift className="h-10 w-10 text-gray-500" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">No inheritance contracts</h3>
            <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">
              You haven't been assigned as a beneficiary to any inheritance contracts yet.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-4 pr-4">
              {sortedContracts.map((contract, index) => (
                <div key={contract.contractAddress}>
                  <div className="border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 group">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-base text-gray-900">
                            Contract {formatAddress(contract.contractAddress)}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-gray-100"
                            onClick={() => copyToClipboard(contract.contractAddress)}
                          >
                            <Copy className="h-3 w-3 text-gray-600" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <User className="h-4 w-4" />
                          <span>Owner: {formatAddress(contract.owner)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-gray-100"
                            onClick={() => copyToClipboard(contract.owner)}
                          >
                            <Copy className="h-3 w-3 text-gray-600" />
                          </Button>
                        </div>
                      </div>
                      <Badge
                        variant={getStatusVariant(contract.status)}
                        className="flex items-center gap-1 text-xs px-3 py-1 rounded-full"
                      >
                        {getStatusIcon(contract.status)}
                        {contract.status}
                      </Badge>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-6 mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <DollarSign className="h-4 w-4 text-[#ffa600]" />
                          <span>Inheritance Amount</span>
                        </div>
                        <p className="font-bold text-lg text-[#ffa600]">{contract.amount} tCORE2</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4 text-gray-600" />
                          <span>Time Remaining</span>
                        </div>
                        <p
                          className={`font-bold text-lg ${
                            contract.timeRemaining <= 0
                              ? "text-red-600"
                              : contract.timeRemaining < 86400
                                ? "text-yellow-600"
                                : "text-gray-700"
                          }`}
                        >
                          {formatDuration(contract.timeRemaining)}
                        </p>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="text-sm text-gray-500 mb-4 space-y-1">
                      <p>Inactivity Period: {formatDuration(contract.inactivityTime)}</p>
                      <p>Last Activity: {new Date(contract.lastActivity * 1000).toLocaleDateString()}</p>
                    </div>

                    {/* Action Buttons */}
                    {contract.triggered && !contract.claimed && (
                      <div className="pt-4 border-t border-gray-100">
                        <Button
                          onClick={() => claimInheritance(contract.contractAddress)}
                          disabled={actionLoading === `claim-${contract.contractAddress}`}
                          className="w-full bg-gradient-to-r from-[#ffa600] to-[#ff8c00] hover:from-[#ff8c00] hover:to-[#ff7300] rounded-xl"
                          size="sm"
                        >
                          {actionLoading === `claim-${contract.contractAddress}` ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              Claiming...
                            </>
                          ) : (
                            <>
                              <Gift className="h-4 w-4 mr-2" />
                              Claim Inheritance
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {contract.claimed && (
                      <div className="pt-4 border-t border-gray-100">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                          <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Inheritance has been successfully claimed!
                          </p>
                        </div>
                      </div>
                    )}

                    {!contract.triggered && !contract.claimed && contract.status === "Active" && (
                      <div className="pt-4 border-t border-gray-100">
                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-4">
                          <p className="text-sm text-gray-700 font-medium flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            This inheritance is being monitored. You'll be able to claim it if the owner becomes
                            inactive.
                          </p>
                        </div>
                      </div>
                    )}

                    {contract.status === "Inactive - Pending trigger" && (
                      <div className="pt-4 border-t border-gray-100">
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                          <p className="text-sm text-yellow-800 font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Owner has been inactive. Inheritance will be triggered soon by the monitoring service.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {index < sortedContracts.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
