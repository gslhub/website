import { MongoClient } from 'mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type MongoHealthError = Error & {
  code?: number | string;
  codeName?: string;
};

const connectionCandidates = [
  ['DATABASE_URL', process.env.DATABASE_URL],
  ['MONGODB_URI', process.env.MONGODB_URI],
  ['MONGODB_URL', process.env.MONGODB_URL],
  ['MONGO_URI', process.env.MONGO_URI],
  ['MONGO_URL', process.env.MONGO_URL],
] as const;

export async function GET() {
  const configuredConnection = connectionCandidates.find(([, value]) => Boolean(value));

  if (!configuredConnection) {
    return Response.json(
      {
        status: 'error',
        database: 'not-configured',
        expectedVariables: connectionCandidates.map(([name]) => name),
      },
      { status: 503 },
    );
  }

  const [source, connectionString] = configuredConnection;
  const client = new MongoClient(connectionString as string, {
    connectTimeoutMS: 15_000,
    serverSelectionTimeoutMS: 15_000,
    maxPoolSize: 1,
  });

  try {
    await client.connect();
    const database = client.db();
    await database.command({ ping: 1 });

    return Response.json({
      status: 'ok',
      database: database.databaseName || 'connected',
      provider: 'mongodb',
      source,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    const databaseError = error as MongoHealthError;
    const errorCode = databaseError.codeName ?? databaseError.code ?? databaseError.name ?? 'MONGODB_CONNECTION_ERROR';

    console.error('[database-health]', String(errorCode));

    return Response.json(
      {
        status: 'error',
        database: 'unreachable',
        provider: 'mongodb',
        source,
        reason: String(errorCode),
      },
      { status: 503 },
    );
  } finally {
    await client.close().catch(() => undefined);
  }
}
