import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Simple file-based database for development (replace with real database in production)
export interface UrlData {
  originalUrl: string
  shortCode: string
  clicks: number
  createdAt: Date
  userId?: string
}

class UrlDatabase {
  private urls = new Map<string, UrlData>()
  private dataFile = join(process.cwd(), 'data', 'urls.json')

  constructor() {
    this.loadFromFile()
  }

  private loadFromFile() {
    try {
      // Create data directory if it doesn't exist
      const dataDir = join(process.cwd(), 'data')
      if (!existsSync(dataDir)) {
        require('fs').mkdirSync(dataDir, { recursive: true })
      }

      if (existsSync(this.dataFile)) {
        const data = readFileSync(this.dataFile, 'utf8')
        const urlsArray = JSON.parse(data)
        
        // Convert back to Map and restore Date objects
        urlsArray.forEach((item: any) => {
          item.createdAt = new Date(item.createdAt)
          this.urls.set(item.shortCode, item)
        })
        
        console.log(`Loaded ${this.urls.size} URLs from file`)
      }
    } catch (error) {
      console.error('Error loading URLs from file:', error)
    }
  }

  private saveToFile() {
    try {
      const urlsArray = Array.from(this.urls.values())
      writeFileSync(this.dataFile, JSON.stringify(urlsArray, null, 2))
    } catch (error) {
      console.error('Error saving URLs to file:', error)
    }
  }

  set(shortCode: string, data: UrlData) {
    this.urls.set(shortCode, data)
    this.saveToFile()
    console.log(`Saved URL: ${shortCode} -> ${data.originalUrl}`)
  }

  get(shortCode: string): UrlData | undefined {
    const result = this.urls.get(shortCode)
    console.log(`Looking for ${shortCode}: ${result ? 'FOUND' : 'NOT FOUND'}`)
    return result
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

  // Debug method to list all URLs
  listAll() {
    console.log('All URLs in database:')
    this.urls.forEach((data, shortCode) => {
      console.log(`  ${shortCode} -> ${data.originalUrl}`)
    })
  }
}

// Export singleton instance
export const urlDatabase = new UrlDatabase()