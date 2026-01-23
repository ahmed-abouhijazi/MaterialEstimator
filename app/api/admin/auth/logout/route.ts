import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  
  // Clear the admin token cookie
  response.cookies.delete('admin-token')
  
  return response
}
