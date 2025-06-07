import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Wallet, Gift, Lock, TrendingUp } from "lucide-react"
import type { ContractDetails } from "@/types/contract"

interface StatsCardsProps {
  userContracts: ContractDetails[]
  beneficiaryContracts: ContractDetails[]
}

export default function StatsCards({ userContracts, beneficiaryContracts }: StatsCardsProps) {
  // Calculate total value to be claimed (triggered but not claimed)
  const userClaimable = userContracts
    .filter((c) => c.triggered && !c.claimed)
    .reduce((sum, c) => sum + Number.parseFloat(c.amount), 0)

  const beneficiaryClaimable = beneficiaryContracts
    .filter((c) => c.triggered && !c.claimed)
    .reduce((sum, c) => sum + Number.parseFloat(c.amount), 0)

  const totalClaimable = userClaimable + beneficiaryClaimable

  // Calculate total value locked (active contracts being monitored)
  const userLocked = userContracts
    .filter((c) => c.needsMonitoring)
    .reduce((sum, c) => sum + Number.parseFloat(c.amount), 0)

  const beneficiaryLocked = beneficiaryContracts
    .filter((c) => c.needsMonitoring)
    .reduce((sum, c) => sum + Number.parseFloat(c.amount), 0)

  const totalLocked = userLocked + beneficiaryLocked

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* My Contracts */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ffa600]/20 to-[#ffa600]/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
        <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:bg-white rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">My Contracts</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-[#ffa600] to-[#ff8c00] rounded-2xl flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-[#ffa600] mb-2">{userContracts.length}</div>
            <p className="text-sm text-gray-600 mb-3">Contracts you created</p>
            <div className="flex items-center gap-2 text-[#ffa600]">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs font-medium">Active monitoring</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Beneficiary Contracts */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-500/20 to-gray-500/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
        <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:bg-white rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Beneficiary Contracts</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-gray-700 mb-2">{beneficiaryContracts.length}</div>
            <p className="text-sm text-gray-600 mb-3">You're a beneficiary</p>
            <div className="flex items-center gap-2 text-[#ffa600]">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs font-medium">Inheritance ready</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Claimable - Highlighted with Primary Color */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ffa600] to-[#ff8c00] rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-700"></div>
        <Card className="relative bg-gradient-to-br from-[#ffa600] to-[#ff8c00] border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-white/90">Total Claimable</CardTitle>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Gift className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white mb-2">{totalClaimable.toFixed(2)}</div>
            <p className="text-sm text-white/80 mb-3">tCORE2 ready to claim</p>
            <div className="flex items-center gap-2 text-white/90">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs font-medium">Available now</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Locked */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
        <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:bg-white rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Locked</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center">
              <Lock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-black mb-2">{totalLocked.toFixed(2)}</div>
            <p className="text-sm text-gray-600 mb-3">tCORE2 in active contracts</p>
            <div className="flex items-center gap-2 text-[#ffa600]">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs font-medium">Secured</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
