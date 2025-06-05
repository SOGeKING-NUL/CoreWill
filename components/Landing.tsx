'use client'

import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import {FACTORY_ABI} from '@/lib/abis'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { 
  Shield, 
  Users, 
  DollarSign, 
  Activity, 
  ArrowRight, 
  CheckCircle, 
  Clock,
  Lock,
  Zap
} from 'lucide-react'

const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || "0x8f79150a124bd664CBAB4464dCbE0c80BC1B3D12"
const RPC_URL = process.env.NEXT_CORE_RPC_URL || "https://rpc.test2.btcs.network"



interface StatsData {
  activeContracts: number | null
  totalContracts: number | null
  totalDistributed: string | null
  loading: boolean
  error: string | null
}

export default function Landing() {
  const router = useRouter()
  const [stats, setStats] = useState<StatsData>({
    activeContracts: null,
    totalContracts: null,
    totalDistributed: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    async function fetchContractStats() {
      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL)
        const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider)

        const [activeCount, totalCount] = await Promise.all([
          factory.getActiveContractCount(),
          factory.getContractCount()
        ])

        // Calculate estimated total distributed (placeholder calculation)
        // In a real scenario, you'd need to track this through events or additional contract methods
        const estimatedDistributed = (Number(totalCount) - Number(activeCount)) * 1.5

        setStats({
          activeContracts: Number(activeCount),
          totalContracts: Number(totalCount),
          totalDistributed: estimatedDistributed.toFixed(2),
          loading: false,
          error: null
        })
      } catch (error) {
        console.error('Failed to fetch contract stats:', error)
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load blockchain data'
        }))
      }
    }

    fetchContractStats()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchContractStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: Shield,
      title: "Secure & Decentralized",
      description: "Your inheritance contracts are secured by blockchain technology with no central authority."
    },
    {
      icon: Clock,
      title: "Automated Monitoring",
      description: "Smart contracts automatically monitor wallet activity and trigger inheritance when needed."
    },
    {
      icon: Users,
      title: "Multi-Beneficiary Support",
      description: "Set up multiple inheritance contracts for different beneficiaries with custom conditions."
    },
    {
      icon: Zap,
      title: "Instant Claims",
      description: "Beneficiaries can claim their inheritance instantly once conditions are met."
    }
  ]

  const steps = [
    {
      number: "01",
      title: "Connect Wallet",
      description: "Connect your Core DAO wallet to get started"
    },
    {
      number: "02", 
      title: "Create Contract",
      description: "Set beneficiary, amount, and inactivity period"
    },
    {
      number: "03",
      title: "Automatic Monitoring", 
      description: "Our system monitors your wallet activity"
    },
    {
      number: "04",
      title: "Inheritance Triggered",
      description: "Beneficiary can claim when conditions are met"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              <Activity className="h-3 w-3 mr-1" />
              Powered by Core DAO Blockchain
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Secure Your Digital
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}Legacy
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              CoreWill is a decentralized inheritance management platform that automatically 
              distributes your digital assets to beneficiaries when you become inactive.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Platform Statistics
            </h2>
            <p className="text-gray-600">
              Real-time data from the Core DAO blockchain
            </p>
          </div>

          {stats.error && (
            <div className="text-center mb-8">
              <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
                {stats.error}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Active Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stats.loading ? (
                    <div className="animate-pulse bg-gray-200 h-10 w-16 mx-auto rounded"></div>
                  ) : (
                    stats.activeContracts ?? '0'
                  )}
                </div>
                <p className="text-gray-600 text-sm">
                  Currently being monitored
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Total Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {stats.loading ? (
                    <div className="animate-pulse bg-gray-200 h-10 w-16 mx-auto rounded"></div>
                  ) : (
                    stats.totalContracts ?? '0'
                  )}
                </div>
                <p className="text-gray-600 text-sm">
                  Deployed on the platform
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Estimated Distributed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {stats.loading ? (
                    <div className="animate-pulse bg-gray-200 h-10 w-20 mx-auto rounded"></div>
                  ) : (
                    `${stats.totalDistributed ?? '0'}`
                  )}
                </div>
                <p className="text-gray-600 text-sm">
                  tCORE2 distributed to beneficiaries
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose CoreWill?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Built on Core DAO blockchain with advanced smart contract technology 
              to ensure your digital assets are safely transferred to your loved ones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600">
              Simple steps to secure your digital inheritance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mb-4 font-bold">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {step.description}
                  </p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full">
                    <ArrowRight className="h-6 w-6 text-gray-300 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Secure Your Digital Legacy?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join thousands of users who trust CoreWill to protect their digital assets
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 mx-auto"
          >
            Start Creating Contracts
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  )
}
