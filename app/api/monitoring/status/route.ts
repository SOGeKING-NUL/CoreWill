import { NextResponse } from 'next/server'
import { getMonitoringService } from '@/lib/monitoring-service'

export async function GET() {
  try {
    const monitoringService = getMonitoringService()
    const status = monitoringService.getStatus()
    
    return NextResponse.json({ success: true, status })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get monitoring status' 
    }, { status: 500 })
  }
}
