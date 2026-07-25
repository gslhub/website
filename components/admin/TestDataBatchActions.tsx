'use client';

import { useDocumentInfo } from '@payloadcms/ui';
import { useState } from 'react';

type GenerationResponse = {
  error?: string;
  message?: string;
  recordCount?: number;
  status?: string;
};

export default function TestDataBatchActions() {
  const { id } = useDocumentInfo();
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!id) return null;

  const generate = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/test-data-batches/${id}/generate`, {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = (await response.json().catch(() => ({}))) as GenerationResponse;

      if (!response.ok) {
        throw new Error(data.error || `Generation failed with status ${response.status}.`);
      }

      setMessage(
        `${data.message || 'Test data generated.'}${
          typeof data.recordCount === 'number' ? ` ${data.recordCount} records created.` : ''
        }`,
      );

      window.setTimeout(() => window.location.reload(), 700);
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : 'An unknown test-data generation error occurred.',
      );
      setIsGenerating(false);
    }
  };

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '6px',
        marginBottom: '24px',
        padding: '20px',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: '8px' }}>Test-data generation</div>
      <p style={{ margin: '0 0 16px', color: 'var(--theme-elevation-600)' }}>
        The batch is saved first. Generation runs as a separate administrator action so errors can be
        reported without interrupting document creation.
      </p>
      <button
        type="button"
        onClick={generate}
        disabled={isGenerating}
        style={{
          background: 'var(--theme-success-500)',
          border: 0,
          borderRadius: '4px',
          color: 'var(--theme-success-50)',
          cursor: isGenerating ? 'wait' : 'pointer',
          fontWeight: 600,
          padding: '10px 16px',
        }}
      >
        {isGenerating ? 'Generating test data…' : 'Generate test data'}
      </button>
      {message ? (
        <p style={{ color: 'var(--theme-success-500)', margin: '12px 0 0' }}>{message}</p>
      ) : null}
      {error ? (
        <div
          role="alert"
          style={{
            background: 'var(--theme-error-100)',
            border: '1px solid var(--theme-error-400)',
            borderRadius: '4px',
            color: 'var(--theme-error-700)',
            marginTop: '12px',
            padding: '12px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}
