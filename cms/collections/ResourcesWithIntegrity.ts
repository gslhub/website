import type { CollectionConfig } from 'payload';

import { protectResourceRelease } from '../hooks/protectResourceRelease';
import { Resources as BaseResources } from './Resources';

export const Resources: CollectionConfig = {
  ...BaseResources,
  hooks: {
    ...BaseResources.hooks,
    beforeValidate: [
      ...(BaseResources.hooks?.beforeValidate || []),
      protectResourceRelease,
    ],
  },
};
