"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { FACTORY_ABI } from "@/lib/abis"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Shield, Users, DollarSign, Activity, Clock, Zap, TrendingUp, Star, Copy, Coins,  AlertTriangle, ArrowRight } from "lucide-react"
import { AnimatedBeam } from "@/components/magicui/animated-beam"
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import {Marquee} from "@/components/magicui/marquee"
import { WorkflowItem } from "@/components/workflow-item"
import { ContractCard } from "@/components/contract-card"
import { NetworkInfoOverlay } from "@/components/network-info-overlay"
import { Arrow } from "@radix-ui/react-dropdown-menu"

const FACTORY_ADDRESS = "0x8f79150a124bd664CBAB4464dCbE0c80BC1B3D12"
const RPC_URL = "https://rpc.test2.btcs.network"

const contracts = [
  { address: "0x1234567890123456789012345678901234567890", amount: "0.5", time: "30 days" },
  { address: "0x2345678901234567890123456789012345678901", amount: "1.2", time: "60 days" },
  { address: "0x3456789012345678901234567890123456789012", amount: "3.0", time: "90 days" },
  { address: "0x4567890123456789012345678901234567890123", amount: "0.8", time: "45 days" },
  { address: "0x5678901234567890123456789012345678901234", amount: "2.5", time: "120 days" },
  { address: "0x6789012345678901234567890123456789012345", amount: "1.0", time: "15 days" },
  { address: "0x7890123456789012345678901234567890123456", amount: "5.0", time: "180 days" },
  { address: "0x8901234567890123456789012345678901234567", amount: "0.3", time: "7 days" },
  { address: "0x9012345678901234567890123456789012345678", amount: "1.5", time: "60 days" },
  { address: "0x0123456789012345678901234567890123456789", amount: "4.2", time: "365 days" },
]

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
    error: null,
  })
  const [showNetworkInfo, setShowNetworkInfo] = useState(false)

  useEffect(() => {
    async function fetchContractStats() {
      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL)
        const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider)

        const [activeCount, totalCount] = await Promise.all([
          factory.getActiveContractCount(),
          factory.getContractCount(),
        ])
        const estimatedDistributed = (Number(totalCount) - Number(activeCount)) * 1.5 //gotta fix this later

        setStats({
          activeContracts: Number(activeCount),
          totalContracts: Number(totalCount),
          totalDistributed: estimatedDistributed.toFixed(1),
          loading: false,
          error: null,
        })
      } catch (error) {
        console.error("Failed to fetch contract stats:", error)
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load blockchain data",
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
      description: "Your inheritance contracts are secured by blockchain technology with no central authority.",
      gradient: "from-[#ffa600] to-[#ff8c00]",
    },
    {
      icon: Clock,
      title: "Automated Monitoring",
      description: "Smart contracts automatically monitor wallet activity and trigger inheritance when needed.",
      gradient: "from-[#ff8c00] to-[#ff7300]",
    },
    {
      icon: Users,
      title: "Multi-Beneficiary Support",
      description: "Set up multiple inheritance contracts for different beneficiaries with custom conditions.",
      gradient: "from-[#ff7300] to-[#ff5900]",
    },
    {
      icon: Zap,
      title: "Instant Claims",
      description: "Beneficiaries can claim their inheritance instantly once conditions are met.",
      gradient: "from-[#ff5900] to-[#ff4000]",
    },
  ]

  const workflowItems = [
    {
      title: "Create Your Contract",
      description: "Set up your inheritance contract by specifying beneficiaries and conditions",
      videoUrl: "/videos/create-contract",
      imageUrl: "/how-it-works/create-contract.gif",
      index: 1,
    },
    {
      title: "We Automate Monitoring", 
      description: "Our system continuously monitors your wallet for inactivity i.e. if wallet doesnt perform transaction, minting, or staking for a certain period",
      videoUrl: "/videos/automated-monitoring",
      imageUrl: "/how-it-works/automated-monitoring.gif",
      index: 2,
    },
    {
      title: "You Control from Dashboard",
      description: "Manage all your inheritance contracts from a single dashboard", 
      videoUrl: "/videos/control-dashboard",
      imageUrl: "/how-it-works/control-dashboard.gif",
      index: 3,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#ffa600]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-[#ffa600]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-[#ffa600]/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-28 pb-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-[#ffa600]/10 border border-[#ffa600]/20 rounded-full px-5 py-3 mb-10">
              <div className="w-3 h-3 bg-[#ffa600] rounded-full animate-pulse"></div>
              <span className="text-[#ffa600] font-medium text-base">Powered by Core DAO Blockchain Testnet2</span>
              <Button
                onClick={() => setShowNetworkInfo(true)}
                className="w-4 h-8 bg-[#ffa600] text-white rounded-full flex items-center justify-center hover:bg-[#ff8c00] transition-colors text-xs font-bold"
              >
                i
              </Button>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-10 leading-tight">
              Secure Your Digital
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ffa600] to-[#ff8c00]">
                Legacy Forever
              </span>
            </h1>

            <p className="text-2xl text-gray-600 mb-14 max-w-4xl mx-auto leading-relaxed">
              CoreWill is an asset inheritance management platform that secures you cold assests and automatically distributes them to beneficiaries when you become inactive.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <InteractiveHoverButton
                onClick={() => router.push("/dashboard")}
                className="text-xl font-semibold py-6 px-10"
              >
                Deploy your first contract
              </InteractiveHoverButton>
            </div>

            <div className="mt-20 flex flex-wrap justify-center items-center gap-12 text-gray-500">
              <div className="flex items-center gap-3">
                <Star className="h-7 w-7 text-[#ffa600]" />
                <span className="font-medium text-lg">Fast</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-7 w-7 text-[#ffa600]" />
                <span className="font-medium text-lg">Secure</span>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-7 w-7 text-[#ffa600]" />
                <span className="font-medium text-lg">99.9% uptime</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* How It Works*/}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ffa600]/5 via-transparent to-[#ffa600]/5"></div>

        <div className="relative w-full min-h-screen">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16">
            <div className="flex flex-col gap-32">
              {workflowItems.map((item, index) => (
                <WorkflowItem
                  key={index}
                  title={item.title}
                  description={item.description}
                  videoUrl={item.videoUrl}
                  imageUrl={item.imageUrl}
                  index={item.index}
                  isLast={index === workflowItems.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Platform Statistics Section */}
      <section className="py-32 relative bg-gradient-to-br from-white via-gray-50/30 to-[#ffa600]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-[#ffa600]/10 rounded-full px-4 py-2 mb-8">
              <div className="w-2 h-2 bg-[#ffa600] rounded-full animate-pulse"></div>
              <span className="text-[#ffa600] font-medium text-sm">Live Data</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">Platform Statistics</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">Real-time blockchain metrics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* Active Contracts */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ffa600]/20 to-[#ffa600]/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              <div className="relative bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 hover:bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-[#ffa600]/10">
                <div className="text-center">
                  <div className="text-7xl md:text-8xl font-black text-[#ffa600] mb-4 leading-none">
                    {stats.loading ? (
                      <div className="animate-pulse bg-gray-200 h-20 w-32 rounded-2xl mx-auto"></div>
                    ) : (
                      (stats.activeContracts?.toLocaleString() ?? "0")
                    )}
                  </div>
                  <div className="text-lg font-semibold text-gray-700 mb-2">Active Contracts</div>
                  <div className="text-sm text-gray-500">Currently monitored</div>
                </div>
              </div>
            </div>

            {/* Total Distributed - Center Highlight */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ffa600] to-[#ff8c00] rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-700"></div>
              <div className="relative bg-gradient-to-br from-[#ffa600] to-[#ff8c00] rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <div className="text-center">
                  <div className="text-7xl md:text-8xl font-black text-white mb-4 leading-none">
                    {stats.loading ? (
                      <div className="animate-pulse bg-white/20 h-20 w-40 rounded-2xl mx-auto"></div>
                    ) : (
                      `${stats.totalDistributed ?? "0"}`
                    )}
                  </div>
                  <div className="text-lg font-semibold text-white/90 mb-2">tCORE2 Distributed</div>
                  <div className="text-sm text-white/70">To beneficiaries</div>

                </div>
              </div>
            </div>

            {/* Total Contracts */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff8c00]/20 to-[#ff8c00]/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              <div className="relative bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 hover:bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-[#ff8c00]/10">
                <div className="text-center">
                  <div className="text-7xl md:text-8xl font-black text-[#ff8c00] mb-4 leading-none">
                    {stats.loading ? (
                      <div className="animate-pulse bg-gray-200 h-20 w-32 rounded-2xl mx-auto"></div>
                    ) : (
                      (stats.totalContracts?.toLocaleString() ?? "0")
                    )}
                  </div>
                  <div className="text-lg font-semibold text-gray-700 mb-2">Total Contracts</div>
                  <div className="text-sm text-gray-500">Ever created</div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {stats.error && (
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-6 py-4">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-600 font-medium">{stats.error}</span>
              </div>
            </div>
          )}

          {/* Secondary Stats - Simplified */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 justify-items-center max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-300">
              <div className="text-4xl font-bold text-[#ffa600] mb-2">99.9%</div>
              <div className="text-gray-600 font-medium text-sm">Uptime</div>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-300">
              <div className="text-4xl font-bold text-[#ffa600] mb-2">24/7</div>
              <div className="text-gray-600 font-medium text-sm">Monitoring</div>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-300">
              <div className="text-4xl font-bold text-[#ffa600] mb-2">10+</div>
              <div className="text-gray-600 font-medium text-sm">Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof or Work Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-[#ffa600]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#ffa600]/10 border border-[#ffa600]/20 rounded-full px-4 py-2 mb-6">
              <span className="text-[#ffa600] font-medium text-sm">Live Contracts</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Recent Inheritance Contracts</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join these individuals + many more who are already securing their digital legacy...
            </p>
          </div>
          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden mb-16">
            <Marquee className="[--duration:60s]">
              {contracts.map((contract, index) => (
                <ContractCard 
                  key={`contract-${index}`}
                  address={contract.address} 
                  amount={contract.amount} 
                  time={contract.time} 
                />
              ))}
            </Marquee>

            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-gray-50"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-gray-50"></div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ffa600] via-[#ff8c00] to-[#ff7300]"></div>
        <div className="absolute inset-0 bg-black/10"></div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Secure Your Digital Assets?</h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <InteractiveHoverButton onClick={() => router.push("/dashboard")} className="text-lg font-semibold">
              Start Building Legacy
            </InteractiveHoverButton>
          </div>
        </div>
      </section>
      <NetworkInfoOverlay isOpen={showNetworkInfo} onClose={() => setShowNetworkInfo(false)} />
    </div>
  )
}
