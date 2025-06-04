const { getMonitoringService } = require('./lib/monitoring-service') //imports the js file, not ts

async function main() {
  console.log('🔧 Starting monitoring worker process...')
  
  const service = getMonitoringService()
  await service.startMonitoring()
  
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, stopping monitoring...')
    service.stopMonitoring()
    process.exit(0)
  })
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, stopping monitoring...')
    service.stopMonitoring()
    process.exit(0)
  })
  
  // Keep process alive
  process.stdin.resume()
}

main().catch(e => {
  console.error('Monitoring worker crashed:', e)
  process.exit(1)
})
