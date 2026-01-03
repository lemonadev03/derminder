import { NextRequest, NextResponse } from 'next/server';
import { redis, REDIS_KEY_PREFIX } from '@/lib/redis';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export interface DayLogEntries {
  face_morning?: string;
  face_evening?: string;
  scalp_morning?: string;
  scalp_evening?: string;
  orals_morning?: string;
  orals_evening?: string;
}

export interface DayLog {
  date: string;
  entries: DayLogEntries;
}

// GET /api/logs?from=2025-12-01&to=2025-12-31
export async function GET(request: NextRequest) {
  if (!verifyAuth(request)) {
    return unauthorizedResponse();
  }

  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!from || !to) {
    return NextResponse.json(
      { error: 'Missing from or to date parameter' },
      { status: 400 }
    );
  }

  try {
    // Get all dates in range
    const dates: string[] = [];
    const startDate = new Date(from);
    const endDate = new Date(to);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }

    // Fetch all logs in parallel
    const keys = dates.map(date => `${REDIS_KEY_PREFIX}${date}`);
    const results = await Promise.all(
      keys.map(key => redis.get<DayLogEntries>(key))
    );

    // Build response
    const logs: Record<string, DayLogEntries> = {};
    dates.forEach((date, i) => {
      if (results[i]) {
        logs[date] = results[i];
      }
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

// POST /api/logs
// Body: { date: "2025-12-27", entries: { face_morning: "2025-12-27T08:30:00Z", ... } }
export async function POST(request: NextRequest) {
  if (!verifyAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const body: DayLog = await request.json();
    
    if (!body.date || !body.entries) {
      return NextResponse.json(
        { error: 'Missing date or entries' },
        { status: 400 }
      );
    }

    const key = `${REDIS_KEY_PREFIX}${body.date}`;
    
    // Get existing entries and merge
    const existing = await redis.get<DayLogEntries>(key) || {};
    const merged = { ...existing, ...body.entries };
    
    // Remove null/undefined entries (for un-toggling)
    Object.keys(merged).forEach(k => {
      if (merged[k as keyof DayLogEntries] === null || merged[k as keyof DayLogEntries] === undefined) {
        delete merged[k as keyof DayLogEntries];
      }
    });

    await redis.set(key, merged);

    return NextResponse.json({ success: true, date: body.date, entries: merged });
  } catch (error) {
    console.error('Error saving log:', error);
    return NextResponse.json(
      { error: 'Failed to save log' },
      { status: 500 }
    );
  }
}

