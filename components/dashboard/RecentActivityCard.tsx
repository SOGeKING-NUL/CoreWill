import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ContractDetails } from '@/types/contract'

interface RecentActivityCardProps {
  userContracts: ContractDetails[]
  beneficiaryContracts: ContractDetails[]
}

export default function RecentActivityCard({ userContracts, beneficiaryContracts }: RecentActivityCardProps) {
  const allContracts = [...userContracts, ...beneficiaryContracts]
    .sort((a, b) => b.lastActivity - a.lastActivity)
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest updates from your inheritance contracts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allContracts.map((contract) => (
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
          {allContracts.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No recent activity found
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
