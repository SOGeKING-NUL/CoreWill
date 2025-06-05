'use client'
import { useEffect, useState } from 'react'
import { useAppKit } from '@reown/appkit/react'
import { useAccount, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChevronDown, LogOut, AlertTriangle, Activity, Wifi, WifiOff } from 'lucide-react'

interface MonitoringStatus {
  isRunning: boolean
  walletAddress: string | null
  lastCheck: string | null
  workerHealthy: boolean
  uptime?: number
  timeSinceLastCheck?: number
}

export default function Header() {
  const { open } = useAppKit()
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()

  const [monitoringStatus, setMonitoringStatus] = useState<MonitoringStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [lastFetchError, setLastFetchError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      if (!isConnected) {
        setMonitoringStatus(null)
        return
      }

      setStatusLoading(true)
      setLastFetchError(null)

      try {
        const response = await fetch('/api/monitoring/status', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (data.success && data.status) {
          setMonitoringStatus(data.status)
          setLastFetchError(null)
        } else {
          throw new Error(data.error || 'Invalid response format')
        }
      } catch (error) {
        console.error('Monitoring status fetch failed:', error)
        setLastFetchError(error instanceof Error ? error.message : 'Unknown error')
        setMonitoringStatus({
          isRunning: false,
          walletAddress: null,
          lastCheck: null,
          workerHealthy: false
        })
      } finally {
        setStatusLoading(false)
      }
    }

    // Initial fetch
    fetchStatus()
    
    // Set up interval only if connected
    let interval: NodeJS.Timeout | undefined
    if (isConnected) {
      interval = setInterval(fetchStatus, 30000) // 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isConnected])

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getChainName = () => {
    if (!chain) return 'Unknown'
    return chain.name
  }

  const isCorrectNetwork = chain?.id === 1114

  const getMonitoringStatus = () => {
    if (!isConnected || !isCorrectNetwork) {
      return { status: 'network', healthy: false, text: 'Wrong Network' }
    }
    
    if (statusLoading) {
      return { status: 'loading', healthy: null, text: 'Checking...' }
    }
    
    if (lastFetchError) {
      return { status: 'error', healthy: false, text: 'Service Offline' }
    }
    
    if (!monitoringStatus) {
      return { status: 'unknown', healthy: false, text: 'Unknown' }
    }
    
    if (monitoringStatus.workerHealthy && monitoringStatus.isRunning) {
      return { status: 'healthy', healthy: true, text: 'Monitoring Active' }
    }
    
    if (monitoringStatus.isRunning) {
      return { status: 'stale', healthy: false, text: 'Service Stale' }
    }
    
    return { status: 'inactive', healthy: false, text: 'Monitoring Inactive' }
  }

  const getBadgeVariant = () => {
    if (!isConnected) return "secondary"
    if (!isCorrectNetwork) return "destructive"
    
    const { healthy } = getMonitoringStatus()
    if (healthy === null) return "secondary" // Loading
    return healthy ? "default" : "destructive"
  }

  const getBadgeClasses = () => {
    const { healthy } = getMonitoringStatus()
    
    let baseClasses = "hidden sm:flex items-center gap-1.5 transition-colors"
    
    if (!isConnected || !isCorrectNetwork) {
      return `${baseClasses} bg-red-500/20 text-red-700 border-red-300`
    }
    
    if (healthy === null) {
      return `${baseClasses} bg-gray-500/20 text-gray-700 border-gray-300`
    }
    
    return healthy 
      ? `${baseClasses} bg-green-500/20 text-green-700 border-green-300`
      : `${baseClasses} bg-red-500/20 text-red-700 border-red-300`
  }

  const getStatusIcon = () => {
    if (!isConnected || !isCorrectNetwork) {
      return <AlertTriangle className="h-3 w-3" />
    }
    
    const { status, healthy } = getMonitoringStatus()
    
    if (status === 'loading') {
      return <Activity className="h-3 w-3 animate-pulse" />
    }
    
    if (status === 'error') {
      return <WifiOff className="h-3 w-3" />
    }
    
    if (healthy) {
      return <Wifi className="h-3 w-3" />
    }
    
    return <AlertTriangle className="h-3 w-3" />
  }

  const getStatusDot = () => {
    const { healthy } = getMonitoringStatus()
    
    if (healthy === null) return null
    
    return (
      <div className={`w-1.5 h-1.5 rounded-full ${
        healthy ? 'bg-green-500 animate-pulse' : 'bg-red-500'
      }`} />
    )
  }

  const { text: statusText } = getMonitoringStatus()

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md shadow-lg transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <div className="flex items-center">
            <h1 className="text-xl font-bold text-foreground">
              Core Will
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {!isConnected ? (
              <Button 
                onClick={() => open()} 
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              >
                Connect Wallet
              </Button>
            ) : (
              <div className="flex items-center gap-2">

                <Badge 
                  variant={getBadgeVariant()}
                  className={getBadgeClasses()}
                  title={lastFetchError || `Last check: ${monitoringStatus?.lastCheck ? new Date(monitoringStatus.lastCheck).toLocaleTimeString() : 'Never'}`}
                >
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon()}
                    <span className="text-xs font-medium">
                      {isCorrectNetwork ? statusText : getChainName()}
                    </span>
                    {getStatusDot()}
                  </div>
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="hidden sm:inline">
                          {formatAddress(address!)}
                        </span>
                      </div>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {isConnected && isCorrectNetwork && monitoringStatus && (
                      <>
                        <div className="px-2 py-1.5 text-xs text-muted-foreground border-b">
                          <div>Monitoring Status</div>
                          <div className="font-mono">
                            {monitoringStatus.walletAddress ? 
                              `${monitoringStatus.walletAddress.slice(0, 8)}...` : 
                              'No wallet'
                            }
                          </div>
                          {monitoringStatus.uptime && (
                            <div>Uptime: {Math.floor(monitoringStatus.uptime / 60)}m</div>
                          )}
                        </div>
                      </>
                    )}
                    <DropdownMenuItem onClick={() => disconnect()} className="flex items-center gap-2 text-destructive">
                        <LogOut className="h-4 w-4" />
                        Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
