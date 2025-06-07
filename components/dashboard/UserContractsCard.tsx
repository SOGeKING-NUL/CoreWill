"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { useWalletClient, usePublicClient } from "wagmi"
import type { ContractDetails } from "@/types/contract"
import { INHERITANCE_ABI } from "@/lib/abis"
import { Copy, RefreshCw, Plus, Clock, DollarSign, User, AlertTriangle, CheckCircle, Wallet } from "lucide-react"
import { copyToClipboard } from "@/lib/utils"
import { useState } from "react"

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
        return <AlertTriangle className="h-3 w-3" />
      case "Claimed":
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
        functionName: "resetActivity",
      })

      await publicClient!.waitForTransactionReceipt({ hash })
      alert("Activity reset successful!")
      onRefresh()
    } catch (err) {
      console.error("Reset activity failed:", err)
      alert("Failed to reset activity")
    } finally {
      setActionLoading(null)
    }
  }

  const emergencyWithdraw = async (contractAddress: string) => {
    if (!walletClient) return

    const confirmed = confirm("Are you sure you want to emergency withdraw? This will permanently close the contract.")
    if (!confirmed) return

    setActionLoading(`withdraw-${contractAddress}`)
    try {
      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: INHERITANCE_ABI,
        functionName: "emergencyWithdraw",
      })

      await publicClient!.waitForTransactionReceipt({ hash })
      alert("Emergency withdrawal successful!")
      onRefresh()
    } catch (err) {
      console.error("Emergency withdraw failed:", err)
      alert("Failed to withdraw")
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <Card className="h-full border-0 shadow-2xl bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-[#ffa600]/5 to-[#ff8c00]/5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#ffa600] to-[#ff8c00] rounded-2xl flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">My Inheritance Contracts</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Contracts you've created for your beneficiaries ({contracts.length} total)
                </CardDescription>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onRefresh}
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-[#ffa600]/20 text-[#ffa600] hover:bg-[#ffa600]/10 rounded-xl"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
            <Button
              onClick={() => router.push("/create")}
              size="sm"
              className="flex items-center gap-2 bg-gradient-to-r from-[#ffa600] to-[#ff8c00] hover:from-[#ff8c00] hover:to-[#ff7300] rounded-xl"
            >
              <Plus className="h-4 w-4" />
              Create New
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {contracts.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#ffa600]/10 to-[#ff8c00]/10 rounded-full flex items-center justify-center mb-6">
              <DollarSign className="h-10 w-10 text-[#ffa600]" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">No inheritance contracts yet</h3>
            <p className="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
              Create your first inheritance contract to secure your digital assets for your beneficiaries.
            </p>
            <Button
              onClick={() => router.push("/create")}
              className="flex items-center gap-2 bg-gradient-to-r from-[#ffa600] to-[#ff8c00] hover:from-[#ff8c00] hover:to-[#ff7300] px-6 py-3 rounded-xl"
            >
              <Plus className="h-4 w-4" />
              Create Your First Contract
            </Button>
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
                            className="h-6 w-6 p-0 hover:bg-[#ffa600]/10"
                            onClick={() => copyToClipboard(contract.contractAddress)}
                          >
                            <Copy className="h-3 w-3 text-[#ffa600]" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <User className="h-4 w-4" />
                          <span>Beneficiary: {formatAddress(contract.beneficiary)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-[#ffa600]/10"
                            onClick={() => copyToClipboard(contract.beneficiary)}
                          >
                            <Copy className="h-3 w-3 text-[#ffa600]" />
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
                          <span>Amount</span>
                        </div>
                        <p className="font-bold text-lg text-[#ffa600]">{contract.amount} tCORE2</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4 text-[#ffa600]" />
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
                    {!contract.triggered && (
                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <Button
                          onClick={() => resetActivity(contract.contractAddress)}
                          variant="outline"
                          size="sm"
                          disabled={actionLoading === `reset-${contract.contractAddress}`}
                          className="flex-1 text-sm border-[#ffa600]/20 text-[#ffa600] hover:bg-[#ffa600]/10 rounded-xl"
                        >
                          {actionLoading === `reset-${contract.contractAddress}` ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Clock className="h-4 w-4 mr-2" />
                          )}
                          Reset Activity
                        </Button>
                        <Button
                          onClick={() => emergencyWithdraw(contract.contractAddress)}
                          size="sm"
                          disabled={actionLoading === `withdraw-${contract.contractAddress}`}
                          className="flex-1 text-sm bg-black hover:bg-gray-800 text-white rounded-xl"
                        >
                          {actionLoading === `withdraw-${contract.contractAddress}` ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 mr-2" />
                          )}
                          Emergency Withdraw
                        </Button>
                      </div>
                    )}

                    {contract.triggered && (
                      <div className="pt-4 border-t border-gray-100">
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
                          <p className="text-sm text-orange-800 font-medium flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Inheritance has been triggered. Your beneficiary can now claim the funds.
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
