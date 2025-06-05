import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const statusFile = path.join(process.cwd(), 'monitoring-status.json')
    
    if (fs.existsSync(statusFile)) {
      const data = fs.readFileSync(statusFile, 'utf8')
      const status = JSON.parse(data)
      
      // Check if worker is actually alive (last update within 5 minutes)
      const lastCheck = new Date(status.lastCheck || 0).getTime()
      const now = new Date().getTime()
      const isHealthy = (now - lastCheck) < 300000 // 5 minutes
      
      return NextResponse.json({ 
        success: true, 
        status: {
          ...status,
          isRunning: status.isRunning && isHealthy,
          workerHealthy: isHealthy
        }
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      status: { isRunning: false, lastCheck: null }
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get monitoring status' 
    }, { status: 500 })
  }
}
