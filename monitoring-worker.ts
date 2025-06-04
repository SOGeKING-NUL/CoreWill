import { getMonitoringService } from './lib/monitoring-service'

async function main() {
  const service = getMonitoringService()
  await service.startMonitoring()
  process.stdin.resume()   // Keep process alive
}

main().catch(e => {
  console.error('Monitoring worker crashed:', e)
  process.exit(1)
})
