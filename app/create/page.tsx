'use client'

import { useState } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { parseEther, isAddress } from 'viem'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import Header from '@/components/header'
import { FACTORY_ABI } from '@/lib/abis'
import Footer from '@/components/footer'

const FACTORY_ADDRESS = '0x8f79150a124bd664CBAB4464dCbE0c80BC1B3D12'
const CHAIN_ID = 1114

export default function CreateContract() {
  const { address, isConnected, chain } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const router = useRouter()
  
  const [newBeneficiary, setNewBeneficiary] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newInactivityTime, setNewInactivityTime] = useState('86400') // 24 hours default
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validation functions
  const isValidAddress = (addr: string): boolean => {
    return addr.length > 0 && isAddress(addr)
  }

  const isValidAmount = (amount: string): boolean => {
    const num = parseFloat(amount)
    return !isNaN(num) && num > 0
  }

  const isValidInactivityTime = (time: string): boolean => {
    const num = parseInt(time)
    return !isNaN(num) && num >= 60 // Minimum 1 min
  }

  // Format time duration
  const formatDuration = (seconds: number): string => {
    if (seconds <= 0) return 'Invalid'
    
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  // Preset time options
  const timePresets = [
    { label: '1 Hour', value: '3600' },
    { label: '1 Day', value: '86400' },
    { label: '1 Week', value: '604800' },
    { label: '1 Month', value: '2592000' },
    { label: '6 Months', value: '15552000' },
    { label: '1 Year', value: '31536000' }
  ]

  // Create new inheritance contract
  async function createInheritanceContract() {
    if (!walletClient || !newBeneficiary || !newAmount) return
    
    // Clear previous errors
    setError(null)
    
    // Validate inputs
    if (!isValidAddress(newBeneficiary)) {
      setError('Please enter a valid beneficiary address')
      return
    }
    
    if (!isValidAmount(newAmount)) {
      setError('Please enter a valid amount greater than 0')
      return
    }
    
    if (!isValidInactivityTime(newInactivityTime)) {
      setError('Inactivity time must be at least 1 hour (3600 seconds)')
      return
    }

    // Check if beneficiary is the same as sender
    if (newBeneficiary.toLowerCase() === address?.toLowerCase()) {
      setError('Beneficiary cannot be the same as your wallet address')
      return
    }
    
    setCreating(true)
    try {
      console.log('Creating inheritance contract with:', {
        beneficiary: newBeneficiary,
        amount: newAmount,
        inactivityTime: newInactivityTime
      })

      const hash = await walletClient.writeContract({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: FACTORY_ABI,
        functionName: 'deployInheritanceContract',
        args: [newBeneficiary as `0x${string}`, BigInt(newInactivityTime)],
        value: parseEther(newAmount)
      })

      console.log('Transaction hash:', hash)

      // Wait for transaction confirmation
      const receipt = await publicClient!.waitForTransactionReceipt({ hash })
      
      console.log('Transaction confirmed:', receipt)
      
      // Success - redirect to dashboard
      alert('Inheritance contract created successfully!')
      
      // Clear form
      setNewBeneficiary('')
      setNewAmount('')
      setNewInactivityTime('86400')
      
      // Redirect to dashboard
      router.push('/dashboard')
      
    } catch (err: any) {
      console.error('Failed to create contract:', err)
      
      // Parse error message
      let errorMessage = 'Failed to create inheritance contract'
      
      if (err.message?.includes('User rejected')) {
        errorMessage = 'Transaction was rejected by user'
      } else if (err.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction'
      } else if (err.message?.includes('Invalid beneficiary')) {
        errorMessage = 'Invalid beneficiary address'
      } else if (err.shortMessage) {
        errorMessage = err.shortMessage
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setCreating(false)
    }
  }

  const isFormValid = isValidAddress(newBeneficiary) && 
                     isValidAmount(newAmount) && 
                     isValidInactivityTime(newInactivityTime)

  if (!isConnected || chain?.id !== CHAIN_ID) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
              <p className="text-muted-foreground mb-4">
                Please connect your wallet and switch to Core DAO Testnet2 (Chain ID: 1114)
              </p>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="mt-4"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      
      <div className="max-w-4xl mx-auto p-4 pt-20">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Create New Inheritance Contract
            </CardTitle>
            <CardDescription>
              Set up a new inheritance contract with a beneficiary and inactivity period. 
              The contract will automatically transfer funds to your beneficiary if you remain inactive for the specified time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="beneficiary">Beneficiary Address *</Label>
              <Input
                id="beneficiary"
                placeholder="0x742d35Cc6634C0532925a3b8D3Ac6C5d3C3FaE4A"
                value={newBeneficiary}
                onChange={(e) => setNewBeneficiary(e.target.value)}
                className={newBeneficiary && !isValidAddress(newBeneficiary) ? 'border-red-300' : ''}
              />
              {newBeneficiary && !isValidAddress(newBeneficiary) && (
                <p className="text-sm text-red-600">Please enter a valid Ethereum address</p>
              )}
              {newBeneficiary && isValidAddress(newBeneficiary) && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Valid address
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (tCORE2) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="1.0"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className={newAmount && !isValidAmount(newAmount) ? 'border-red-300' : ''}
              />
              {newAmount && !isValidAmount(newAmount) && (
                <p className="text-sm text-red-600">Amount must be greater than 0</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="inactivity">Inactivity Time</Label>
              
              {/* Preset buttons */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                {timePresets.map((preset) => (
                  <Button
                    key={preset.value}
                    variant={newInactivityTime === preset.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewInactivityTime(preset.value)}
                    type="button"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              <Input
                id="inactivity"
                type="number"
                min="3600"
                value={newInactivityTime}
                onChange={(e) => setNewInactivityTime(e.target.value)}
                className={newInactivityTime && !isValidInactivityTime(newInactivityTime) ? 'border-red-300' : ''}
              />
              <p className="text-sm text-muted-foreground">
                Duration: {formatDuration(parseInt(newInactivityTime) || 0)}
                {newInactivityTime && !isValidInactivityTime(newInactivityTime) && (
                  <span className="text-red-600 ml-2">Minimum 1 min required</span>
                )}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your wallet activity is monitored automatically</li>
                <li>• If inactive for the specified time, inheritance is triggered</li>
                <li>• Your beneficiary can then claim the funds</li>
                <li>• You can reset activity or emergency withdraw anytime</li>
              </ul>
            </div>

            <Button 
              onClick={createInheritanceContract}
              disabled={creating || !isFormValid}
              className="w-full"
              size="lg"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Contract...
                </>
              ) : (
                'Create Inheritance Contract'
              )}
            </Button>

            {!isFormValid && (
              <p className="text-sm text-muted-foreground text-center">
                Please fill all required fields with valid values
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
