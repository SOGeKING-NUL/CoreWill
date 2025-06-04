import { NextResponse } from 'next/server'
import { loadMonitoringStatus } from '@/lib/monitoring-service.mjs'

export async function GET() {
  try {
    const status = loadMonitoringStatus()
    
    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error('Error getting monitoring status:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get monitoring status' 
    }, { status: 500 })
  }
}
