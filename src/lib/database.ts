// Simple in-memory database (replace with real database in production)
export interface UrlData {
  originalUrl: string
  shortCode: string
  clicks: number
  createdAt: Date
}

class UrlDatabase {
  private urls = new Map<string, UrlData>()

  set(shortCode: string, data: UrlData) {
    this.urls.set(shortCode, data)
  }

  get(shortCode: string): UrlData | undefined {
    return this.urls.get(shortCode)
  }

  getAll(): UrlData[] {
    return Array.from(this.urls.values())
  }

  size(): number {
    return this.urls.size
  }

  getTotalClicks(): number {
    return Array.from(this.urls.values()).reduce((sum, item) => sum + item.clicks, 0)
  }
}

// Export singleton instance
export const urlDatabase = new UrlDatabase()