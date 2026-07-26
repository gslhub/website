import type { CollectionConfig } from 'payload';

import { protectPublicationRelease } from '../hooks/protectPublicationRelease';
import { Publications as BasePublications } from './research';

export const Publications: CollectionConfig = {
  ...BasePublications,
  hooks: {
    ...BasePublications.hooks,
    beforeValidate: [
      ...(BasePublications.hooks?.beforeValidate || []),
      protectPublicationRelease,
    ],
  },
};
