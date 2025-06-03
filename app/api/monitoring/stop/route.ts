import { NextResponse } from 'next/server'
import { getMonitoringService } from '@/lib/monitoring-service'

export async function POST() {
  try {
    const monitoringService = getMonitoringService()
    monitoringService.stopMonitoring()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Monitoring service stopped' 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to stop monitoring service' 
    }, { status: 500 })
  }
}
