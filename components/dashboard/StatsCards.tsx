import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Users, Wallet, Gift, Lock } from 'lucide-react'
import { ContractDetails } from '@/types/contract'

interface StatsCardsProps {
  userContracts: ContractDetails[]
  beneficiaryContracts: ContractDetails[]
}

export default function StatsCards({ userContracts, beneficiaryContracts }: StatsCardsProps) {
  // Calculate total value to be claimed (triggered but not claimed)
  const userClaimable = userContracts
    .filter(c => c.triggered && !c.claimed)
    .reduce((sum, c) => sum + parseFloat(c.amount), 0)
  
  const beneficiaryClaimable = beneficiaryContracts
    .filter(c => c.triggered && !c.claimed)
    .reduce((sum, c) => sum + parseFloat(c.amount), 0)
  
  const totalClaimable = userClaimable + beneficiaryClaimable

  // Calculate total value locked (active contracts being monitored)
  const userLocked = userContracts
    .filter(c => c.needsMonitoring)
    .reduce((sum, c) => sum + parseFloat(c.amount), 0)
  
  const beneficiaryLocked = beneficiaryContracts
    .filter(c => c.needsMonitoring)
    .reduce((sum, c) => sum + parseFloat(c.amount), 0)
  
  const totalLocked = userLocked + beneficiaryLocked

  const activeMonitoring = userContracts.filter(c => c.needsMonitoring).length + 
                          beneficiaryContracts.filter(c => c.needsMonitoring).length

  return (
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
            Total Claimable
          </CardTitle>
          <Gift className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {totalClaimable.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            tCORE2 ready to claim
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Locked
          </CardTitle>
          <Lock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {totalLocked.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            tCORE2 in active contracts
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
