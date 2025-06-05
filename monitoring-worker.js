const { ethers } = require('ethers');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const http = require('http');

dotenv.config();

const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || '';
const MONITORING_PRIVATE_KEY = process.env.MONITORING_PRIVATE_KEY;
const RPC_URL = process.env.NEXT_CORE_RPC_URL;
const STATUS_FILE = path.join(process.cwd(), 'monitoring-status.json');

function saveMonitoringStatus(status) {
  try {
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
  } catch (error) {
    console.error('Failed to save monitoring status:', error);
  }
}

function loadMonitoringStatus() {
  try {
    if (fs.existsSync(STATUS_FILE)) {
      const data = fs.readFileSync(STATUS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load monitoring status:', error);
  }
  
  return {
    isRunning: false,
    walletAddress: null,
    lastCheck: null,
    startedAt: null
  };
}

const FACTORY_ABI = [
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
];

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
];

class InheritanceMonitoringService {
    constructor() {
        this.provider = new ethers.JsonRpcProvider(RPC_URL);
        this.monitoringWallet = new ethers.Wallet(MONITORING_PRIVATE_KEY, this.provider);
        this.factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, this.monitoringWallet);
        this.previousBalances = new Map();
        
        // Load initial status from file
        const savedStatus = loadMonitoringStatus();
        this.isRunning = savedStatus.isRunning || false;
        this.intervalId = null;
    }

    async startMonitoring() {
        if (this.isRunning) {
            console.log('Monitoring service is already running');
            return;
        }

        console.log('🚀 Starting Inheritance Monitoring Service...');
        console.log('📍 Factory Address:', FACTORY_ADDRESS);
        console.log('👤 Monitoring Wallet:', this.monitoringWallet.address);
        
        this.isRunning = true;
        
        // Save status to file
        this.updateStatus();
        
        // Check balance
        const balance = await this.provider.getBalance(this.monitoringWallet.address);
        console.log('💰 Monitoring Wallet Balance:', ethers.formatEther(balance), 'tCORE2');
        
        if (balance < ethers.parseEther('0.01')) {
            console.warn('⚠️ Low balance warning! May not have enough gas for transactions');
        }
        
        // Start monitoring loop every 60 seconds
        this.intervalId = setInterval(() => {
            this.checkAllContracts().catch(console.error);
        }, 60000);

        // Run initial check
        await this.checkAllContracts();
    }

    stopMonitoring() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        this.updateStatus();
        console.log('🛑 Monitoring service stopped');
    }

    updateStatus() {
        const status = {
            isRunning: this.isRunning,
            walletAddress: this.monitoringWallet.address,
            lastCheck: new Date().toISOString(),
            startedAt: this.isRunning ? new Date().toISOString() : null
        };
        
        saveMonitoringStatus(status);
    }

    async checkAllContracts() {
        try {
            console.log('\n🔍 Checking active contracts at:', new Date().toISOString());
            
            this.updateStatus();
            
            const activeContracts = await this.factory.getActiveContracts();
            console.log(`📋 Found ${activeContracts.length} active contracts:`, activeContracts);
            
            if (activeContracts.length === 0) {
                console.log('📭 No active contracts to monitor');
                return;
            }

            for (const contractAddress of activeContracts) {
                console.log(`\n🔎 Processing contract: ${contractAddress}`);
                await this.monitorContract(contractAddress);
                // Small delay between contracts
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            console.log('✅ Completed monitoring cycle\n');
        } catch (error) {
            console.error('❌ Error checking contracts:', error);
        }
    }

    async monitorContract(contractAddress) {
        try {
            const contract = new ethers.Contract(contractAddress, INHERITANCE_ABI, this.provider);
            
            const [
                needsMonitoring,
                owner,
                lastActivityTimestamp,
                inactivityTime,
                isTriggered
            ] = await Promise.all([
                contract.getIsActiveForMonitoring(),
                contract.getOwner(),
                contract.getLastActivityTimestamp(),
                contract.getInactivityTime(),
                contract.getIsInheritanceTriggered()
            ]);

            console.log(`📊 Contract Details:`);
            console.log(`   Owner: ${owner}`);
            console.log(`   Needs Monitoring: ${needsMonitoring}`);
            console.log(`   Is Triggered: ${isTriggered}`);
            console.log(`   Last Activity: ${new Date(Number(lastActivityTimestamp) * 1000).toISOString()}`);
            console.log(`   Inactivity Time: ${inactivityTime} seconds (${Number(inactivityTime) / 3600} hours)`);

            // Calculate time since last activity
            const currentTime = Math.floor(Date.now() / 1000);
            const timeSinceActivity = currentTime - Number(lastActivityTimestamp);
            const shouldTrigger = timeSinceActivity >= Number(inactivityTime);

            console.log(`⏰ Time Analysis:`);
            console.log(`   Current Time: ${new Date(currentTime * 1000).toISOString()}`);
            console.log(`   Time Since Activity: ${timeSinceActivity} seconds (${timeSinceActivity / 3600} hours)`);
            console.log(`   Should Trigger: ${shouldTrigger}`);

            if (!needsMonitoring) {
                console.log('⏭️ Contract no longer needs monitoring, skipping...');
                return;
            }

            if (isTriggered) {
                console.log('🎯 Contract already triggered, skipping...');
                return;
            }

            // Check for wallet activity
            console.log(`🔍 Checking wallet activity for owner: ${owner}`);
            const hasActivity = await this.checkWalletActivity(owner);
            console.log(`📈 Wallet Activity Result: ${hasActivity}`);

            // ALWAYS call processContractMonitoring regardless of activity
            // The smart contract will handle the logic internally
            console.log(`📞 Calling processContractMonitoring with activity: ${hasActivity}`);
            
            try {
                // Estimate gas first
                const gasEstimate = await this.factory.processContractMonitoring.estimateGas(
                    contractAddress,
                    hasActivity
                );
                console.log(`⛽ Estimated Gas: ${gasEstimate}`);

                const tx = await this.factory.processContractMonitoring(
                    contractAddress,
                    hasActivity,
                    { 
                        gasLimit: gasEstimate * BigInt(120) / BigInt(100), // 20% buffer
                        maxFeePerGas: ethers.parseUnits('20', 'gwei'),
                        maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei')
                    }
                );
                
                console.log(`📤 Transaction sent: ${tx.hash}`);
                
                const receipt = await tx.wait();
                if (receipt) {
                    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
                    console.log(`⛽ Gas Used: ${receipt.gasUsed}`);
                    
                    // Check if inheritance was triggered by examining events
                    if (receipt.logs && receipt.logs.length > 0) {
                        console.log(`📋 Transaction emitted ${receipt.logs.length} events`);
                        
                        // Check if contract was deactivated
                        const factoryInterface = new ethers.Interface([
                            'event MonitoringDeactivated(address indexed contractAddress)'
                        ]);
                        
                        for (const log of receipt.logs) {
                            try {
                                const parsed = factoryInterface.parseLog({
                                    topics: log.topics,
                                    data: log.data
                                });
                                if (parsed && parsed.name === 'MonitoringDeactivated') {
                                    console.log(`🎯 Contract ${contractAddress} was deactivated - inheritance triggered!`);
                                }
                            } catch (e) {
                                // Not a factory event, continue
                            }
                        }
                    }
                }
                
            } catch (txError) {
                console.error(`❌ Transaction failed:`, txError);
                
                if (txError.code === 'CALL_EXCEPTION') {
                    console.error(`💥 Contract call reverted:`, txError.reason);
                }
                
                if (txError.code === 'INSUFFICIENT_FUNDS') {
                    console.error(`💸 Insufficient funds for gas`);
                }
                
                throw txError;
            }
            
        } catch (error) {
            console.error(`❌ Error monitoring contract ${contractAddress}:`, error);
            
            // Log more details about the error
            if (error.code) {
                console.error(`Error Code: ${error.code}`);
            }
            if (error.reason) {
                console.error(`Error Reason: ${error.reason}`);
            }
        }
    }

    async checkWalletActivity(walletAddress) {
        try {
            console.log(`🔍 Checking activity for wallet: ${walletAddress}`);
            
            const currentBalance = await this.provider.getBalance(walletAddress);
            const previousBalance = this.previousBalances.get(walletAddress);
            
            console.log(`💰 Balance Check:`);
            console.log(`   Current: ${ethers.formatEther(currentBalance)} tCORE2`);
            console.log(`   Previous: ${previousBalance ? ethers.formatEther(previousBalance) : 'Unknown'} tCORE2`);
            
            this.previousBalances.set(walletAddress, currentBalance);
            
            if (previousBalance !== undefined) {
                const balanceChanged = currentBalance !== previousBalance;
                if (balanceChanged) {
                    console.log(`💰 Balance change detected for ${walletAddress}`);
                    return true;
                }
            } else {
                console.log(`📝 First time checking this wallet, storing initial balance`);
            }

            const latestBlock = await this.provider.getBlockNumber();
            const fromBlock = Math.max(0, latestBlock - 100); // Check last 100 blocks
            
            console.log(`🔍 Checking blocks ${fromBlock} to ${latestBlock}`);
            
            // Check for native token transactions by examining recent blocks
            for (let blockNum = latestBlock; blockNum > fromBlock && blockNum > 0; blockNum--) {
                try {
                    // Get block with full transaction details
                    const block = await this.provider.getBlock(blockNum, true);
                    if (block && block.transactions && Array.isArray(block.transactions)) {
                        for (const tx of block.transactions) {
                            if (typeof tx === 'object' && tx !== null && 'from' in tx && 'to' in tx) {
                                const transaction = tx;
                                if (transaction.from === walletAddress || transaction.to === walletAddress) {
                                    console.log(`📨 Native transaction found in block ${blockNum}: ${transaction.hash}`);
                                    return true;
                                }
                            }
                        }
                    }
                } catch (blockError) {
                    console.warn(`⚠️ Error checking block ${blockNum}:`, blockError);
                    continue;
                }
            }
            
            console.log(`📭 No recent activity detected for ${walletAddress}`);
            return false;
            
        } catch (error) {
            console.error(`❌ Error checking wallet activity for ${walletAddress}:`, error);
            return false; 
        }
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            walletAddress: this.monitoringWallet.address,
            lastCheck: new Date().toISOString(),
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage()
        };
    }
}

// Create monitoring service instance
function getMonitoringService() {
    if (!global.monitoringServiceInstance) {
        global.monitoringServiceInstance = new InheritanceMonitoringService();
    }
    return global.monitoringServiceInstance;
}

// HTTP Status Server
function createStatusServer(monitoringService) {
    const statusServer = http.createServer((req, res) => {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        if (req.url === '/status' || req.url === '/health') {
            try {
                const status = monitoringService.getStatus();
                const currentTime = new Date().getTime();
                const lastCheckTime = new Date(status.lastCheck || 0).getTime();
                const timeSinceLastCheck = currentTime - lastCheckTime;
                
                // Consider healthy if last check was within 5 minutes
                const isHealthy = status.isRunning && timeSinceLastCheck < 300000;
                
                const responseData = {
                    status: isHealthy ? 'healthy' : 'unhealthy',
                    monitoring: {
                        isRunning: status.isRunning,
                        lastCheck: status.lastCheck,
                        timeSinceLastCheck: Math.floor(timeSinceLastCheck / 1000), // seconds
                        walletAddress: status.walletAddress
                    },
                    worker: {
                        uptime: status.uptime,
                        memoryUsage: status.memoryUsage,
                        pid: process.pid
                    },
                    timestamp: new Date().toISOString()
                };

                res.writeHead(isHealthy ? 200 : 503, { 
                    'Content-Type': 'application/json' 
                });
                res.end(JSON.stringify(responseData, null, 2));
                
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    status: 'error', 
                    error: error.message,
                    timestamp: new Date().toISOString()
                }));
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                status: 'not found',
                availableEndpoints: ['/status', '/health']
            }));
        }
    });

    return statusServer;
}

// Main worker function
async function main() {
    console.log('🔧 Starting monitoring worker process...');
    console.log('🌍 Environment Variables:');
    console.log('   Factory Address:', FACTORY_ADDRESS);
    console.log('   RPC URL:', RPC_URL);
    console.log('   Private Key Set:', !!MONITORING_PRIVATE_KEY);
    
    if (!FACTORY_ADDRESS || !MONITORING_PRIVATE_KEY || !RPC_URL) {
        console.error('❌ Missing required environment variables');
        process.exit(1);
    }
    
    // Create monitoring service
    const service = getMonitoringService();
    
    // Create and start HTTP status server
    const statusServer = createStatusServer(service);
    const statusPort = process.env.PORT || 8080;
    
    statusServer.listen(statusPort, () => {
        console.log(`🏥 HTTP Status server running on port ${statusPort}`);
        console.log(`🔗 Status endpoint: http://localhost:${statusPort}/status`);
        console.log(`🔗 Health endpoint: http://localhost:${statusPort}/health`);
    });
    
    // Start monitoring service
    await service.startMonitoring();
    
    // Handle graceful shutdown
    const shutdown = () => {
        console.log('\n🛑 Shutting down services...');
        service.stopMonitoring();
        statusServer.close(() => {
            console.log('🏥 HTTP Status server stopped');
            process.exit(0);
        });
    };
    
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    
    // Keep process alive
    process.stdin.resume();
}

// Start the worker
main().catch(e => {
    console.error('Monitoring worker crashed:', e);
    process.exit(1);
});
