import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Try HTTP endpoint first (if worker is running)
    const workerUrl = process.env.WORKER_HEALTH_URL || 'http://localhost:8080/status'
    
    try {
      const response = await fetch(workerUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      
      if (response.ok) {
        const statusData = await response.json()
        return NextResponse.json({ 
          success: true, 
          status: statusData.monitoring,
          source: 'http'
        })
      }
    } catch (httpError) {
      console.log('HTTP endpoint not available, trying file system...')
    }
    
    // Fallback to file system
    const fs = await import('fs')
    const path = await import('path')
    const statusFile = path.join(process.cwd(), 'monitoring-status.json')
    
    if (fs.existsSync(statusFile)) {
      const data = fs.readFileSync(statusFile, 'utf8')
      const status = JSON.parse(data)
      
      const lastCheck = new Date(status.lastCheck || 0).getTime()
      const now = new Date().getTime()
      const isHealthy = (now - lastCheck) < 300000 // 5 minutes
      
      return NextResponse.json({ 
        success: true, 
        status: {
          ...status,
          isRunning: status.isRunning && isHealthy,
          workerHealthy: isHealthy
        },
        source: 'file'
      })
    }
    
    // No status available
    return NextResponse.json({ 
      success: true, 
      status: { 
        isRunning: false, 
        lastCheck: null,
        message: 'Monitoring service not started yet'
      },
      source: 'none'
    })
  } catch (error) {
    console.error('Error getting monitoring status:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get monitoring status' 
    }, { status: 500 })
  }
}
