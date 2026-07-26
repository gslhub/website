import type { CollectionConfig } from 'payload';

import { protectSoftwareRelease } from '../hooks/protectSoftwareRelease';
import { Software as BaseSoftware } from './Software';

export const Software: CollectionConfig = {
  ...BaseSoftware,
  hooks: {
    ...BaseSoftware.hooks,
    beforeValidate: [
      ...(BaseSoftware.hooks?.beforeValidate || []),
      protectSoftwareRelease,
    ],
  },
};
