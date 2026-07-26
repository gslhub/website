import type { CollectionConfig } from 'payload';

import { protectProjectDefinition } from '../hooks/protectProjectDefinition';
import { Projects as BaseProjects } from './research';

export const Projects: CollectionConfig = {
  ...BaseProjects,
  hooks: {
    ...BaseProjects.hooks,
    beforeValidate: [
      ...(BaseProjects.hooks?.beforeValidate || []),
      protectProjectDefinition,
    ],
  },
};
