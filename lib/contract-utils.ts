import 'dotenv/config'
import { formatEther } from 'viem'
import { type PublicClient } from 'viem'  
import { ContractDetails } from '@/types/contract'
import { FACTORY_ABI, INHERITANCE_ABI } from '@/lib/abis'

const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || "0x8f79150a124bd664CBAB4464dCbE0c80BC1B3D12"

export async function fetchAllContracts(address: string, publicClient: PublicClient) {
  const [userContractAddresses, beneficiaryContractAddresses] = await Promise.all([
    publicClient.readContract({
      address: FACTORY_ADDRESS as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: 'getUserContracts',
      args: [address as `0x${string}`]
    }) as Promise<readonly string[]>,
    publicClient.readContract({
      address: FACTORY_ADDRESS as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: 'getBeneficiaryContracts',
      args: [address as `0x${string}`]
    }) as Promise<readonly string[]>
  ])

  const [userContracts, beneficiaryContracts] = await Promise.all([
    Promise.all(userContractAddresses.map(addr => fetchContractDetails(addr, publicClient))),
    Promise.all(beneficiaryContractAddresses.map(addr => fetchContractDetails(addr, publicClient)))
  ])

  return {
    userContracts: userContracts.filter(Boolean) as ContractDetails[],
    beneficiaryContracts: beneficiaryContracts.filter(Boolean) as ContractDetails[]
  }
}

async function fetchContractDetails(contractAddress: string, publicClient: PublicClient): Promise<ContractDetails | null> {
  try {
    const result = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: INHERITANCE_ABI,
      functionName: 'getContractDetails'
    }) as readonly [string, bigint, bigint, bigint, boolean, boolean, bigint, boolean]

    const [beneficiary, amount, inactivityTime, lastActivity, triggered, claimed, timeRemaining, needsMonitoring] = result

    const owner = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: INHERITANCE_ABI,
      functionName: 'getOwner'
    }) as string

    const currentTime = Math.floor(Date.now() / 1000)
    const timeSinceActivity = currentTime - Number(lastActivity)
    const calculatedTimeRemaining = Math.max(0, Number(inactivityTime) - timeSinceActivity)

    let status = 'Active'
    if (claimed) status = 'Claimed'
    else if (triggered) status = 'Triggered - Ready to claim'
    else if (!needsMonitoring) status = 'Inactive'
    else if (timeSinceActivity >= Number(inactivityTime)) status = 'Inactive - Pending trigger'

    return {
      contractAddress,
      owner,
      beneficiary,
      amount: formatEther(amount),
      inactivityTime: Number(inactivityTime),
      lastActivity: Number(lastActivity),
      triggered,
      claimed,
      needsMonitoring,
      timeRemaining: calculatedTimeRemaining,
      status
    }
  } catch (err) {
    console.error('Error fetching contract details:', err)
    return null
  }
}
