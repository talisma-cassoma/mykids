import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import {  } from './schema'

let client: ReturnType<typeof postgres> | null = null
let db: ReturnType<typeof drizzle> | null = null

try {
  const connectionString = process.env.DB_URL
  if (!connectionString) {
    throw new Error('DB_URL is not set')
  }

  // Disable prefetch as it is not supported for "Transaction" pool mode
  client = postgres(connectionString, { prepare: false })
  db = drizzle(client)
} catch (error) {
  console.error('Drizzle initialization failed:', error)
} finally {
  if (!db && client) {
    void client.end().catch((error) => {
      console.error('Failed to close the uninitialized Drizzle client:', error)
    })
  }
}

export { db }
