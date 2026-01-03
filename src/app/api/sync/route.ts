import { NextRequest, NextResponse } from 'next/server';
import { redis, REDIS_KEY_PREFIX } from '@/lib/redis';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { DayLogEntries } from '../logs/route';

// POST /api/sync
// Body: { logs: { "2025-12-27": { face_morning: "...", ... }, ... } }
export async function POST(request: NextRequest) {
  if (!verifyAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const body: { logs: Record<string, DayLogEntries> } = await request.json();
    
    if (!body.logs) {
      return NextResponse.json(
        { error: 'Missing logs object' },
        { status: 400 }
      );
    }

    const dates = Object.keys(body.logs);
    
    if (dates.length === 0) {
      return NextResponse.json({ success: true, synced: 0 });
    }

    // Get all existing entries first
    const keys = dates.map(date => `${REDIS_KEY_PREFIX}${date}`);
    const existingResults = await Promise.all(
      keys.map(key => redis.get<DayLogEntries>(key))
    );

    // Merge and save all
    const savePromises = dates.map(async (date, i) => {
      const existing = existingResults[i] || {};
      const incoming = body.logs[date];
      const merged = { ...existing, ...incoming };
      
      // Remove null/undefined entries
      Object.keys(merged).forEach(k => {
        if (merged[k as keyof DayLogEntries] === null || merged[k as keyof DayLogEntries] === undefined) {
          delete merged[k as keyof DayLogEntries];
        }
      });

      const key = `${REDIS_KEY_PREFIX}${date}`;
      await redis.set(key, merged);
      return { date, entries: merged };
    });

    const results = await Promise.all(savePromises);

    return NextResponse.json({ 
      success: true, 
      synced: results.length,
      logs: Object.fromEntries(results.map(r => [r.date, r.entries]))
    });
  } catch (error) {
    console.error('Error syncing logs:', error);
    return NextResponse.json(
      { error: 'Failed to sync logs' },
      { status: 500 }
    );
  }
}

