import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const workerStatusUrl = process.env.WORKER_STATUS_URL
    
    if (!workerStatusUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'Worker status URL not configured' 
      }, { status: 500 })
    }

    // Fetch status from worker service
    const response = await fetch(workerStatusUrl, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000) // 10 seconds
    })
    
    if (!response.ok) {
      throw new Error(`Worker responded with status: ${response.status}`)
    }
    
    const workerData = await response.json()
    
    // Transform worker response to match expected format
    const status = {
      isRunning: workerData.monitoring?.isRunning || false,
      walletAddress: workerData.monitoring?.walletAddress || null,
      lastCheck: workerData.monitoring?.lastCheck || null,
      timeSinceLastCheck: workerData.monitoring?.timeSinceLastCheck || 0,
      workerHealthy: workerData.status === 'healthy',
      uptime: workerData.worker?.uptime || 0,
      memoryUsage: workerData.worker?.memoryUsage || null
    }
    
    return NextResponse.json({ 
      success: true, 
      status,
      source: 'worker_http'
    })
    
  } catch (error) {
    console.error('Error fetching worker status:', error)
    
    // Return offline status if worker is unreachable
    return NextResponse.json({ 
      success: true, 
      status: { 
        isRunning: false, 
        walletAddress: null,
        lastCheck: null,
        timeSinceLastCheck: null,
        workerHealthy: false,
        error: 'Worker service unreachable'
      },
      source: 'error'
    })
  }
}
