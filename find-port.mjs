#!/usr/bin/env node

import net from 'net'
import { execSync } from 'child_process'

async function findAvailablePort(startPort = 3000, maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i
    try {
      if (await isPortAvailable(port)) {
        return port
      }
    } catch (e) {
      // continuar tentando
    }
  }
  return startPort + maxAttempts
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    const timeout = setTimeout(() => {
      server.destroy()
      resolve(false)
    }, 1000)
    
    server.once('error', (err) => {
      clearTimeout(timeout)
      if (err.code === 'EADDRINUSE') {
        resolve(false)
      } else {
        resolve(false)
      }
    })
    
    server.once('listening', () => {
      clearTimeout(timeout)
      server.close()
      resolve(true)
    })
    
    try {
      server.listen(port, '127.0.0.1')
    } catch (e) {
      resolve(false)
    }
  })
}

const port = await findAvailablePort()
console.log(port)

