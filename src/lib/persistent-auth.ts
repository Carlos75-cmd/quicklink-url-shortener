import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { createHash, randomBytes } from 'crypto'

export interface PersistentUser {
  id: string
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
  sessionId: string
  userId: string
  createdAt: Date
  expiresAt: Date
  ipAddress: string
  userAgent: string
}

class PersistentAuthManager {
  private users = new Map<string, PersistentUser>()
  private sessions = new Map<string, UserSession>()
  private usersFile = join(process.cwd(), 'data', 'users.json')
  private sessionsFile = join(process.cwd(), 'data', 'sessions.json')

  constructor() {
    this.loadFromFiles()
    this.cleanExpiredSessions()
    this.checkExpiredSubscriptions()
  }

  private loadFromFiles() {
    try {
      // Create data directory if it doesn't exist
      const dataDir = join(process.cwd(), 'data')
      if (!existsSync(dataDir)) {
        require('fs').mkdirSync(dataDir, { recursive: true })
      }

      // Load users
      if (existsSync(this.usersFile)) {
        const usersData = readFileSync(this.usersFile, 'utf8')
        const usersArray = JSON.parse(usersData)
        
        usersArray.forEach((user: any) => {
          user.createdAt = new Date(user.createdAt)
          user.lastActivity = new Date(user.lastActivity)
          if (user.subscriptionStart) user.subscriptionStart = new Date(user.subscriptionStart)
          if (user.subscriptionEnd) user.subscriptionEnd = new Date(user.subscriptionEnd)
          this.users.set(user.id, user)
        })
        
        console.log(`Loaded ${this.users.size} users from file`)
      }

      // Load sessions
      if (existsSync(this.sessionsFile)) {
        const sessionsData = readFileSync(this.sessionsFile, 'utf8')
        const sessionsArray = JSON.parse(sessionsData)
        
        sessionsArray.forEach((session: any) => {
          session.createdAt = new Date(session.createdAt)
          session.expiresAt = new Date(session.expiresAt)
          this.sessions.set(session.sessionId, session)
        })
        
        console.log(`Loaded ${this.sessions.size} sessions from file`)
      }

    } catch (error) {
      console.error('Error loading auth data from files:', error)
    }
  }

  private saveUsers() {
    try {
      const usersArray = Array.from(this.users.values())
      writeFileSync(this.usersFile, JSON.stringify(usersArray, null, 2))
    } catch (error) {
      console.error('Error saving users to file:', error)
    }
  }

  private saveSessions() {
    try {
      const sessionsArray = Array.from(this.sessions.values())
      writeFileSync(this.sessionsFile, JSON.stringify(sessionsArray, null, 2))
    } catch (error) {
      console.error('Error saving sessions to file:', error)
    }
  }

  // Hash password with salt
  private hashPassword(password: string, salt: string): string {
    return createHash('sha256').update(password + salt).digest('hex')
  }

  // Generate random salt
  private generateSalt(): string {
    return randomBytes(32).toString('hex')
  }

  // Generate session ID
  private generateSessionId(): string {
    return randomBytes(32).toString('hex')
  }

  // Register new user
  register(email: string, name: string, password: string): { success: boolean; user?: PersistentUser; error?: string } {
    // Check if email already exists
    const existingUser = Array.from(this.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      return { success: false, error: 'Email already registered' }
    }

    // Validate password strength
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' }
    }

    // Create new user
    const userId = `user_${Date.now()}_${randomBytes(8).toString('hex')}`
    const salt = this.generateSalt()
    const passwordHash = this.hashPassword(password, salt)

    const newUser: PersistentUser = {
      id: userId,
      email: email.toLowerCase(),
      name,
      passwordHash,
      salt,
      plan: 'free',
      urlsCreated: 0,
      createdAt: new Date(),
      lastActivity: new Date()
    }

    this.users.set(userId, newUser)
    this.saveUsers()
    
    console.log(`New user registered: ${email} (${userId})`)
    return { success: true, user: newUser }
  }

  // Login user
  login(email: string, password: string, ipAddress: string, userAgent: string): { success: boolean; user?: PersistentUser; sessionId?: string; error?: string } {
    const user = Array.from(this.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase())
    
    if (!user) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Verify password
    const passwordHash = this.hashPassword(password, user.salt)
    if (passwordHash !== user.passwordHash) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Check if subscription is expired
    if (user.plan !== 'free' && this.isSubscriptionExpired(user)) {
      user.plan = 'free'
      user.subscriptionStatus = 'expired'
      this.saveUsers()
      console.log(`User ${user.email} subscription expired, downgraded to free`)
    }

    // Create session (expires in 30 days)
    const sessionId = this.generateSessionId()
    const session: UserSession = {
      sessionId,
      userId: user.id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      ipAddress,
      userAgent
    }

    this.sessions.set(sessionId, session)
    this.saveSessions()

    // Update last activity
    user.lastActivity = new Date()
    this.saveUsers()

    console.log(`User logged in: ${email} (Session: ${sessionId})`)
    return { success: true, user, sessionId }
  }

  // Get user by session
  getUserBySession(sessionId: string): PersistentUser | null {
    const session = this.sessions.get(sessionId)
    if (!session) return null

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionId)
      this.saveSessions()
      return null
    }

    const user = this.users.get(session.userId)
    if (!user) return null

    // Check if subscription is expired
    if (user.plan !== 'free' && this.isSubscriptionExpired(user)) {
      user.plan = 'free'
      user.subscriptionStatus = 'expired'
      this.saveUsers()
      console.log(`User ${user.email} subscription expired during session, downgraded to free`)
    }

    // Update last activity
    user.lastActivity = new Date()
    this.saveUsers()

    return user
  }

  // Logout user
  logout(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId)
    if (deleted) {
      this.saveSessions()
    }
    return deleted
  }

  // Update user subscription
  updateUserSubscription(userId: string, subscriptionData: {
    subscriptionId: string
    plan: 'pro' | 'enterprise'
    status: 'active' | 'cancelled' | 'expired'
    durationMonths?: number
  }) {
    const user = this.users.get(userId)
    if (!user) return false

    user.plan = subscriptionData.plan
    user.subscriptionId = subscriptionData.subscriptionId
    user.subscriptionStatus = subscriptionData.status
    user.subscriptionStart = new Date()
    
    // Calculate end date based on duration (default 1 month)
    const months = subscriptionData.durationMonths || 1
    user.subscriptionEnd = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000)

    this.saveUsers()
    
    console.log(`User ${user.email} subscription updated: ${subscriptionData.plan} until ${user.subscriptionEnd}`)
    return true
  }

  // Check if subscription is expired
  private isSubscriptionExpired(user: PersistentUser): boolean {
    if (!user.subscriptionEnd) return true
    return user.subscriptionEnd < new Date()
  }

  // Clean expired sessions
  private cleanExpiredSessions() {
    const now = new Date()
    let cleaned = 0
    
    this.sessions.forEach((session, sessionId) => {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId)
        cleaned++
      }
    })
    
    if (cleaned > 0) {
      this.saveSessions()
      console.log(`Cleaned ${cleaned} expired sessions`)
    }
  }

  // Check and update expired subscriptions
  private checkExpiredSubscriptions() {
    let updated = 0
    
    this.users.forEach((user) => {
      if (user.plan !== 'free' && this.isSubscriptionExpired(user)) {
        user.plan = 'free'
        user.subscriptionStatus = 'expired'
        updated++
        console.log(`User ${user.email} subscription expired, downgraded to free`)
      }
    })
    
    if (updated > 0) {
      this.saveUsers()
      console.log(`Updated ${updated} expired subscriptions`)
    }
  }

  // Get user stats
  getUserStats(userId: string): {
    plan: string
    urlsCreated: number
    subscriptionStatus?: string
    subscriptionEnd?: Date
    daysRemaining?: number
  } | null {
    const user = this.users.get(userId)
    if (!user) return null

    let daysRemaining: number | undefined
    if (user.subscriptionEnd && user.plan !== 'free') {
      const msRemaining = user.subscriptionEnd.getTime() - Date.now()
      daysRemaining = Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)))
    }

    return {
      plan: user.plan,
      urlsCreated: user.urlsCreated,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEnd: user.subscriptionEnd,
      daysRemaining
    }
  }

  // Increment URL count for user
  incrementUrlCount(userId: string) {
    const user = this.users.get(userId)
    if (user) {
      user.urlsCreated++
      this.saveUsers()
    }
  }

  // Get all users (for admin)
  getAllUsers(): PersistentUser[] {
    return Array.from(this.users.values())
  }

  // Initialize with test users (only if no users exist)
  initializeTestUsers() {
    if (this.users.size === 0) {
      // Free user
      this.register('free@example.com', 'Free User', 'password123')
      
      // Pro user with active subscription
      const proResult = this.register('pro@example.com', 'Pro User', 'password123')
      if (proResult.user) {
        this.updateUserSubscription(proResult.user.id, {
          subscriptionId: 'test_pro_subscription',
          plan: 'pro',
          status: 'active',
          durationMonths: 1
        })
      }
      
      // Enterprise user with active subscription
      const enterpriseResult = this.register('enterprise@example.com', 'Enterprise User', 'password123')
      if (enterpriseResult.user) {
        this.updateUserSubscription(enterpriseResult.user.id, {
          subscriptionId: 'test_enterprise_subscription',
          plan: 'enterprise',
          status: 'active',
          durationMonths: 1
        })
      }

      console.log('Test users initialized with persistent storage')
    }
  }

  // Generate API key for Enterprise users
  generateApiKey(userId: string): string {
    const user = this.users.get(userId)
    
    if (!user || user.plan !== 'enterprise') {
      throw new Error('API keys are only available for Enterprise users')
    }

    const apiKey = 'qk_' + randomBytes(32).toString('hex');
    // Store API key in user object (extend interface if needed)
    (user as any).apiKey = apiKey;
    this.saveUsers()
    
    return apiKey
  }

  // Get user by API key
  getUserByApiKey(apiKey: string): PersistentUser | null {
    const users = Array.from(this.users.values());
    for (const user of users) {
      if ((user as any).apiKey === apiKey) {
        // Check if subscription is expired
        if (user.plan !== 'free' && this.isSubscriptionExpired(user)) {
          user.plan = 'free';
          user.subscriptionStatus = 'expired';
          this.saveUsers();
        }
        return user;
      }
    }
    return null;
  }

  // API usage tracking (simple in-memory for fallback)
  private apiUsage = new Map<string, { requests: number, month: string }>()

  getApiUsage(userId: string, month: string): { requests: number, limit: number } {
    const key = `${userId}_${month}`
    const usage = this.apiUsage.get(key)
    return {
      requests: usage?.requests || 0,
      limit: 1000000 // 1M requests per month for Enterprise
    }
  }

  incrementApiUsage(userId: string, month: string): void {
    const key = `${userId}_${month}`
    const current = this.apiUsage.get(key)
    this.apiUsage.set(key, {
      requests: (current?.requests || 0) + 1,
      month
    })
  }
}

export const persistentAuthManager = new PersistentAuthManager()