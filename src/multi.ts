import dotenv from 'dotenv';
import { cpus } from 'node:os';
import cluster, { Worker } from 'node:cluster';
import http, { IncomingMessage, ServerResponse } from 'node:http';

import createApiServer from './apiServer/createApiServer';

dotenv.config();

const PORT = process.env.MULTI_PORT
  ? Number.parseInt(process.env.MULTI_PORT)
  : 4010; // - default if PORT is not set in the .env file
const numCPUs = cpus().length;

if (cluster.isPrimary) {
  for (let i = 0; i < numCPUs - 1; i++) {
    cluster.fork();
  }

  const workers: Worker[] = [];

  for (const id in cluster.workers) {
    const worker = cluster.workers[id];
    if (worker) {
      workers.push(worker);
    }
  }

  // Round-robin algorithm for load balancing
  let workerIndex = 0;
  const nextWorker = (): Worker => {
    const worker = workers[workerIndex];
    workerIndex = (workerIndex + 1) % workers.length;
    return worker;
  };

  const loadBalancer = http.createServer(
    (req: IncomingMessage, res: ServerResponse) => {
      const worker = nextWorker();
      const workerPort = PORT + (worker?.id ?? 0);
      const proxyReq = http.request(
        {
          port: workerPort,
          path: req.url,
          method: req.method,
          headers: req.headers,
        },
        (proxyRes: http.IncomingMessage) => {
          res.writeHead(proxyRes.statusCode ?? 400, proxyRes.headers);
          proxyRes.pipe(res);
          console.log(
            `${req.method?.toUpperCase()} load to port ${workerPort}`
          );
        }
      );

      req.pipe(proxyReq);
    }
  );

  loadBalancer.listen(PORT, () => {
    console.log(`Load balancer listening on port ${PORT}`);
  });
} else {
  const server = createApiServer();
  const workerId = cluster.worker?.id ?? 0;
  const workerPort = PORT + workerId;

  server.listen(workerPort, () => {
    console.log(`Worker ${workerId} listening on port ${workerPort}`);
  });
}
