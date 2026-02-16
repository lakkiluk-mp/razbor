import cluster from 'node:cluster'
import { availableParallelism } from 'node:os'

const requestedWorkers = Number(process.env.CLUSTER_WORKERS) || 1

if (requestedWorkers > 1 && cluster.isPrimary) {
  const workerCount = Math.min(requestedWorkers, availableParallelism())
  console.log(`[Cluster] Starting ${workerCount} workers`)

  for (let i = 0; i < workerCount; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code) => {
    console.log(`[Cluster] Worker ${worker.process.pid} exited (code ${code}), restarting...`)
    cluster.fork()
  })
} else {
  import('./index.js')
}
