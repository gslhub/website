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

function classifyMongoError(error: MongoHealthError) {
  const message = error.message.toLowerCase();

  if (message.includes('authentication failed') || message.includes('bad auth')) {
    return 'AUTHENTICATION_FAILED';
  }

  if (message.includes('querysrv') || message.includes('enotfound') || message.includes('dns')) {
    return 'DNS_OR_SRV_LOOKUP_FAILED';
  }

  if (message.includes('tls') || message.includes('certificate') || message.includes('ssl')) {
    return 'TLS_CONNECTION_FAILED';
  }

  if (
    message.includes('timed out') ||
    message.includes('server selection') ||
    message.includes('econnrefused') ||
    message.includes('etimedout')
  ) {
    return 'NETWORK_OR_IP_ACCESS_LIST';
  }

  return String(error.codeName ?? error.code ?? error.name ?? 'MONGODB_CONNECTION_ERROR');
}

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
    connectTimeoutMS: 20_000,
    serverSelectionTimeoutMS: 20_000,
    maxPoolSize: 1,
    family: 4,
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
    const errorCode = classifyMongoError(databaseError);

    console.error('[database-health]', errorCode);

    return Response.json(
      {
        status: 'error',
        database: 'unreachable',
        provider: 'mongodb',
        source,
        reason: errorCode,
      },
      { status: 503 },
    );
  } finally {
    await client.close().catch(() => undefined);
  }
}
