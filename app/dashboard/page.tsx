"use client"

import { useEffect, useState } from "react"
import { useAccount, usePublicClient } from "wagmi"
import { AlertCircle, Shield, TrendingUp, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Header from "@/components/header"
import StatsCards from "@/components/dashboard/StatsCards"
import RecentActivityCard from "@/components/dashboard/RecentActivityCard"
import UserContractsCard from "@/components/dashboard/UserContractsCard"
import BeneficiaryContractsCard from "@/components/dashboard/BeneficiaryContractsCard"
import type { ContractDetails } from "@/types/contract"
import { fetchAllContracts } from "@/lib/contract-utils"
import Footer from "@/components/footer"

const CHAIN_ID = 1114

export default function Dashboard() {
  const { address, isConnected, chain } = useAccount()
  const publicClient = usePublicClient()

  const [userContracts, setUserContracts] = useState<ContractDetails[]>([])
  const [beneficiaryContracts, setBeneficiaryContracts] = useState<ContractDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refresh all data
  const refreshData = async () => {
    if (!address || !publicClient) return

    setLoading(true)
    setError(null)

    try {
      const { userContracts, beneficiaryContracts } = await fetchAllContracts(address, publicClient)
      setUserContracts(userContracts)
      setBeneficiaryContracts(beneficiaryContracts)
    } catch (err) {
      setError("Failed to load contracts")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Load data when wallet connects
  useEffect(() => {
    if (isConnected && chain?.id === CHAIN_ID) {
      refreshData()
    } else {
      setUserContracts([])
      setBeneficiaryContracts([])
    }
  }, [address, isConnected, chain])

  // Auto-refresh data every 60 seconds
  useEffect(() => {
    if (isConnected && chain?.id === CHAIN_ID) {
      const interval = setInterval(refreshData, 60000)
      return () => clearInterval(interval)
    }
  }, [isConnected, chain])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#ffa600]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-[#ffa600]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <Header />
        <div className="flex items-center justify-center min-h-[60vh] relative z-10">
          <Card className="w-full max-w-lg border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-12 pb-12 text-center px-8">
              <div className="w-20 h-20 bg-gradient-to-br from-[#ffa600] to-[#ff8c00] rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Welcome to CoreWill</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Connect your wallet to manage your digital asset inheritance and secure your legacy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (chain?.id !== CHAIN_ID) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#ffa600]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-[#ffa600]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <Header />
        <div className="flex items-center justify-center min-h-[60vh] relative z-10">
          <Card className="w-full max-w-lg border-0 shadow-2xl bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="pt-12 pb-12 text-center px-8">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-yellow-800 mb-4">Wrong Network</h2>
              <p className="text-yellow-700 text-lg leading-relaxed">
                Please switch to Core DAO Testnet2 (Chain ID: 1114) to access your dashboard
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#ffa600]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-[#ffa600]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-[#ffa600]/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <Header />
      <div className="max-w-7xl mx-auto p-4 pt-24 relative z-10">
        {error && (
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-red-50 to-pink-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">Inheritance Dashboard</h1>
        </div>

        <div className="space-y-8">
          <StatsCards userContracts={userContracts} beneficiaryContracts={beneficiaryContracts} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <UserContractsCard contracts={userContracts} loading={loading} onRefresh={refreshData} />
            <BeneficiaryContractsCard contracts={beneficiaryContracts} loading={loading} onRefresh={refreshData} />
          </div>
          <RecentActivityCard userContracts={userContracts} beneficiaryContracts={beneficiaryContracts} />
        </div>
      </div>
      <Footer />
    </div>
  )
}
