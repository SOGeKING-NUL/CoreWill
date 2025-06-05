'use client'

import { useEffect, useState } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/header'
import StatsCards from '@/components/dashboard/StatsCards'
import RecentActivityCard from '@/components/dashboard/RecentActivityCard'
import UserContractsCard from '@/components/dashboard/UserContractsCard'
import BeneficiaryContractsCard from '@/components/dashboard/BeneficiaryContractsCard'
import { ContractDetails } from '@/types/contract'
import { fetchAllContracts } from '@/lib/contract-utils'

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
      setError('Failed to load contracts')
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome to InheritanceDAO</h2>
              <p className="text-muted-foreground">
                Connect your wallet to manage your digital asset inheritance
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (chain?.id !== CHAIN_ID) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6 text-center">
              <h2 className="text-2xl font-bold text-yellow-800 mb-2">Wrong Network</h2>
              <p className="text-yellow-600">
                Please switch to Core DAO Testnet2 (Chain ID: 1114)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      
      <div className="max-w-7xl mx-auto p-4 pt-20">
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Inheritance Dashboard
          </h1>
          <p className="text-slate-600">
            Manage your digital asset inheritance on Core DAO Testnet2
          </p>
        </div>

        <div className="space-y-6">
          {/* Stats Cards */}
          <StatsCards 
            userContracts={userContracts}
            beneficiaryContracts={beneficiaryContracts}
          />

          {/* Contract Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserContractsCard 
              contracts={userContracts}
              loading={loading}
              onRefresh={refreshData}
            />
            <BeneficiaryContractsCard 
              contracts={beneficiaryContracts}
              loading={loading}
              onRefresh={refreshData}
            />
          </div>

          {/* Recent Activity */}
          <RecentActivityCard 
            userContracts={userContracts}
            beneficiaryContracts={beneficiaryContracts}
          />
        </div>
      </div>
    </div>
  )
}
