'use client'

import { useEffect, useState } from 'react'
import { useAccount, useBalance, usePublicClient, useWalletClient } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Clock, DollarSign, Users, Wallet, Play, Square, RefreshCw, Activity } from 'lucide-react'
import Header from '@/components/header'

// Contract addresses and configuration
const FACTORY_ADDRESS = '0x8f79150a124bd664CBAB4464dCbE0c80BC1B3D12'
const MONITORING_ADDRESS = '0x4Ff64D715C377b4e96d533e3dAE2C5c7B00E6D24'
const CHAIN_ID = 1114

// Contract ABIs

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
		"stateMutability": "payable",
		"type": "fallback"
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
		"type": "receive"
	}
] as const

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

interface MonitoringStatus {
  isRunning: boolean
  walletAddress: string
  lastCheck: string
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
  
  // Monitoring state
  const [monitoringStatus, setMonitoringStatus] = useState<MonitoringStatus | null>(null)
  const [monitoringLoading, setMonitoringLoading] = useState(false)
  
  // New contract form state
  const [newBeneficiary, setNewBeneficiary] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newInactivityTime, setNewInactivityTime] = useState('86400') // 24 hours default
  const [creating, setCreating] = useState(false)

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Check monitoring status on load and periodically
  useEffect(() => {
    checkMonitoringStatus()
    const interval = setInterval(checkMonitoringStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Helper function to get contract status
  const getContractStatus = (contract: ContractDetails): string => {
    if (contract.claimed) return 'Claimed'
    if (contract.triggered) return 'Triggered - Ready to claim'
    if (!contract.needsMonitoring) return 'Inactive'
    
    const timeSinceActivity = currentTime - contract.lastActivity
    if (timeSinceActivity >= contract.inactivityTime) {
      return 'Inactive - Pending trigger'
    }
    return 'Active'
  }

  // Helper function to calculate time remaining
  const getTimeRemaining = (contract: ContractDetails): number => {
    if (contract.triggered || contract.claimed) return 0
    const timeSinceActivity = currentTime - contract.lastActivity
    const remaining = contract.inactivityTime - timeSinceActivity
    return Math.max(0, remaining)
  }

  // Format time duration
  const formatDuration = (seconds: number): string => {
    if (seconds <= 0) return 'Expired'
    
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  // Monitoring service functions
  async function checkMonitoringStatus() {
    try {
      const response = await fetch('/api/monitoring/status')
      const data = await response.json()
      if (data.success) {
        setMonitoringStatus(data.status)
      }
    } catch (error) {
      console.error('Failed to get monitoring status:', error)
    }
  }

  async function startMonitoring() {
    setMonitoringLoading(true)
    try {
      const response = await fetch('/api/monitoring/start', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success) {
        alert('Monitoring service started successfully!')
        await checkMonitoringStatus()
      } else {
        alert(`Failed to start monitoring: ${data.error}`)
      }
    } catch (error) {
      console.error('Error starting monitoring:', error)
      alert('Failed to start monitoring service')
    } finally {
      setMonitoringLoading(false)
    }
  }

  async function stopMonitoring() {
    setMonitoringLoading(true)
    try {
      const response = await fetch('/api/monitoring/stop', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success) {
        alert('Monitoring service stopped successfully!')
        await checkMonitoringStatus()
      } else {
        alert(`Failed to stop monitoring: ${data.error}`)
      }
    } catch (error) {
      console.error('Error stopping monitoring:', error)
      alert('Failed to stop monitoring service')
    } finally {
      setMonitoringLoading(false)
    }
  }

  // Fetch contract details
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
        timeRemaining,
        needsMonitoring
      ] = result

      // Get owner separately
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

  // Load user contracts (where user is owner)
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

  // Load beneficiary contracts (where user is beneficiary)
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

  // Refresh all data
  const refreshData = () => {
    loadUserContracts()
    loadBeneficiaryContracts()
    checkMonitoringStatus()
  }

  // Create new inheritance contract
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

      // Wait for transaction confirmation
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

  // Claim inheritance
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

  // Emergency withdraw
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

  // Reset activity
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

  // Navigate to create tab
  const navigateToCreateTab = () => {
    const createTab = document.querySelector('[data-value="create"]') as HTMLElement
    if (createTab) {
      createTab.click()
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

        {/* Monitoring Status Banner */}
        <Card className={`mb-6 ${monitoringStatus?.isRunning ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className={`h-5 w-5 ${monitoringStatus?.isRunning ? 'text-green-600' : 'text-orange-600'}`} />
                <div>
                  <p className={`font-medium ${monitoringStatus?.isRunning ? 'text-green-800' : 'text-orange-800'}`}>
                    Monitoring Service: {monitoringStatus?.isRunning ? 'Active' : 'Inactive'}
                  </p>
                  <p className={`text-sm ${monitoringStatus?.isRunning ? 'text-green-600' : 'text-orange-600'}`}>
                    {monitoringStatus?.isRunning 
                      ? `Monitoring contracts automatically. Last check: ${monitoringStatus.lastCheck ? new Date(monitoringStatus.lastCheck).toLocaleTimeString() : 'Never'}`
                      : 'Monitoring service is not running. Contracts will not be automatically processed.'
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={startMonitoring}
                  disabled={monitoringStatus?.isRunning || monitoringLoading}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  {monitoringLoading ? 'Starting...' : 'Start'}
                </Button>
                <Button 
                  onClick={stopMonitoring}
                  disabled={!monitoringStatus?.isRunning || monitoringLoading}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  {monitoringLoading ? 'Stopping...' : 'Stop'}
                </Button>
                <Button 
                  onClick={checkMonitoringStatus}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="my-contracts">My Contracts</TabsTrigger>
            <TabsTrigger value="beneficiary">Beneficiary</TabsTrigger>
            <TabsTrigger value="create" data-value="create">Create New</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    My Contracts
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userContracts.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Contracts you created
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Beneficiary Contracts
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{beneficiaryContracts.length}</div>
                  <p className="text-xs text-muted-foreground">
                    You're a beneficiary
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Value
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(userContracts.reduce((sum, c) => sum + parseFloat(c.amount), 0) +
                      beneficiaryContracts.reduce((sum, c) => sum + parseFloat(c.amount), 0)).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    tCORE2 in contracts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Monitoring
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userContracts.filter(c => c.needsMonitoring).length + 
                     beneficiaryContracts.filter(c => c.needsMonitoring).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Contracts being monitored
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates from your inheritance contracts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...userContracts, ...beneficiaryContracts]
                    .sort((a, b) => b.lastActivity - a.lastActivity)
                    .slice(0, 5)
                    .map((contract) => (
                      <div key={contract.contractAddress} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {contract.contractAddress.slice(0, 10)}...
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Last activity: {new Date(contract.lastActivity * 1000).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={contract.status === 'Active' ? 'default' : 
                                      contract.status === 'Triggered - Ready to claim' ? 'destructive' : 'secondary'}>
                          {contract.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-contracts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">My Inheritance Contracts</h2>
              <Button onClick={refreshData} disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>

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
                        <CardTitle className="text-lg">
                          Contract {contract.contractAddress.slice(0, 8)}...
                        </CardTitle>
                        <Badge variant={contract.status === 'Active' ? 'default' : 
                                      contract.status === 'Triggered - Ready to claim' ? 'destructive' : 'secondary'}>
                          {contract.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        Beneficiary: {contract.beneficiary.slice(0, 10)}...
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
                        <CardTitle className="text-lg">
                          Contract {contract.contractAddress.slice(0, 8)}...
                        </CardTitle>
                        <Badge variant={contract.status === 'Active' ? 'default' : 
                                      contract.status === 'Triggered - Ready to claim' ? 'destructive' : 'secondary'}>
                          {contract.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        Owner: {contract.owner.slice(0, 10)}...
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

          <TabsContent value="create" className="space-y-6">
            <Card className="max-w-2xl mx-auto">
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

          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monitoring Service Control</CardTitle>
                <CardDescription>
                  Manage the automated inheritance monitoring system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Service Status</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={monitoringStatus?.isRunning ? 'default' : 'secondary'}>
                          {monitoringStatus?.isRunning ? 'Running' : 'Stopped'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {monitoringStatus?.isRunning ? 'Actively monitoring contracts' : 'No active monitoring'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Monitoring Wallet</h3>
                      <p className="text-sm text-muted-foreground font-mono">
                        {monitoringStatus?.walletAddress || 'Not available'}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Last Check</h3>
                      <p className="text-sm text-muted-foreground">
                        {monitoringStatus?.lastCheck 
                          ? new Date(monitoringStatus.lastCheck).toLocaleString()
                          : 'Never'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Active Contracts</h3>
                      <p className="text-2xl font-bold">
                        {userContracts.filter(c => c.needsMonitoring).length + 
                         beneficiaryContracts.filter(c => c.needsMonitoring).length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Contracts requiring monitoring
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Monitoring Actions</h3>
                      <div className="flex flex-col gap-2">
                        <Button 
                          onClick={startMonitoring}
                          disabled={monitoringStatus?.isRunning || monitoringLoading}
                          className="flex items-center gap-2"
                        >
                          <Play className="h-4 w-4" />
                          {monitoringLoading ? 'Starting...' : 'Start Monitoring'}
                        </Button>
                        <Button 
                          onClick={stopMonitoring}
                          disabled={!monitoringStatus?.isRunning || monitoringLoading}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Square className="h-4 w-4" />
                          {monitoringLoading ? 'Stopping...' : 'Stop Monitoring'}
                        </Button>
                        <Button 
                          onClick={checkMonitoringStatus}
                          variant="ghost"
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Refresh Status
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">How Monitoring Works</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• The monitoring service checks all active contracts every 60 seconds</p>
                    <p>• It detects wallet activity by monitoring balance changes and transactions</p>
                    <p>• When activity is detected, the contract's activity timestamp is updated</p>
                    <p>• If no activity is detected for the specified inactivity period, inheritance is triggered</p>
                    <p>• Contracts are automatically removed from monitoring after inheritance is triggered or claimed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
