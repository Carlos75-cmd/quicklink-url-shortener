import { createHash, randomBytes } from 'crypto'
import { 
  postgresUserDatabase, 
  postgresSessionDatabase, 
  User, 
  UserSession,
  initializeDatabase 
} from './database-postgres'

export interface AuthUser {
  id: string
  email: string
  name: string
  plan: 'free' | 'pro' | 'enterprise'
}

class PostgresAuthManager {
  private initialized = false

  async initialize() {
    if (!this.initialized) {
      // Don't initialize database tables automatically in production
      // Tables should be created manually using init-database.sql
      if (process.env.NODE_ENV !== 'production') {
        await initializeDatabase()
      }
      await this.cleanExpiredSessions()
      await this.checkExpiredSubscriptions()
      await this.initializeTestUsers()
      this.initialized = true
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
  async register(email: string, name: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    await this.initialize()

    try {
      // Check if email already exists
      const existingUser = await postgresUserDatabase.getUserByEmail(email)
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

      const newUser: User = {
        userId,
        email: email.toLowerCase(),
        name,
        passwordHash,
        salt,
        plan: 'free',
        urlsCreated: 0,
        createdAt: new Date(),
        lastActivity: new Date()
      }

      await postgresUserDatabase.createUser(newUser)
      
      console.log(`New user registered: ${email} (${userId})`)
      return { 
        success: true, 
        user: {
          id: userId,
          email: newUser.email,
          name: newUser.name,
          plan: newUser.plan
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed' }
    }
  }

  // Login user
  async login(email: string, password: string, ipAddress: string, userAgent: string): Promise<{ success: boolean; user?: AuthUser; sessionId?: string; error?: string }> {
    await this.initialize()

    try {
      const user = await postgresUserDatabase.getUserByEmail(email)
      
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
        await postgresUserDatabase.updateUser(user.userId, {
          plan: 'free',
          subscriptionStatus: 'expired'
        })
        user.plan = 'free'
        user.subscriptionStatus = 'expired'
        console.log(`User ${user.email} subscription expired, downgraded to free`)
      }

      // Create session (expires in 30 days)
      const sessionId = this.generateSessionId()
      const session: UserSession = {
        sessionId,
        userId: user.userId,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        ipAddress,
        userAgent
      }

      await postgresSessionDatabase.createSession(session)

      // Update last activity
      await postgresUserDatabase.updateUser(user.userId, {
        lastActivity: new Date()
      })

      console.log(`User logged in: ${email} (Session: ${sessionId})`)
      return { 
        success: true, 
        user: {
          id: user.userId,
          email: user.email,
          name: user.name,
          plan: user.plan
        }, 
        sessionId 
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed' }
    }
  }

  // Get user by session
  async getUserBySession(sessionId: string): Promise<AuthUser | null> {
    await this.initialize()

    try {
      const session = await postgresSessionDatabase.getSession(sessionId)
      if (!session) return null

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        await postgresSessionDatabase.deleteSession(sessionId)
        return null
      }

      const user = await postgresUserDatabase.getUserById(session.userId)
      if (!user) return null

      // Check if subscription is expired
      if (user.plan !== 'free' && this.isSubscriptionExpired(user)) {
        await postgresUserDatabase.updateUser(user.userId, {
          plan: 'free',
          subscriptionStatus: 'expired'
        })
        user.plan = 'free'
        console.log(`User ${user.email} subscription expired during session, downgraded to free`)
      }

      // Update last activity
      await postgresUserDatabase.updateUser(user.userId, {
        lastActivity: new Date()
      })

      return {
        id: user.userId,
        email: user.email,
        name: user.name,
        plan: user.plan
      }
    } catch (error) {
      console.error('Error getting user by session:', error)
      return null
    }
  }

  // Logout user
  async logout(sessionId: string): Promise<boolean> {
    await this.initialize()
    return await postgresSessionDatabase.deleteSession(sessionId)
  }

  // Update user subscription
  async updateUserSubscription(userId: string, subscriptionData: {
    subscriptionId: string
    plan: 'pro' | 'enterprise'
    status: 'active' | 'cancelled' | 'expired'
    durationMonths?: number
  }): Promise<boolean> {
    await this.initialize()

    try {
      const months = subscriptionData.durationMonths || 1
      const subscriptionEnd = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000)

      await postgresUserDatabase.updateUser(userId, {
        plan: subscriptionData.plan,
        subscriptionId: subscriptionData.subscriptionId,
        subscriptionStatus: subscriptionData.status,
        subscriptionStart: new Date(),
        subscriptionEnd
      })

      const user = await postgresUserDatabase.getUserById(userId)
      console.log(`User ${user?.email} subscription updated: ${subscriptionData.plan} until ${subscriptionEnd}`)
      return true
    } catch (error) {
      console.error('Error updating subscription:', error)
      return false
    }
  }

  // Check if subscription is expired
  private isSubscriptionExpired(user: User): boolean {
    if (!user.subscriptionEnd) return true
    return user.subscriptionEnd < new Date()
  }

  // Clean expired sessions
  private async cleanExpiredSessions() {
    await postgresSessionDatabase.cleanExpiredSessions()
  }

  // Check and update expired subscriptions
  private async checkExpiredSubscriptions() {
    try {
      const users = await postgresUserDatabase.getAllUsers()
      let updated = 0
      
      for (const user of users) {
        if (user.plan !== 'free' && this.isSubscriptionExpired(user)) {
          await postgresUserDatabase.updateUser(user.userId, {
            plan: 'free',
            subscriptionStatus: 'expired'
          })
          updated++
          console.log(`User ${user.email} subscription expired, downgraded to free`)
        }
      }
      
      if (updated > 0) {
        console.log(`Updated ${updated} expired subscriptions`)
      }
    } catch (error) {
      console.error('Error checking expired subscriptions:', error)
    }
  }

  // Get user stats
  async getUserStats(userId: string): Promise<{
    plan: string
    urlsCreated: number
    subscriptionStatus?: string
    subscriptionEnd?: Date
    daysRemaining?: number
  } | null> {
    await this.initialize()

    try {
      const user = await postgresUserDatabase.getUserById(userId)
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
    } catch (error) {
      console.error('Error getting user stats:', error)
      return null
    }
  }

  // Increment URL count for user
  async incrementUrlCount(userId: string): Promise<void> {
    await this.initialize()
    await postgresUserDatabase.incrementUrlCount(userId)
  }

  // Get all users (for admin)
  async getAllUsers(): Promise<User[]> {
    await this.initialize()
    return await postgresUserDatabase.getAllUsers()
  }

  // Initialize with test users (only if no users exist)
  async initializeTestUsers() {
    try {
      const users = await postgresUserDatabase.getAllUsers()
      if (users.length === 0) {
        // Free user
        await this.register('free@example.com', 'Free User', 'password123')
        
        // Pro user with active subscription
        const proResult = await this.register('pro@example.com', 'Pro User', 'password123')
        if (proResult.user) {
          await this.updateUserSubscription(proResult.user.id, {
            subscriptionId: 'test_pro_subscription',
            plan: 'pro',
            status: 'active',
            durationMonths: 1
          })
        }
        
        // Enterprise user with active subscription
        const enterpriseResult = await this.register('enterprise@example.com', 'Enterprise User', 'password123')
        if (enterpriseResult.user) {
          await this.updateUserSubscription(enterpriseResult.user.id, {
            subscriptionId: 'test_enterprise_subscription',
            plan: 'enterprise',
            status: 'active',
            durationMonths: 1
          })
        }

        console.log('Test users initialized with PostgreSQL storage')
      }
    } catch (error) {
      console.error('Error initializing test users:', error)
    }
  }
}

export const postgresAuthManager = new PostgresAuthManager()