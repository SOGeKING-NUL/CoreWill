import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, Shield } from "lucide-react"

interface ContractCardProps {
  address: string
  amount: string
  time: string
}

export function ContractCard({ address, amount, time }: ContractCardProps) {
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`
  
  return (
    <figure
      className={cn(
        "relative h-32 w-80 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-[#ffa600]/20 bg-white/80 hover:bg-[#ffa600]/5",
        // dark styles
        "dark:border-[#ffa600]/30 dark:bg-gray-800/80 dark:hover:bg-[#ffa600]/10",
      )}
    >
      {/* Line 1: Contract Address */}
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-4 w-4 text-[#ffa600]" />
        <span className="font-mono text-sm text-gray-700 dark:text-gray-300 font-medium">
          {formatAddress(address)}
        </span>
        <Badge variant="outline" className="text-xs border-[#ffa600]/30 text-[#ffa600]">
          Active
        </Badge>
      </div>
      
      {/* Line 2: Amount */}
      <div className="flex items-center gap-2 mb-2">
        <DollarSign className="h-4 w-4 text-[#ffa600]" />
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {amount} tCORE2
        </span>
        <span className="text-sm  dark:text-gray-400">Locked</span>
      </div>
      
      {/* Line 3: Time Period */}
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-[#ffa600]" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Inactivity: <span className="font-medium text-gray-800 dark:text-gray-200">{time}</span>
        </span>
      </div>
    </figure>
  )
}
