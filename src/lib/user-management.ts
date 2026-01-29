// Sistema de gestión de usuarios y suscripciones

interface User {
  id: string
  email?: string
  plan: 'free' | 'pro' | 'enterprise'
  subscriptionId?: string
  subscriptionStatus?: 'active' | 'cancelled' | 'expired'
  subscriptionExpiry?: Date
  urlsCreated: number
  createdAt: Date
  lastActivity: Date
}

interface UserSession {
  userId: string
  ipAddress: string
  userAgent: string
  urlsCreatedToday: number
  lastReset: Date
}

class UserManager {
  private users = new Map<string, User>()
  private sessions = new Map<string, UserSession>()

  // Generar ID único para usuario basado en IP + User Agent
  generateUserId(ipAddress: string, userAgent: string): string {
    const hash = this.simpleHash(ipAddress + userAgent)
    return `user_${hash}`
  }

  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36)
  }

  // Obtener o crear usuario
  getOrCreateUser(ipAddress: string, userAgent: string): User {
    const userId = this.generateUserId(ipAddress, userAgent)
    
    if (!this.users.has(userId)) {
      const newUser: User = {
        id: userId,
        plan: 'free',
        urlsCreated: 0,
        createdAt: new Date(),
        lastActivity: new Date()
      }
      this.users.set(userId, newUser)
    }

    const user = this.users.get(userId)!
    user.lastActivity = new Date()
    return user
  }

  // Obtener sesión del usuario
  getUserSession(userId: string, ipAddress: string, userAgent: string): UserSession {
    if (!this.sessions.has(userId)) {
      const newSession: UserSession = {
        userId,
        ipAddress,
        userAgent,
        urlsCreatedToday: 0,
        lastReset: new Date()
      }
      this.sessions.set(userId, newSession)
    }

    const session = this.sessions.get(userId)!
    
    // Reset daily counter if it's a new day
    const today = new Date().toDateString()
    const lastReset = session.lastReset.toDateString()
    
    if (today !== lastReset) {
      session.urlsCreatedToday = 0
      session.lastReset = new Date()
    }

    return session
  }

  // Verificar si el usuario puede crear más URLs
  canCreateUrl(userId: string, ipAddress: string, userAgent: string): {
    canCreate: boolean
    reason?: string
    limit?: number
    used?: number
    planType?: string
  } {
    const user = this.getOrCreateUser(ipAddress, userAgent)
    const session = this.getUserSession(userId, ipAddress, userAgent)

    // Verificar suscripción activa para planes pagos
    if (user.plan === 'pro' || user.plan === 'enterprise') {
      if (!this.isSubscriptionActive(user)) {
        // Downgrade to free if subscription expired
        user.plan = 'free'
        user.subscriptionStatus = 'expired'
      }
    }

    // Límites por plan
    const limits = {
      free: 100, // 100 URLs por mes (aproximadamente 3-4 por día)
      pro: -1,   // Ilimitado
      enterprise: -1 // Ilimitado
    }

    const dailyLimits = {
      free: 5,   // 5 URLs por día para usuarios gratuitos
      pro: -1,   // Ilimitado
      enterprise: -1 // Ilimitado
    }

    const monthlyLimit = limits[user.plan]
    const dailyLimit = dailyLimits[user.plan]

    // Para usuarios gratuitos, verificar límites
    if (user.plan === 'free') {
      // Verificar límite diario
      if (dailyLimit > 0 && session.urlsCreatedToday >= dailyLimit) {
        return {
          canCreate: false,
          reason: 'daily_limit_exceeded',
          limit: dailyLimit,
          used: session.urlsCreatedToday,
          planType: user.plan
        }
      }

      // Verificar límite mensual
      if (monthlyLimit > 0 && user.urlsCreated >= monthlyLimit) {
        return {
          canCreate: false,
          reason: 'monthly_limit_exceeded',
          limit: monthlyLimit,
          used: user.urlsCreated,
          planType: user.plan
        }
      }
    }

    return {
      canCreate: true,
      limit: monthlyLimit,
      used: user.urlsCreated,
      planType: user.plan
    }
  }

  // Registrar creación de URL
  recordUrlCreation(userId: string, ipAddress: string, userAgent: string) {
    const user = this.getOrCreateUser(ipAddress, userAgent)
    const session = this.getUserSession(userId, ipAddress, userAgent)

    user.urlsCreated++
    session.urlsCreatedToday++
  }

  // Verificar si la suscripción está activa
  private isSubscriptionActive(user: User): boolean {
    if (!user.subscriptionId || !user.subscriptionStatus) {
      return false
    }

    if (user.subscriptionStatus === 'cancelled' || user.subscriptionStatus === 'expired') {
      return false
    }

    if (user.subscriptionExpiry && user.subscriptionExpiry < new Date()) {
      return false
    }

    return user.subscriptionStatus === 'active'
  }

  // Actualizar suscripción del usuario
  updateUserSubscription(userId: string, subscriptionData: {
    subscriptionId: string
    plan: 'pro' | 'enterprise'
    status: 'active' | 'cancelled' | 'expired'
    expiryDate?: Date
  }) {
    const user = this.users.get(userId)
    if (user) {
      user.plan = subscriptionData.plan
      user.subscriptionId = subscriptionData.subscriptionId
      user.subscriptionStatus = subscriptionData.status
      user.subscriptionExpiry = subscriptionData.expiryDate
    }
  }

  // Obtener estadísticas del usuario
  getUserStats(userId: string): {
    plan: string
    urlsCreated: number
    urlsCreatedToday: number
    subscriptionStatus?: string
    subscriptionExpiry?: Date
  } | null {
    const user = this.users.get(userId)
    const session = this.sessions.get(userId)
    
    if (!user) return null

    return {
      plan: user.plan,
      urlsCreated: user.urlsCreated,
      urlsCreatedToday: session?.urlsCreatedToday || 0,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionExpiry: user.subscriptionExpiry
    }
  }

  // Obtener todos los usuarios (para admin)
  getAllUsers(): User[] {
    return Array.from(this.users.values())
  }
}

// Instancia singleton
export const userManager = new UserManager()