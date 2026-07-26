import type { CollectionConfig } from 'payload';

import { protectDatasetRelease } from '../hooks/protectDatasetRelease';
import { Datasets as BaseDatasets } from './Datasets';

export const Datasets: CollectionConfig = {
  ...BaseDatasets,
  hooks: {
    ...BaseDatasets.hooks,
    beforeValidate: [
      ...(BaseDatasets.hooks?.beforeValidate || []),
      protectDatasetRelease,
    ],
  },
};
