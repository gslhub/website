import type { CollectionConfig } from 'payload';

import { adminOnly } from '../access/scientificContentAccess';
import { prepareStorageVerificationAudit } from '../storage/storageVerificationAudit';

const isRoundtrip = (data?: Record<string, unknown>) =>
  data?.verificationType === 'roundtrip';

const isRecovery = (data?: Record<string, unknown>) =>
  data?.verificationType === 'recovery';

export const StorageVerifications: CollectionConfig = {
  slug: 'storage-verifications',
  labels: {
    singular: 'Storage Verification',
    plural: 'Storage Verifications',
  },
  access: {
    create: adminOnly,
    read: adminOnly,
    update: () => false,
    delete: () => false,
  },
  admin: {
    useAsTitle: 'verificationCode',
    group: 'Administration',
    defaultColumns: [
      'verificationCode',
      'verificationType',
      'status',
      'artifactCode',
      'testedAppVersion',
      'verifiedAt',
    ],
    description:
      'Immutable administrator-only audits proving persistent local storage roundtrip and backup/recovery checks. Create a replacement audit if a new verification is required.',
  },
  hooks: {
    beforeValidate: [prepareStorageVerificationAudit],
  },
  fields: [
    {
      name: 'verificationCode',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'Automatically generated immutable audit identifier.',
      },
    },
    {
      name: 'verificationType',
      type: 'select',
      required: true,
      options: [
        { label: 'Restart + redeploy roundtrip', value: 'roundtrip' },
        { label: 'Backup + recovery drill', value: 'recovery' },
      ],
      admin: {
        description:
          'Roundtrip is manually attested after the controlled HTTP 200 → Restart → HTTP 200 → Redeploy → HTTP 200 sequence. Recovery is normally created automatically by the recovery drill.',
      },
    },
    {
      name: 'testedAppVersion',
      type: 'text',
      required: true,
      admin: {
        condition: isRoundtrip,
        description:
          'Exact GSLHub version used during the controlled roundtrip test. For the completed first Hostinger roundtrip, enter 0.4.8. Recovery drills populate this automatically.',
      },
    },
    {
      name: 'artifact',
      type: 'relationship',
      relationTo: 'research-artifacts',
      required: true,
      admin: {
        description:
          'Select only the disposable TEST artifact used for this verification. The server rechecks the file, size and SHA-256 before saving the audit.',
      },
    },
    {
      name: 'roundtripEvidence',
      type: 'group',
      admin: {
        condition: isRoundtrip,
        description:
          'All five confirmations must be true. They attest the controlled persistence test already performed by the administrator.',
      },
      fields: [
        {
          name: 'initialHttp200',
          type: 'checkbox',
          label: 'Initial authenticated artifact request returned HTTP 200',
        },
        {
          name: 'restartFilePreserved',
          type: 'checkbox',
          label: 'File and SHA-256 were preserved after Node.js Restart',
        },
        {
          name: 'restartHttp200',
          type: 'checkbox',
          label: 'Artifact request returned HTTP 200 after Restart',
        },
        {
          name: 'redeployFilePreserved',
          type: 'checkbox',
          label: 'File and SHA-256 were preserved after Redeploy',
        },
        {
          name: 'redeployHttp200',
          type: 'checkbox',
          label: 'Artifact request returned HTTP 200 after Redeploy',
        },
      ],
    },
    {
      name: 'recoveryEvidence',
      type: 'group',
      admin: {
        condition: isRecovery,
        description:
          'Recovery evidence is set by the controlled backup/recovery drill and must be complete before a recovery audit can be saved.',
      },
      fields: [
        {
          name: 'backupCopyVerified',
          type: 'checkbox',
          label: 'Backup copy matched original SHA-256 and filesize',
        },
        {
          name: 'originalQuarantined',
          type: 'checkbox',
          label: 'Original file was moved out of its live path during the drill',
        },
        {
          name: 'restoredFromBackup',
          type: 'checkbox',
          label: 'Artifact was restored from the verified backup copy',
        },
        {
          name: 'restoredHashMatched',
          type: 'checkbox',
          label: 'Restored SHA-256 matched the original',
        },
        {
          name: 'restoredSizeMatched',
          type: 'checkbox',
          label: 'Restored filesize matched the original',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      options: [{ label: 'Verified', value: 'verified' }],
      admin: { readOnly: true },
    },
    {
      name: 'source',
      type: 'select',
      options: [
        {
          label: 'Manual controlled roundtrip attestation',
          value: 'manual-roundtrip-attestation',
        },
        { label: 'Automated recovery drill', value: 'automated-recovery-drill' },
      ],
      admin: { readOnly: true },
    },
    {
      name: 'storagePath',
      type: 'text',
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'artifactCode',
      type: 'text',
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'filename',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'sha256',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'filesize',
      type: 'number',
      admin: { readOnly: true },
    },
    {
      name: 'recordedByAppVersion',
      type: 'text',
      admin: {
        readOnly: true,
        description:
          'GSLHub version that wrote this immutable audit. This can differ from Tested App Version when a past completed roundtrip is being documented.',
      },
    },
    {
      name: 'verifiedAt',
      type: 'date',
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'verifiedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description:
          'Optional human-readable context, for example the controlled Hostinger restart/redeploy sequence or recovery drill notes.',
      },
    },
  ],
};
