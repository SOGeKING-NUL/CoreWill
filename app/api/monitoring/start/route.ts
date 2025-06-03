import { NextResponse } from 'next/server'
import { getMonitoringService } from '@/lib/monitoring-service'

export async function POST() {
  try {
    const monitoringService = getMonitoringService()
    await monitoringService.startMonitoring()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Monitoring service started' 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to start monitoring service' 
    }, { status: 500 })
  }
}
