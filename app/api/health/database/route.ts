import postgres from 'postgres';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type HealthRow = {
  database: string;
  checkedAt: string;
};

export async function GET() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return Response.json(
      {
        status: 'error',
        database: 'not-configured',
      },
      { status: 503 },
    );
  }

  const sql = postgres(connectionString, {
    connect_timeout: 10,
    idle_timeout: 5,
    max: 1,
    ssl: 'require',
  });

  try {
    const [result] = await sql<HealthRow[]>`
      select
        current_database() as database,
        now()::text as "checkedAt"
    `;

    return Response.json({
      status: 'ok',
      database: result?.database ?? 'connected',
      checkedAt: result?.checkedAt ?? new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      '[database-health]',
      error instanceof Error ? error.message : 'Unknown database error',
    );

    return Response.json(
      {
        status: 'error',
        database: 'unreachable',
      },
      { status: 503 },
    );
  } finally {
    await sql.end({ timeout: 1 });
  }
}
