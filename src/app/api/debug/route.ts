import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasDatabase: !!(process.env.DATABASE_URL || process.env.POSTGRES_URL),
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
}