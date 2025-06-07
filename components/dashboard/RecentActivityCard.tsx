import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ContractDetails } from "@/types/contract"
import { Activity, Clock, CheckCircle, Gift } from "lucide-react"

interface RecentActivityCardProps {
  userContracts: ContractDetails[]
  beneficiaryContracts: ContractDetails[]
}

export default function RecentActivityCard({ userContracts, beneficiaryContracts }: RecentActivityCardProps) {
  const allContracts = [...userContracts, ...beneficiaryContracts]
    .sort((a, b) => b.lastActivity - a.lastActivity)
    .slice(0, 5)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-4 w-4 text-[#ffa600]" />
      case "Triggered - Ready to claim":
        return <Gift className="h-4 w-4 text-red-500" />
      case "Claimed":
        return <CheckCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
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

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`
  }

  return (
    <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-slate-700 rounded-2xl flex items-center justify-center">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">Recent Activity</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Latest updates from your inheritance contracts
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {allContracts.map((contract, index) => (
            <div key={contract.contractAddress} className="group">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-gray-50/50">
                <div className="flex items-center gap-4">
                  {getStatusIcon(contract.status)}
                  <div>
                    <p className="font-semibold text-gray-900">Contract {formatAddress(contract.contractAddress)}</p>
                    <p className="text-sm text-gray-500">
                      Last activity: {new Date(contract.lastActivity * 1000).toLocaleDateString()} at{" "}
                      {new Date(contract.lastActivity * 1000).toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Amount: {contract.amount} tCORE2</p>
                  </div>
                </div>
                <Badge
                  variant={getStatusVariant(contract.status)}
                  className="flex items-center gap-1 text-xs px-3 py-1 rounded-full"
                >
                  {contract.status}
                </Badge>
              </div>
              {index < allContracts.length - 1 && (
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-3" />
              )}
            </div>
          ))}
          {allContracts.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No recent activity found</p>
              <p className="text-sm text-gray-400 mt-1">
                Activity will appear here when you create or interact with contracts
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
