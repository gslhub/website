import type { CollectionConfig } from 'payload';

import { inheritObservationExecutionContext } from '../hooks/inheritObservationExecutionContext';
import { protectObservationSnapshot } from '../hooks/protectObservationSnapshot';
import { validateObservationCoding } from '../hooks/validateObservationCoding';
import { createScientificRecordCodeValidator } from '../hooks/validateScientificRecordCode';
import { Observations as BaseObservations } from './Observations';

const validateObservationCode = createScientificRecordCodeValidator({
  field: 'observationCode',
  token: 'OBS',
  label: 'Observation',
});

export const Observations: CollectionConfig = {
  ...BaseObservations,
  hooks: {
    ...BaseObservations.hooks,
    beforeValidate: [
      ...(BaseObservations.hooks?.beforeValidate || []),
      validateObservationCode,
      inheritObservationExecutionContext,
      validateObservationCoding,
      protectObservationSnapshot,
    ],
  },
};
