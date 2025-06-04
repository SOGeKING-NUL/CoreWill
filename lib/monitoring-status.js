import fs from 'fs'
import path from 'path'

const STATUS_FILE = path.join(process.cwd(), 'monitoring-status.json')

export function saveMonitoringStatus(status) {
  try {
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2))
  } catch (error) {
    console.error('Failed to save monitoring status:', error)
  }
}

export function loadMonitoringStatus() {
  try {
    if (fs.existsSync(STATUS_FILE)) {
      const data = fs.readFileSync(STATUS_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Failed to load monitoring status:', error)
  }
  
  return {
    isRunning: false,
    walletAddress: null,
    lastCheck: null,
    startedAt: null
  }
}
