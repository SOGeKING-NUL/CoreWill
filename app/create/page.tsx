"use client"

import { useState, useEffect } from "react"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"
import { parseEther, isAddress } from "viem"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Shield,
  Clock,
  DollarSign,
  User,
  Zap,
  HelpCircle,
  Info,
} from "lucide-react"
import Header from "@/components/header"
import { FACTORY_ABI } from "@/lib/abis"
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const FACTORY_ADDRESS = "0x8f79150a124bd664CBAB4464dCbE0c80BC1B3D12"
const CHAIN_ID = 1114

// Time presets with their values in seconds
const TIME_PRESETS = [
  { id: "2min", label: "2 minute", value: 120, description: "For testing purposes" },
  { id: "1h", label: "1 hour", value: 3600, description: "Short term" },
  { id: "1d", label: "1 day", value: 86400, description: "Daily check" },
  { id: "1w", label: "1 week", value: 604800, description: "Weekly check" },
  { id: "1m", label: "1 month", value: 2592000, description: "Monthly check" },
  { id: "3m", label: "3 months", value: 7776000, description: "Quarterly check" },
  { id: "6m", label: "6 months", value: 15552000, description: "Bi-annual check" },
  { id: "1y", label: "1 year", value: 31536000, description: "Annual check" },
]

// FAQ items
const FAQ_ITEMS = [
  {
    question: "How does the inheritance contract work?",
    answer:
      "The inheritance contract monitors your wallet activity. If you become inactive for the specified period, the contract is triggered, allowing your beneficiary to claim the funds you've set aside.",
  },
  {
    question: "Can I cancel or modify my contract?",
    answer:
      "Yes, you can reset the activity timer or perform an emergency withdrawal at any time from your dashboard, as long as the contract hasn't been triggered yet.",
  },
  {
    question: "How is wallet activity monitored?",
    answer:
      "Our monitoring service checks for any on-chain transactions from your wallet address. Any transaction you make will reset the inactivity timer.",
  },
  {
    question: "What happens after the inactivity period?",
    answer:
      "Once the inactivity period is reached, the contract is triggered and your beneficiary will be able to claim the funds. You'll receive notifications if you've connected an email.",
  },
  {
    question: "Is there a fee for creating a contract?",
    answer:
      "There's no platform fee, but you'll need to pay the standard blockchain gas fees for contract deployment and interactions.",
  },
]

export default function CreateContract() {
  const { address, isConnected, chain } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const router = useRouter()

  const [beneficiaryAddress, setBeneficiaryAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [inactivityTime, setInactivityTime] = useState("86400") // Default to 1 day
  const [selectedPreset, setSelectedPreset] = useState("1d")
  const [customTime, setCustomTime] = useState({ value: "", unit: "days" })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeInputMethod, setTimeInputMethod] = useState<"preset" | "custom">("preset")

  // Update inactivity time when preset changes
  useEffect(() => {
    const preset = TIME_PRESETS.find((p) => p.id === selectedPreset)
    if (preset) {
      setInactivityTime(preset.value.toString())
    }
  }, [selectedPreset])

  // Update inactivity time when custom time changes
  useEffect(() => {
    if (timeInputMethod === "custom" && customTime.value) {
      let seconds = Number.parseInt(customTime.value)

      // Convert to seconds based on unit
      switch (customTime.unit) {
        case "minutes":
          seconds *= 60
          break
        case "hours":
          seconds *= 3600
          break
        case "days":
          seconds *= 86400
          break
        case "weeks":
          seconds *= 604800
          break
        case "months":
          seconds *= 2592000
          break
        case "years":
          seconds *= 31536000
          break
      }

      setInactivityTime(seconds.toString())
    }
  }, [customTime, timeInputMethod])

  // Validation functions
  const isValidAddress = (addr: string): boolean => {
    return addr.length > 0 && isAddress(addr)
  }

  const isValidAmount = (amount: string): boolean => {
    const num = Number.parseFloat(amount)
    return !isNaN(num) && num > 0
  }

  const isValidInactivityTime = (time: string): boolean => {
    const num = Number.parseInt(time)
    return !isNaN(num) && num >= 60 // Minimum 1 minute (60 seconds)
  }

  // Format time duration for display
  const formatDuration = (seconds: number): string => {
    if (seconds <= 0) return "Invalid"

    const years = Math.floor(seconds / 31536000)
    seconds %= 31536000

    const months = Math.floor(seconds / 2592000)
    seconds %= 2592000

    const weeks = Math.floor(seconds / 604800)
    seconds %= 604800

    const days = Math.floor(seconds / 86400)
    seconds %= 86400

    const hours = Math.floor(seconds / 3600)
    seconds %= 3600

    const minutes = Math.floor(seconds / 60)

    const parts = []

    if (years > 0) parts.push(`${years}y`)
    if (months > 0) parts.push(`${months}m`)
    if (weeks > 0) parts.push(`${weeks}w`)
    if (days > 0) parts.push(`${days}d`)
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)

    return parts.length > 0 ? parts.slice(0, 2).join(" ") : "< 1m"
  }

  // Create new inheritance contract
  async function createInheritanceContract() {
    if (!walletClient || !beneficiaryAddress || !amount) return

    setError(null)

    if (!isValidAddress(beneficiaryAddress)) {
      setError("Invalid beneficiary address")
      return
    }

    if (!isValidAmount(amount)) {
      setError("Invalid amount")
      return
    }

    if (!isValidInactivityTime(inactivityTime)) {
      setError("Minimum 1 minute required")
      return
    }

    if (beneficiaryAddress.toLowerCase() === address?.toLowerCase()) {
      setError("Beneficiary cannot be your wallet")
      return
    }

    setCreating(true)
    try {
      const hash = await walletClient.writeContract({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: FACTORY_ABI,
        functionName: "deployInheritanceContract",
        args: [beneficiaryAddress as `0x${string}`, BigInt(inactivityTime)],
        value: parseEther(amount),
      })

      await publicClient!.waitForTransactionReceipt({ hash })

      // Success feedback
      setBeneficiaryAddress("")
      setAmount("")
      setInactivityTime("86400")

      // Show success and redirect
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (err: any) {
      let errorMessage = "Transaction failed"

      if (err.message?.includes("User rejected")) {
        errorMessage = "Transaction rejected"
      } else if (err.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds"
      } else if (err.shortMessage) {
        errorMessage = err.shortMessage
      }

      setError(errorMessage)
    } finally {
      setCreating(false)
    }
  }

  const isFormValid =
    isValidAddress(beneficiaryAddress) && isValidAmount(amount) && isValidInactivityTime(inactivityTime)

  const formatAddress = (address: string): string => {
    return address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : "Not set"
  }

  if (!isConnected || chain?.id !== CHAIN_ID) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-yellow-800 mb-3">Wrong Network</h2>
              <p className="text-yellow-700 mb-6">Switch to Core DAO Testnet2</p>
              <Button
                onClick={() => router.push("/dashboard")}
                className="bg-gradient-to-r from-[#ffa600] to-[#ff8c00]"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex flex-col">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#ffa600]/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-[#ffa600]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Header />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-start p-4 pt-20 pb-16 relative z-10">
        <div className="w-full max-w-4xl">
          {/* Back Button and Title */}
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-[#ffa600] hover:bg-[#ffa600]/10 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Inheritance Contract</h1>
            <p className="text-gray-600">Secure your digital legacy on the blockchain</p>
          </div>

          {/* Contract Preview Card - Highlighted at the top */}
          <div className="mb-8" color="#ffa600">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#ffa600] to-[#ff8c00] rounded-2xl flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Contract Preview</h2>
                    <p className="text-sm text-gray-600">Review your inheritance contract details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {/* Beneficiary */}
                  <div className="bg-gradient-to-br from-[#ffa600]/5 to-[#ff8c00]/5 border border-[#ffa600]/20 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-[#ffa600]" />
                      <h3 className="font-semibold text-gray-900">Beneficiary</h3>
                    </div>
                    <div className="font-mono text-sm bg-white/80 p-2 rounded-xl border border-gray-100 min-h-[2.5rem] flex items-center">
                      {beneficiaryAddress ? formatAddress(beneficiaryAddress) : "Not set"}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="bg-gradient-to-br from-[#ffa600]/5 to-[#ff8c00]/5 border border-[#ffa600]/20 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-[#ffa600]" />
                      <h3 className="font-semibold text-gray-900">Amount</h3>
                    </div>
                    <div className="font-bold text-[#ffa600] bg-white/80 p-2 rounded-xl border border-gray-100 min-h-[2.5rem] flex items-center">
                      {amount ? `${amount} tCORE2` : "0 tCORE2"}
                    </div>
                  </div>

                  {/* Inactivity Period */}
                  <div className="bg-gradient-to-br from-[#ffa600]/5 to-[#ff8c00]/5 border border-[#ffa600]/20 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-[#ffa600]" />
                      <h3 className="font-semibold text-gray-900">Inactivity Period</h3>
                    </div>
                    <div className="font-medium text-gray-800 bg-white/80 p-2 rounded-xl border border-gray-100 min-h-[2.5rem] flex items-center">
                      {formatDuration(Number.parseInt(inactivityTime) || 0)}
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                <div className="mt-6 text-center">
                  {!isFormValid ? (
                    <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-2 inline-flex items-center gap-2">
                      <Info className="h-4 w-4 text-gray-400" />
                      Complete all fields below to deploy your contract
                    </div>
                  ) : (
                    <div className="text-sm text-[#ffa600] bg-[#ffa600]/5 rounded-xl p-2 inline-flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Your contract is ready to deploy
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contract Details Form */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Contract Details</h2>
                  <p className="text-sm text-gray-600">Enter the information for your inheritance contract</p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <span className="text-red-800 text-sm font-medium">{error}</span>
                </div>
              )}

              <div className="space-y-6">
                {/* Beneficiary Address */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <User className="h-4 w-4 text-[#ffa600]" />
                    Beneficiary Address *
                  </Label>
                  <Input
                    placeholder="0x742d35Cc..."
                    value={beneficiaryAddress}
                    onChange={(e) => setBeneficiaryAddress(e.target.value)}
                    className={`h-12 rounded-xl border-2 transition-all ${
                      beneficiaryAddress && !isValidAddress(beneficiaryAddress)
                        ? "border-red-300 bg-red-50"
                        : beneficiaryAddress && isValidAddress(beneficiaryAddress)
                          ? "border-[#ffa600]/30 bg-[#ffa600]/5"
                          : "border-gray-200 hover:border-[#ffa600]/30"
                    }`}
                  />
                  {beneficiaryAddress && (
                    <div className="flex items-center gap-1 text-xs">
                      {isValidAddress(beneficiaryAddress) ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-[#ffa600]" />
                          <span className="text-[#ffa600]">Valid address</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 text-red-600" />
                          <span className="text-red-600">Invalid address format</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-[#ffa600]" />
                    Amount (tCORE2) *
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="1.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`h-12 rounded-xl border-2 transition-all ${
                      amount && !isValidAmount(amount)
                        ? "border-red-300 bg-red-50"
                        : amount && isValidAmount(amount)
                          ? "border-[#ffa600]/30 bg-[#ffa600]/5"
                          : "border-gray-200 hover:border-[#ffa600]/30"
                    }`}
                  />
                  {amount && !isValidAmount(amount) && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      Amount must be greater than 0
                    </div>
                  )}
                </div>

                {/* Inactivity Period - Improved UI */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#ffa600]" />
                    Inactivity Period *
                  </Label>

                  <Tabs defaultValue="preset" onValueChange={(v) => setTimeInputMethod(v as "preset" | "custom")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="preset">Preset Options</TabsTrigger>
                      <TabsTrigger value="custom">Custom Duration</TabsTrigger>
                    </TabsList>

                    <TabsContent value="preset" className="mt-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {TIME_PRESETS.slice(0, 8).map((preset) => (
                          <Button
                            key={preset.id}
                            variant={selectedPreset === preset.id ? "default" : "outline"}
                            onClick={() => setSelectedPreset(preset.id)}
                            className={`h-auto py-3 px-4 rounded-xl flex flex-col items-center justify-center transition-all ${
                              selectedPreset === preset.id
                                ? "bg-gradient-to-r from-[#ffa600] to-[#ff8c00] text-white"
                                : "border-[#ffa600]/20 text-[#ffa600] hover:bg-[#ffa600]/10"
                            }`}
                          >
                            <span className="font-bold text-sm">{preset.label}</span>
                            <span className="text-xs opacity-75 mt-1">{preset.description}</span>
                          </Button>
                        ))}
                      </div>

                      {/* Testing Option Highlight */}
                      {selectedPreset === "1min" && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                          <span className="text-xs text-yellow-800">
                            The 1-minute option is for testing purposes only. In a real scenario, you would typically
                            use longer periods.
                          </span>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="custom" className="mt-4">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Input
                            type="number"
                            min="1"
                            placeholder="Duration"
                            value={customTime.value}
                            onChange={(e) => setCustomTime({ ...customTime, value: e.target.value })}
                            className="h-12 rounded-xl border-2 border-gray-200 hover:border-[#ffa600]/30"
                          />
                        </div>
                        <div className="w-1/3">
                          <Select
                            value={customTime.unit}
                            onValueChange={(value) => setCustomTime({ ...customTime, unit: value })}
                          >
                            <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 hover:border-[#ffa600]/30">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="minutes">Minutes</SelectItem>
                              <SelectItem value="hours">Hours</SelectItem>
                              <SelectItem value="days">Days</SelectItem>
                              <SelectItem value="weeks">Weeks</SelectItem>
                              <SelectItem value="months">Months</SelectItem>
                              <SelectItem value="years">Years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm text-gray-600">Equivalent to:</span>
                        <span className="text-sm font-medium text-[#ffa600]">
                          {formatDuration(Number.parseInt(inactivityTime) || 0)}
                        </span>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Deploy Button */}
                <div className="pt-4 flex justify-center">
                  <Button
                    onClick={createInheritanceContract}
                    disabled={creating || !isFormValid}
                    className="w-80 h-14 text-lg font-semibold"
                    size="lg"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Deploying Contract...
                      </>
                    ) : (
                      <>
                        Deploy Inheritance Contract
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#ffa600]/80 to-[#ff8c00]/80 rounded-2xl flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h2>
                  <p className="text-sm text-gray-600">Learn more about inheritance contracts</p>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {FAQ_ITEMS.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-medium text-gray-900 hover:text-[#ffa600]">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
