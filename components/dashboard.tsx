'use client'

import { useEffect, useState } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Clock, DollarSign, Users, Wallet, Copy } from 'lucide-react'
import Header from '@/components/header'

const FACTORY_ADDRESS = '0x8f79150a124bd664CBAB4464dCbE0c80BC1B3D12'
const CHAIN_ID = 1114

const FACTORY_ABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "InheritanceFactory__ContractAlreadyInactive",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "contractAddress",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "beneficiary",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "inactivityTime",
				"type": "uint256"
			}
		],
		"name": "ContractDeployed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "contractAddress",
				"type": "address"
			}
		],
		"name": "MonitoringDeactivated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_beneficiary",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_inactivityTime",
				"type": "uint256"
			}
		],
		"name": "deployInheritanceContract",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "contractAddress",
				"type": "address"
			}
		],
		"name": "emergencyDeactivateContract",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getActiveContractCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getActiveContracts",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "beneficiary",
				"type": "address"
			}
		],
		"name": "getBeneficiaryContracts",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getContractCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getDeployedContracts",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getMonitoringService",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUserContracts",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "contractAddress",
				"type": "address"
			}
		],
		"name": "getisContractActive",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "contractAddress",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "walletHasActivity",
				"type": "bool"
			}
		],
		"name": "processContractMonitoring",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
] as const
const INHERITANCE_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_beneficiary",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_monitoringServiceAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_inactivityTime",
				"type": "uint256"
			}
		],
		"stateMutability": "payable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "Inheritance__WithdrawalFailed",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "Inhertiance__AmountTransferToBeneficiaryFailed",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "ReentrancyGuardReentrantCall",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "ActivityUpdated",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "claimInheritance",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "emergencyWithdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "beneficiary",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "InheritanceClaimed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "InheritanceTriggered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [],
		"name": "MonitoringDeactivated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bool",
				"name": "walletHasActivity",
				"type": "bool"
			}
		],
		"name": "processInheritanceCheck",
		"outputs": [
			{
				"internalType": "bool",
				"name": "needsDeactivation",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "resetActivity",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "fallback"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [],
		"name": "getAmount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getBeneficiary",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getContractDetails",
		"outputs": [
			{
				"internalType": "address",
				"name": "_beneficiary",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_inactivityTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_lastActivity",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "_triggered",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "_claimed",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "_timeRemaining",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "_needsMonitoring",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getInactivityTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getIsActiveForMonitoring",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getIsInheritanceClaimed",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getIsInheritanceTriggered",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getLastActivityTimestamp",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getMonitoringServiceAddress",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getOwner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] as const

function CopyButton({ value }: { value: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(value)}
      title="Copy to clipboard"
      className="ml-2 p-1 hover:bg-gray-100 rounded"
    >
      <Copy className="h-4 w-4" />
    </button>
  )
}

interface ContractDetails {
  contractAddress: string
  owner: string
  beneficiary: string
  amount: string
  inactivityTime: number
  lastActivity: number
  triggered: boolean
  claimed: boolean
  needsMonitoring: boolean
  timeRemaining: number
  status: string
}

export default function Dashboard() {
  const { address, isConnected, chain } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  
  const [userContracts, setUserContracts] = useState<ContractDetails[]>([])
  const [beneficiaryContracts, setBeneficiaryContracts] = useState<ContractDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000))
  const [newBeneficiary, setNewBeneficiary] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newInactivityTime, setNewInactivityTime] = useState('86400')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(interval)
  }, [])

  const getContractStatus = (contract: ContractDetails): string => {
    if (contract.claimed) return 'Claimed'
    if (contract.triggered) return 'Triggered - Ready to claim'
    if (!contract.needsMonitoring) return 'Inactive'
    const timeSinceActivity = currentTime - contract.lastActivity
    if (timeSinceActivity >= contract.inactivityTime) return 'Inactive - Pending trigger'
    return 'Active'
  }

  const getTimeRemaining = (contract: ContractDetails): number => {
    if (contract.triggered || contract.claimed) return 0
    const timeSinceActivity = currentTime - contract.lastActivity
    const remaining = contract.inactivityTime - timeSinceActivity
    return Math.max(0, remaining)
  }

  const formatDuration = (seconds: number): string => {
    if (seconds <= 0) return 'Expired'
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  async function fetchContractDetails(contractAddress: string): Promise<ContractDetails | null> {
    try {
      const result = await publicClient!.readContract({
        address: contractAddress as `0x${string}`,
        abi: INHERITANCE_ABI,
        functionName: 'getContractDetails'
      }) as readonly [string, bigint, bigint, bigint, boolean, boolean, bigint, boolean]

      const [
        beneficiary,
        amount,
        inactivityTime,
        lastActivity,
        triggered,
        claimed,
        _,
        needsMonitoring
      ] = result

      const owner = await publicClient!.readContract({
        address: contractAddress as `0x${string}`,
        abi: INHERITANCE_ABI,
        functionName: 'getOwner'
      }) as string

      const contractDetails: ContractDetails = {
        contractAddress,
        owner,
        beneficiary,
        amount: formatEther(amount),
        inactivityTime: Number(inactivityTime),
        lastActivity: Number(lastActivity),
        triggered,
        claimed,
        needsMonitoring,
        timeRemaining: 0,
        status: ''
      }
      contractDetails.timeRemaining = getTimeRemaining(contractDetails)
      contractDetails.status = getContractStatus(contractDetails)
      return contractDetails
    } catch (err) {
      console.error('Error fetching contract details:', err)
      return null
    }
  }

  async function loadUserContracts() {
    if (!address || !publicClient) return
    setLoading(true)
    try {
      const contractAddresses = await publicClient.readContract({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: FACTORY_ABI,
        functionName: 'getUserContracts',
        args: [address]
      }) as readonly string[]
      const detailsPromises = contractAddresses.map(fetchContractDetails)
      const details = await Promise.all(detailsPromises)
      setUserContracts(details.filter(Boolean) as ContractDetails[])
    } catch (err) {
      setError('Failed to load user contracts')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadBeneficiaryContracts() {
    if (!address || !publicClient) return
    setLoading(true)
    try {
      const contractAddresses = await publicClient.readContract({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: FACTORY_ABI,
        functionName: 'getBeneficiaryContracts',
        args: [address]
      }) as readonly string[]
      const detailsPromises = contractAddresses.map(fetchContractDetails)
      const details = await Promise.all(detailsPromises)
      setBeneficiaryContracts(details.filter(Boolean) as ContractDetails[])
    } catch (err) {
      setError('Failed to load beneficiary contracts')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    loadUserContracts()
    loadBeneficiaryContracts()
  }

  async function createInheritanceContract() {
    if (!walletClient || !newBeneficiary || !newAmount) return
    setCreating(true)
    try {
      const hash = await walletClient.writeContract({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: FACTORY_ABI,
        functionName: 'deployInheritanceContract',
        args: [newBeneficiary as `0x${string}`, BigInt(newInactivityTime)],
        value: parseEther(newAmount)
      })
      await publicClient!.waitForTransactionReceipt({ hash })
      alert('Inheritance contract created successfully!')
      setNewBeneficiary('')
      setNewAmount('')
      setNewInactivityTime('86400')
      refreshData()
    } catch (err) {
      console.error('Failed to create contract:', err)
      alert('Failed to create inheritance contract')
    } finally {
      setCreating(false)
    }
  }

  async function claimInheritance(contractAddress: string) {
    if (!walletClient) return
    try {
      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: INHERITANCE_ABI,
        functionName: 'claimInheritance'
      })
      await publicClient!.waitForTransactionReceipt({ hash })
      alert('Inheritance claimed successfully!')
      refreshData()
    } catch (err) {
      console.error('Claim failed:', err)
      alert('Failed to claim inheritance')
    }
  }

  async function emergencyWithdraw(contractAddress: string) {
    if (!walletClient) return
    try {
      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: INHERITANCE_ABI,
        functionName: 'emergencyWithdraw'
      })
      await publicClient!.waitForTransactionReceipt({ hash })
      alert('Emergency withdrawal successful!')
      refreshData()
    } catch (err) {
      console.error('Emergency withdraw failed:', err)
      alert('Failed to withdraw')
    }
  }

  async function resetActivity(contractAddress: string) {
    if (!walletClient) return
    try {
      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: INHERITANCE_ABI,
        functionName: 'resetActivity'
      })
      await publicClient!.waitForTransactionReceipt({ hash })
      alert('Activity reset successful!')
      refreshData()
    } catch (err) {
      console.error('Reset activity failed:', err)
      alert('Failed to reset activity')
    }
  }

  const navigateToCreateTab = () => {
    setTimeout(() => {
      const createTab = document.querySelector('[data-value="create"]') as HTMLElement
      if (createTab) createTab.click()
    }, 50)
  }

  useEffect(() => {
    if (isConnected && chain?.id === CHAIN_ID) {
      refreshData()
    } else {
      setUserContracts([])
      setBeneficiaryContracts([])
    }
  }, [address, isConnected, chain])

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
            <CardHeader className="text-center">
              <CardTitle>Welcome to InheritanceDAO</CardTitle>
              <CardDescription>
                Connect your wallet to manage your digital asset inheritance
              </CardDescription>
            </CardHeader>
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
            <CardHeader className="text-center">
              <CardTitle className="text-yellow-800">Wrong Network</CardTitle>
              <CardDescription className="text-yellow-600">
                Please switch to Core DAO Testnet2 (Chain ID: 1114)
              </CardDescription>
            </CardHeader>
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

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="my-contracts">My Contracts</TabsTrigger>
            <TabsTrigger value="beneficiary">Beneficiary</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* ... Overview content as before ... */}
          </TabsContent>

          <TabsContent value="my-contracts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">My Inheritance Contracts</h2>
              <Button onClick={refreshData} disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
            <Button className="mb-4" onClick={navigateToCreateTab}>
              Create New
            </Button>
            {userContracts.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No inheritance contracts created yet.</p>
                  <Button className="mt-4" onClick={navigateToCreateTab}>
                    Create Your First Contract
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userContracts.map((contract) => (
                  <Card key={contract.contractAddress} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center">
                          Contract {contract.contractAddress.slice(0, 8)}...
                          <CopyButton value={contract.contractAddress} />
                        </CardTitle>
                        <Badge variant={contract.status === 'Active' ? 'default' : 
                                      contract.status === 'Triggered - Ready to claim' ? 'destructive' : 'secondary'}>
                          {contract.status}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center">
                        Beneficiary: {contract.beneficiary.slice(0, 10)}...
                        <CopyButton value={contract.beneficiary} />
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Amount</p>
                          <p className="text-muted-foreground">{contract.amount} tCORE2</p>
                        </div>
                        <div>
                          <p className="font-medium">Inactivity Period</p>
                          <p className="text-muted-foreground">{formatDuration(contract.inactivityTime)}</p>
                        </div>
                        <div>
                          <p className="font-medium">Last Activity</p>
                          <p className="text-muted-foreground">
                            {new Date(contract.lastActivity * 1000).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Time Remaining</p>
                          <p className="text-muted-foreground">{formatDuration(contract.timeRemaining)}</p>
                        </div>
                      </div>
                      {!contract.triggered && (
                        <div className="flex flex-col gap-2">
                          <Button 
                            onClick={() => resetActivity(contract.contractAddress)}
                            variant="outline"
                            size="sm"
                          >
                            Reset Activity
                          </Button>
                          <Button 
                            onClick={() => emergencyWithdraw(contract.contractAddress)}
                            variant="destructive"
                            size="sm"
                          >
                            Emergency Withdraw
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {/* Create New Contract Form */}
            <Card className="max-w-2xl mx-auto mt-8">
              <CardHeader>
                <CardTitle>Create New Inheritance Contract</CardTitle>
                <CardDescription>
                  Set up a new inheritance contract with a beneficiary and inactivity period
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="beneficiary">Beneficiary Address</Label>
                  <Input
                    id="beneficiary"
                    placeholder="0x..."
                    value={newBeneficiary}
                    onChange={(e) => setNewBeneficiary(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (tCORE2)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="1.0"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inactivity">Inactivity Time (seconds)</Label>
                  <Input
                    id="inactivity"
                    type="number"
                    value={newInactivityTime}
                    onChange={(e) => setNewInactivityTime(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Current: {formatDuration(parseInt(newInactivityTime) || 0)}
                  </p>
                </div>
                <Button 
                  onClick={createInheritanceContract}
                  disabled={creating || !newBeneficiary || !newAmount}
                  className="w-full"
                >
                  {creating ? 'Creating Contract...' : 'Create Inheritance Contract'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="beneficiary" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Beneficiary Contracts</h2>
              <Button onClick={refreshData} disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
            {beneficiaryContracts.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No beneficiary contracts found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {beneficiaryContracts.map((contract) => (
                  <Card key={contract.contractAddress} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center">
                          Contract {contract.contractAddress.slice(0, 8)}...
                          <CopyButton value={contract.contractAddress} />
                        </CardTitle>
                        <Badge variant={contract.status === 'Active' ? 'default' : 
                                      contract.status === 'Triggered - Ready to claim' ? 'destructive' : 'secondary'}>
                          {contract.status}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center">
                        Owner: {contract.owner.slice(0, 10)}...
                        <CopyButton value={contract.owner} />
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Amount</p>
                          <p className="text-muted-foreground">{contract.amount} tCORE2</p>
                        </div>
                        <div>
                          <p className="font-medium">Inactivity Period</p>
                          <p className="text-muted-foreground">{formatDuration(contract.inactivityTime)}</p>
                        </div>
                        <div>
                          <p className="font-medium">Last Activity</p>
                          <p className="text-muted-foreground">
                            {new Date(contract.lastActivity * 1000).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Time Remaining</p>
                          <p className="text-muted-foreground">{formatDuration(contract.timeRemaining)}</p>
                        </div>
                      </div>
                      {contract.triggered && !contract.claimed && (
                        <Button 
                          onClick={() => claimInheritance(contract.contractAddress)}
                          className="w-full"
                        >
                          Claim Inheritance
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
