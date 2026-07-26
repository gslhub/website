import type { CollectionConfig } from 'payload';

import { inheritObservationExecutionContext } from '../hooks/inheritObservationExecutionContext';
import { protectObservationSnapshot } from '../hooks/protectObservationSnapshot';
import { Observations as BaseObservations } from './Observations';

export const Observations: CollectionConfig = {
  ...BaseObservations,
  hooks: {
    ...BaseObservations.hooks,
    beforeValidate: [
      ...(BaseObservations.hooks?.beforeValidate || []),
      inheritObservationExecutionContext,
      protectObservationSnapshot,
    ],
  },
};
