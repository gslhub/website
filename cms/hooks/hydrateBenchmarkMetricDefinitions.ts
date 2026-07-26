import type { CollectionAfterReadHook } from 'payload';

type BenchmarkDocument = Record<string, unknown> & {
  id?: unknown;
};

const getID = (value: unknown): string | number | null =>
  typeof value === 'string' || typeof value === 'number' ? value : null;

export const hydrateBenchmarkMetricDefinitions: CollectionAfterReadHook = async ({
  doc,
  req,
}) => {
  const benchmark = doc as BenchmarkDocument;
  const benchmarkID = getID(benchmark.id);

  if (benchmarkID === null) {
    return doc;
  }

  const definitions = await req.payload.find({
    collection: 'metric-definitions',
    where: {
      benchmarks: {
        contains: benchmarkID,
      },
    },
    sort: 'metricCode',
    limit: 100,
    depth: 0,
    pagination: false,
    draft: Boolean(req.user),
    overrideAccess: false,
    req,
  });

  return {
    ...benchmark,
    metricDefinitions: definitions.docs,
  };
};
