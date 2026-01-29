// Sistema de autenticación simple
import { userManager } from './user-management'

export interface AuthUser {
  id: string
  email: string
  name: string
  plan: 'free' | 'pro' | 'enterprise'
  createdAt: Date
}

class AuthManager {
  private users = new Map<string, AuthUser>()
  private sessions = new Map<string, string>() // sessionId -> userId

  // Registrar nuevo usuario
  register(email: string, name: string, password: string): { success: boolean; user?: AuthUser; error?: string } {
    // Verificar si el email ya existe
    const existingUser = Array.from(this.users.values()).find(u => u.email === email)
    if (existingUser) {
      return { success: false, error: 'Email already registered' }
    }

    // Crear nuevo usuario
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newUser: AuthUser = {
      id: userId,
      email,
      name,
      plan: 'free',
      createdAt: new Date()
    }

    this.users.set(userId, newUser)
    console.log(`New user registered: ${email} (${userId})`)

    return { success: true, user: newUser }
  }

  // Login de usuario
  login(email: string, password: string): { success: boolean; user?: AuthUser; sessionId?: string; error?: string } {
    const user = Array.from(this.users.values()).find(u => u.email === email)
    
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // En un sistema real, verificarías la contraseña hasheada
    // Por simplicidad, aceptamos cualquier contraseña para testing

    // Crear sesión
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.sessions.set(sessionId, user.id)

    console.log(`User logged in: ${email} (Session: ${sessionId})`)

    return { success: true, user, sessionId }
  }

  // Obtener usuario por sesión
  getUserBySession(sessionId: string): AuthUser | null {
    const userId = this.sessions.get(sessionId)
    if (!userId) return null

    return this.users.get(userId) || null
  }

  // Logout
  logout(sessionId: string): boolean {
    return this.sessions.delete(sessionId)
  }

  // Actualizar plan del usuario
  updateUserPlan(userId: string, plan: 'free' | 'pro' | 'enterprise', subscriptionId?: string) {
    const user = this.users.get(userId)
    if (user) {
      user.plan = plan
      console.log(`User plan updated: ${user.email} -> ${plan}`)
    }
  }

  // Obtener todos los usuarios (para admin)
  getAllUsers(): AuthUser[] {
    return Array.from(this.users.values())
  }

  // Crear usuario de prueba
  createTestUser(): { user: AuthUser; sessionId: string } {
    const testEmail = `test_${Date.now()}@example.com`
    const testName = `Test User ${Math.floor(Math.random() * 1000)}`
    
    const result = this.register(testEmail, testName, 'password123')
    if (result.success && result.user) {
      const loginResult = this.login(testEmail, 'password123')
      if (loginResult.success && loginResult.sessionId) {
        return {
          user: result.user,
          sessionId: loginResult.sessionId
        }
      }
    }
    
    throw new Error('Failed to create test user')
  }
}

export const authManager = new AuthManager()

// Crear algunos usuarios de prueba al inicializar
export function initializeTestUsers() {
  // Usuario gratuito
  authManager.register('free@example.com', 'Free User', 'password123')
  
  // Usuario Pro
  const proResult = authManager.register('pro@example.com', 'Pro User', 'password123')
  if (proResult.user) {
    authManager.updateUserPlan(proResult.user.id, 'pro', 'test_subscription_pro')
  }
  
  // Usuario Enterprise
  const enterpriseResult = authManager.register('enterprise@example.com', 'Enterprise User', 'password123')
  if (enterpriseResult.user) {
    authManager.updateUserPlan(enterpriseResult.user.id, 'enterprise', 'test_subscription_enterprise')
  }

  console.log('Test users initialized:')
  console.log('- free@example.com (Free plan)')
  console.log('- pro@example.com (Pro plan)')
  console.log('- enterprise@example.com (Enterprise plan)')
  console.log('Password for all: password123')
}