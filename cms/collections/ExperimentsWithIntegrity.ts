import type { CollectionConfig } from 'payload';

import { protectExperimentProtocol } from '../hooks/protectExperimentProtocol';
import { Experiments as BaseExperiments } from './Experiments';

export const Experiments: CollectionConfig = {
  ...BaseExperiments,
  hooks: {
    ...BaseExperiments.hooks,
    beforeValidate: [
      ...(BaseExperiments.hooks?.beforeValidate || []),
      protectExperimentProtocol,
    ],
  },
};
