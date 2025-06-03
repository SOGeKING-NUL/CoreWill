import { ethers } from 'ethers'

const FACTORY_ADDRESS = '0x8f79150a124bd664CBAB4464dCbE0c80BC1B3D12'
const MONITORING_PRIVATE_KEY = process.env.MONITORING_PRIVATE_KEY
const RPC_URL = 'https://rpc.test2.btcs.network'

const FACTORY_ABI = [
  'function getActiveContracts() view returns (address[])',
  'function processContractMonitoring(address contractAddress, bool walletHasActivity)'
] as const

const INHERITANCE_ABI = [
  'function getOwner() view returns (address)',
  'function getIsActiveForMonitoring() view returns (bool)',
  'function getLastActivityTimestamp() view returns (uint256)',
  'function getInactivityTime() view returns (uint256)',
  'function getIsInheritanceTriggered() view returns (bool)'
] as const

class InheritanceMonitoringService {
  private provider: ethers.JsonRpcProvider
  private monitoringWallet: ethers.Wallet
  private factory: ethers.Contract
  private previousBalances: Map<string, bigint>
  private isRunning: boolean = false
  private intervalId: NodeJS.Timeout | null = null

  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL)
    this.monitoringWallet = new ethers.Wallet(MONITORING_PRIVATE_KEY!, this.provider)
    this.factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, this.monitoringWallet)
    this.previousBalances = new Map()
  }

  async startMonitoring() {
    if (this.isRunning) {
      console.log('Monitoring service is already running')
      return
    }

    console.log('🚀 Starting Inheritance Monitoring Service...')
    console.log('📍 Factory Address:', FACTORY_ADDRESS)
    console.log('👤 Monitoring Wallet:', this.monitoringWallet.address)
    this.isRunning = true
    
    // Check balance
    const balance = await this.provider.getBalance(this.monitoringWallet.address)
    console.log('💰 Monitoring Wallet Balance:', ethers.formatEther(balance), 'tCORE2')
    
    if (balance < ethers.parseEther('0.01')) {
      console.warn('⚠️ Low balance warning! May not have enough gas for transactions')
    }
    
    // Start monitoring loop every 60 seconds
    this.intervalId = setInterval(() => {
      this.checkAllContracts().catch(console.error)
    }, 60000)

    // Run initial check
    await this.checkAllContracts()
  }

  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log('🛑 Monitoring service stopped')
  }

  async checkAllContracts() {
    try {
      console.log('\n🔍 Checking active contracts at:', new Date().toISOString())
      
      const activeContracts = await this.factory.getActiveContracts() as string[]
      console.log(`📋 Found ${activeContracts.length} active contracts:`, activeContracts)
      
      if (activeContracts.length === 0) {
        console.log('📭 No active contracts to monitor')
        return
      }

      for (const contractAddress of activeContracts) {
        console.log(`\n🔎 Processing contract: ${contractAddress}`)
        await this.monitorContract(contractAddress)
        // Small delay between contracts
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      
      console.log('✅ Completed monitoring cycle\n')
    } catch (error) {
      console.error('❌ Error checking contracts:', error)
    }
  }

  async monitorContract(contractAddress: string) {
    try {
      const contract = new ethers.Contract(contractAddress, INHERITANCE_ABI, this.provider)
      
      // Get contract details for debugging
      const [
        needsMonitoring,
        owner,
        lastActivityTimestamp,
        inactivityTime,
        isTriggered
      ] = await Promise.all([
        contract.getIsActiveForMonitoring() as Promise<boolean>,
        contract.getOwner() as Promise<string>,
        contract.getLastActivityTimestamp() as Promise<bigint>,
        contract.getInactivityTime() as Promise<bigint>,
        contract.getIsInheritanceTriggered() as Promise<boolean>
      ])

      console.log(`📊 Contract Details:`)
      console.log(`   Owner: ${owner}`)
      console.log(`   Needs Monitoring: ${needsMonitoring}`)
      console.log(`   Is Triggered: ${isTriggered}`)
      console.log(`   Last Activity: ${new Date(Number(lastActivityTimestamp) * 1000).toISOString()}`)
      console.log(`   Inactivity Time: ${inactivityTime} seconds (${Number(inactivityTime) / 3600} hours)`)

      // Calculate time since last activity
      const currentTime = Math.floor(Date.now() / 1000)
      const timeSinceActivity = currentTime - Number(lastActivityTimestamp)
      const shouldTrigger = timeSinceActivity >= Number(inactivityTime)

      console.log(`⏰ Time Analysis:`)
      console.log(`   Current Time: ${new Date(currentTime * 1000).toISOString()}`)
      console.log(`   Time Since Activity: ${timeSinceActivity} seconds (${timeSinceActivity / 3600} hours)`)
      console.log(`   Should Trigger: ${shouldTrigger}`)

      if (!needsMonitoring) {
        console.log('⏭️ Contract no longer needs monitoring, skipping...')
        return
      }

      if (isTriggered) {
        console.log('🎯 Contract already triggered, skipping...')
        return
      }

      // Check for wallet activity
      console.log(`🔍 Checking wallet activity for owner: ${owner}`)
      const hasActivity = await this.checkWalletActivity(owner)
      console.log(`📈 Wallet Activity Result: ${hasActivity}`)

      // ALWAYS call processContractMonitoring regardless of activity
      // The smart contract will handle the logic internally
      console.log(`📞 Calling processContractMonitoring with activity: ${hasActivity}`)
      
      try {
        // Estimate gas first
        const gasEstimate = await this.factory.processContractMonitoring.estimateGas(
          contractAddress,
          hasActivity
        ) as bigint
        console.log(`⛽ Estimated Gas: ${gasEstimate}`)

        const tx = await this.factory.processContractMonitoring(
          contractAddress,
          hasActivity,
          { 
            gasLimit: gasEstimate * BigInt(120) / BigInt(100), // 20% buffer
            maxFeePerGas: ethers.parseUnits('20', 'gwei'),
            maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei')
          }
        ) as ethers.TransactionResponse
        
        console.log(`📤 Transaction sent: ${tx.hash}`)
        
        const receipt = await tx.wait()
        if (receipt) {
          console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`)
          console.log(`⛽ Gas Used: ${receipt.gasUsed}`)
          
          // Check if inheritance was triggered by examining events
          if (receipt.logs && receipt.logs.length > 0) {
            console.log(`📋 Transaction emitted ${receipt.logs.length} events`)
            
            // Check if contract was deactivated
            const factoryInterface = new ethers.Interface([
              'event MonitoringDeactivated(address indexed contractAddress)'
            ])
            
            for (const log of receipt.logs) {
              try {
                const parsed = factoryInterface.parseLog({
                  topics: log.topics,
                  data: log.data
                })
                if (parsed && parsed.name === 'MonitoringDeactivated') {
                  console.log(`🎯 Contract ${contractAddress} was deactivated - inheritance triggered!`)
                }
              } catch (e) {
                // Not a factory event, continue
              }
            }
          }
        }
        
      } catch (txError: any) {
        console.error(`❌ Transaction failed:`, txError)
        
        if (txError.code === 'CALL_EXCEPTION') {
          console.error(`💥 Contract call reverted:`, txError.reason)
        }
        
        if (txError.code === 'INSUFFICIENT_FUNDS') {
          console.error(`💸 Insufficient funds for gas`)
        }
        
        throw txError
      }
      
    } catch (error: any) {
      console.error(`❌ Error monitoring contract ${contractAddress}:`, error)
      
      // Log more details about the error
      if (error.code) {
        console.error(`Error Code: ${error.code}`)
      }
      if (error.reason) {
        console.error(`Error Reason: ${error.reason}`)
      }
    }
  }

  async checkWalletActivity(walletAddress: string): Promise<boolean> {
    try {
      console.log(`🔍 Checking activity for wallet: ${walletAddress}`)
      
      // Get current balance
      const currentBalance = await this.provider.getBalance(walletAddress)
      const previousBalance = this.previousBalances.get(walletAddress)
      
      console.log(`💰 Balance Check:`)
      console.log(`   Current: ${ethers.formatEther(currentBalance)} tCORE2`)
      console.log(`   Previous: ${previousBalance ? ethers.formatEther(previousBalance) : 'Unknown'} tCORE2`)
      
      // Update stored balance
      this.previousBalances.set(walletAddress, currentBalance)
      
      // Check if balance changed (only if we have a previous balance)
      if (previousBalance !== undefined) {
        const balanceChanged = currentBalance !== previousBalance
        if (balanceChanged) {
          console.log(`💰 Balance change detected for ${walletAddress}`)
          return true
        }
      } else {
        console.log(`📝 First time checking this wallet, storing initial balance`)
      }

      // Check recent transactions more thoroughly
      const latestBlock = await this.provider.getBlockNumber()
      const fromBlock = Math.max(0, latestBlock - 100) // Check last 100 blocks
      
      console.log(`🔍 Checking blocks ${fromBlock} to ${latestBlock}`)
      
      // Check for native token transactions by examining recent blocks
      for (let blockNum = latestBlock; blockNum > fromBlock && blockNum > 0; blockNum--) {
        try {
          // Get block with full transaction details
          const block = await this.provider.getBlock(blockNum, true)
          if (block && block.transactions && Array.isArray(block.transactions)) {
            // Type guard to ensure we have transaction objects
            for (const tx of block.transactions) {
              // Check if tx is a transaction object (not just a hash string)
              if (typeof tx === 'object' && tx !== null && 'from' in tx && 'to' in tx) {
                const transaction = tx as ethers.TransactionResponse
                if (transaction.from === walletAddress || transaction.to === walletAddress) {
                  console.log(`📨 Native transaction found in block ${blockNum}: ${transaction.hash}`)
                  return true
                }
              }
            }
          }
        } catch (blockError) {
          console.warn(`⚠️ Error checking block ${blockNum}:`, blockError)
          continue
        }
      }
      
      console.log(`📭 No recent activity detected for ${walletAddress}`)
      return false
      
    } catch (error) {
      console.error(`❌ Error checking wallet activity for ${walletAddress}:`, error)
      return false // Assume no activity on error
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      walletAddress: this.monitoringWallet.address,
      lastCheck: new Date().toISOString()
    }
  }
}

// Singleton instance
let monitoringServiceInstance: InheritanceMonitoringService | null = null

export function getMonitoringService(): InheritanceMonitoringService {
  if (!monitoringServiceInstance) {
    monitoringServiceInstance = new InheritanceMonitoringService()
  }
  return monitoringServiceInstance
}
