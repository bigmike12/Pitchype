import { createClient } from '@/lib/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const influencerId = searchParams.get('influencer_id')

    if (!influencerId) {
      return NextResponse.json(
        { error: 'Influencer ID is required' },
        { status: 400 }
      )
    }

    const { data: balance, error } = await supabase
      .from('influencer_balances')
      .select('*')
      .eq('influencer_id', influencerId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching balance:', error)
      return NextResponse.json(
        { error: 'Failed to fetch balance' },
        { status: 500 }
      )
    }

    // Return null if no balance found (PGRST116 error)
    return NextResponse.json({ balance: balance || null })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { influencer_id, available_balance, pending_balance, total_earnings } = body

    if (!influencer_id || available_balance === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: balance, error } = await supabase
      .from('influencer_balances')
      .upsert({
        influencer_id,
        available_balance,
        pending_balance: pending_balance || 0,
        total_earnings: total_earnings || 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating balance:', error)
      return NextResponse.json(
        { error: 'Failed to update balance' },
        { status: 500 }
      )
    }

    return NextResponse.json({ balance })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}