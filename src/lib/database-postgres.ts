import { Pool } from 'pg'

// Database connection
let pool: Pool | null = null

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL
    
    if (!connectionString) {
      throw new Error('No database connection string found. Please set DATABASE_URL or POSTGRES_URL environment variable.')
    }
    
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  }
  return pool
}

// Database interfaces
export interface UrlData {
  id?: number
  originalUrl: string
  shortCode: string
  clicks: number
  createdAt: Date
  userId?: string
}

export interface User {
  id?: number
  userId: string
  email: string
  name: string
  passwordHash: string
  salt: string
  plan: 'free' | 'pro' | 'enterprise'
  subscriptionId?: string
  subscriptionStatus?: 'active' | 'cancelled' | 'expired'
  subscriptionStart?: Date
  subscriptionEnd?: Date
  urlsCreated: number
  createdAt: Date
  lastActivity: Date
}

export interface UserSession {
  id?: number
  sessionId: string
  userId: string
  createdAt: Date
  expiresAt: Date
  ipAddress: string
  userAgent: string
}

// Initialize database tables
export async function initializeDatabase() {
  const client = getPool()
  
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        salt VARCHAR(255) NOT NULL,
        plan VARCHAR(20) DEFAULT 'free',
        subscription_id VARCHAR(255),
        subscription_status VARCHAR(20),
        subscription_start TIMESTAMP,
        subscription_end TIMESTAMP,
        urls_created INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create urls table
    await client.query(`
      CREATE TABLE IF NOT EXISTS urls (
        id SERIAL PRIMARY KEY,
        original_url TEXT NOT NULL,
        short_code VARCHAR(20) UNIQUE NOT NULL,
        clicks INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id VARCHAR(255)
      )
    `)

    // Create sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT
      )
    `)

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
    `)

    console.log('Database tables initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}

// URL Database Operations
export class PostgresUrlDatabase {
  async set(shortCode: string, data: UrlData): Promise<void> {
    const client = getPool()
    try {
      await client.query(
        'INSERT INTO urls (original_url, short_code, clicks, user_id) VALUES ($1, $2, $3, $4) ON CONFLICT (short_code) DO UPDATE SET original_url = $1, clicks = $3, user_id = $4',
        [data.originalUrl, shortCode, data.clicks, data.userId]
      )
      console.log(`Saved URL: ${shortCode} -> ${data.originalUrl}`)
    } catch (error) {
      console.error('Error saving URL:', error)
      throw error
    }
  }

  async get(shortCode: string): Promise<UrlData | null> {
    const client = getPool()
    try {
      const result = await client.query(
        'SELECT * FROM urls WHERE short_code = $1',
        [shortCode]
      )
      
      if (result.rows.length === 0) {
        console.log(`Looking for ${shortCode}: NOT FOUND`)
        return null
      }

      const row = result.rows[0]
      const urlData: UrlData = {
        id: row.id,
        originalUrl: row.original_url,
        shortCode: row.short_code,
        clicks: row.clicks,
        createdAt: row.created_at,
        userId: row.user_id
      }
      
      console.log(`Looking for ${shortCode}: FOUND`)
      return urlData
    } catch (error) {
      console.error('Error getting URL:', error)
      return null
    }
  }

  async getAll(): Promise<UrlData[]> {
    const client = getPool()
    try {
      const result = await client.query('SELECT * FROM urls ORDER BY created_at DESC')
      return result.rows.map(row => ({
        id: row.id,
        originalUrl: row.original_url,
        shortCode: row.short_code,
        clicks: row.clicks,
        createdAt: row.created_at,
        userId: row.user_id
      }))
    } catch (error) {
      console.error('Error getting all URLs:', error)
      return []
    }
  }

  async size(): Promise<number> {
    const client = getPool()
    try {
      const result = await client.query('SELECT COUNT(*) FROM urls')
      return parseInt(result.rows[0].count)
    } catch (error) {
      console.error('Error getting URL count:', error)
      return 0
    }
  }

  async getTotalClicks(): Promise<number> {
    const client = getPool()
    try {
      const result = await client.query('SELECT SUM(clicks) FROM urls')
      return parseInt(result.rows[0].sum) || 0
    } catch (error) {
      console.error('Error getting total clicks:', error)
      return 0
    }
  }

  async incrementClicks(shortCode: string): Promise<void> {
    const client = getPool()
    try {
      await client.query(
        'UPDATE urls SET clicks = clicks + 1 WHERE short_code = $1',
        [shortCode]
      )
    } catch (error) {
      console.error('Error incrementing clicks:', error)
    }
  }
}

// User Database Operations
export class PostgresUserDatabase {
  async createUser(user: User): Promise<string> {
    const client = getPool()
    try {
      const result = await client.query(
        `INSERT INTO users (user_id, email, name, password_hash, salt, plan, urls_created, created_at, last_activity) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING user_id`,
        [user.userId, user.email, user.name, user.passwordHash, user.salt, user.plan, user.urlsCreated, user.createdAt, user.lastActivity]
      )
      console.log(`User created: ${user.email} (${user.userId})`)
      return result.rows[0].user_id
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const client = getPool()
    try {
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
      if (result.rows.length === 0) return null

      const row = result.rows[0]
      return {
        id: row.id,
        userId: row.user_id,
        email: row.email,
        name: row.name,
        passwordHash: row.password_hash,
        salt: row.salt,
        plan: row.plan,
        subscriptionId: row.subscription_id,
        subscriptionStatus: row.subscription_status,
        subscriptionStart: row.subscription_start,
        subscriptionEnd: row.subscription_end,
        urlsCreated: row.urls_created,
        createdAt: row.created_at,
        lastActivity: row.last_activity
      }
    } catch (error) {
      console.error('Error getting user by email:', error)
      return null
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    const client = getPool()
    try {
      const result = await client.query('SELECT * FROM users WHERE user_id = $1', [userId])
      if (result.rows.length === 0) return null

      const row = result.rows[0]
      return {
        id: row.id,
        userId: row.user_id,
        email: row.email,
        name: row.name,
        passwordHash: row.password_hash,
        salt: row.salt,
        plan: row.plan,
        subscriptionId: row.subscription_id,
        subscriptionStatus: row.subscription_status,
        subscriptionStart: row.subscription_start,
        subscriptionEnd: row.subscription_end,
        urlsCreated: row.urls_created,
        createdAt: row.created_at,
        lastActivity: row.last_activity
      }
    } catch (error) {
      console.error('Error getting user by ID:', error)
      return null
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const client = getPool()
    try {
      const setClause = []
      const values = []
      let paramCount = 1

      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
          setClause.push(`${dbKey} = $${paramCount}`)
          values.push(value)
          paramCount++
        }
      }

      if (setClause.length === 0) return

      values.push(userId)
      await client.query(
        `UPDATE users SET ${setClause.join(', ')} WHERE user_id = $${paramCount}`,
        values
      )
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  async incrementUrlCount(userId: string): Promise<void> {
    const client = getPool()
    try {
      await client.query(
        'UPDATE users SET urls_created = urls_created + 1, last_activity = CURRENT_TIMESTAMP WHERE user_id = $1',
        [userId]
      )
    } catch (error) {
      console.error('Error incrementing URL count:', error)
    }
  }

  async getAllUsers(): Promise<User[]> {
    const client = getPool()
    try {
      const result = await client.query('SELECT * FROM users ORDER BY created_at DESC')
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        email: row.email,
        name: row.name,
        passwordHash: row.password_hash,
        salt: row.salt,
        plan: row.plan,
        subscriptionId: row.subscription_id,
        subscriptionStatus: row.subscription_status,
        subscriptionStart: row.subscription_start,
        subscriptionEnd: row.subscription_end,
        urlsCreated: row.urls_created,
        createdAt: row.created_at,
        lastActivity: row.last_activity
      }))
    } catch (error) {
      console.error('Error getting all users:', error)
      return []
    }
  }
}

// Session Database Operations
export class PostgresSessionDatabase {
  async createSession(session: UserSession): Promise<void> {
    const client = getPool()
    try {
      await client.query(
        'INSERT INTO sessions (session_id, user_id, created_at, expires_at, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6)',
        [session.sessionId, session.userId, session.createdAt, session.expiresAt, session.ipAddress, session.userAgent]
      )
    } catch (error) {
      console.error('Error creating session:', error)
      throw error
    }
  }

  async getSession(sessionId: string): Promise<UserSession | null> {
    const client = getPool()
    try {
      const result = await client.query('SELECT * FROM sessions WHERE session_id = $1', [sessionId])
      if (result.rows.length === 0) return null

      const row = result.rows[0]
      return {
        id: row.id,
        sessionId: row.session_id,
        userId: row.user_id,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
        ipAddress: row.ip_address,
        userAgent: row.user_agent
      }
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const client = getPool()
    try {
      const result = await client.query('DELETE FROM sessions WHERE session_id = $1', [sessionId])
      return (result.rowCount || 0) > 0
    } catch (error) {
      console.error('Error deleting session:', error)
      return false
    }
  }

  async cleanExpiredSessions(): Promise<number> {
    const client = getPool()
    try {
      const result = await client.query('DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP')
      const cleaned = result.rowCount || 0
      if (cleaned > 0) {
        console.log(`Cleaned ${cleaned} expired sessions`)
      }
      return cleaned
    } catch (error) {
      console.error('Error cleaning expired sessions:', error)
      return 0
    }
  }
}

// Export singleton instances
export const postgresUrlDatabase = new PostgresUrlDatabase()
export const postgresUserDatabase = new PostgresUserDatabase()
export const postgresSessionDatabase = new PostgresSessionDatabase()