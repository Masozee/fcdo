import { NextResponse } from 'next/server';

/**
 * API route to get trade flow types
 */
export async function GET() {
  try {
    // Since there is no tradeflow table, we'll create a static list based on the values used in the data
    const tradeFlows = [
      { id: 3, name: 'Export', description: 'Outbound trade from reporting country' },
      { id: 101, name: 'Import', description: 'Inbound trade to reporting country' }
    ];
    
    return NextResponse.json({
      success: true,
      data: tradeFlows
    });
    
  } catch (error) {
    console.error('Error fetching trade flow data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trade flow data' },
      { status: 500 }
    );
  }
} 