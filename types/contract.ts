export interface ContractDetails {
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
