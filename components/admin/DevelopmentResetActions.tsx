'use client';

import { useEffect, useState } from 'react';

type ResetScope = 'test' | 'final';

type PreviewResponse = {
  mode?: 'development' | 'doctoral';
  scope?: ResetScope;
  deletions?: Record<string, number>;
  totalDeletions?: number;
  pilotMetricDefinitionsReset?: number;
  testResearchers?: Array<{ id: string; slug: string; name: string }>;
  preservedInfrastructureArtifacts?: number;
  preservedInfrastructureExecutions?: number;
  blockers?: string[];
  error?: string;
};

type DoctoralReadiness = {
  mode?: 'development' | 'doctoral';
  ready?: boolean;
  blockers?: string[];
  preservedInfrastructureArtifacts?: number;
  preservedInfrastructureExecutions?: number;
  error?: string;
};

type ActionResponse = {
  error?: string;
  message?: string;
};

const cardStyle = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: '6px',
  marginBottom: '18px',
  padding: '18px',
} as const;

const buttonStyle = {
  border: 0,
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 600,
  padding: '10px 14px',
} as const;

export default function DevelopmentResetActions() {
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [doctoralReadiness, setDoctoralReadiness] = useState<DoctoralReadiness | null>(null);
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadDoctoralReadiness = async () => {
    const response = await fetch('/api/development-reset/doctoral-readiness', {
      credentials: 'include',
      cache: 'no-store',
    });
    const data = (await response.json().catch(() => ({}))) as DoctoralReadiness;
    setDoctoralReadiness(data);
  };

  useEffect(() => {
    void loadDoctoralReadiness();
  }, []);

  const runPreview = async (scope: ResetScope) => {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch('/api/development-reset/preview', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope }),
      });
      const data = (await response.json().catch(() => ({}))) as PreviewResponse;
      if (!response.ok) throw new Error(data.error || `Preview failed with ${response.status}.`);
      setPreview(data);
      setConfirmation('');
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : String(previewError));
    } finally {
      setBusy(false);
    }
  };

  const executeReset = async (scope: ResetScope) => {
    const expected = scope === 'final' ? 'FINAL DEVELOPMENT RESET' : 'RESET TEST DATA';
    if (confirmation !== expected) {
      setError(`Type exactly ${expected} before continuing.`);
      return;
    }

    if (
      scope === 'final' &&
      !window.confirm(
        'Final Development Reset will remove development scientific records, delete TEST researcher profiles and restore AIR/CR/MCP/RCR to a clean Under review baseline. Infrastructure verification evidence is preserved. Continue?',
      )
    ) {
      return;
    }

    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch('/api/development-reset/execute', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope, confirmation }),
      });
      const data = (await response.json().catch(() => ({}))) as ActionResponse;
      if (!response.ok) throw new Error(data.error || `Reset failed with ${response.status}.`);
      setMessage(data.message || 'Reset completed.');
      setPreview(null);
      setConfirmation('');
      await loadDoctoralReadiness();
      window.setTimeout(() => window.location.reload(), 900);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : String(resetError));
    } finally {
      setBusy(false);
    }
  };

  const activateDoctoral = async () => {
    const expected = 'ACTIVATE DOCTORAL RESEARCH MODE';
    if (confirmation !== expected) {
      setError(`Type exactly ${expected} before continuing.`);
      return;
    }
    if (
      !window.confirm(
        'Doctoral Research Mode blocks synthetic TEST generation and all application-level resets. This boundary cannot be reversed from the GSLHub interface. Activate now?',
      )
    ) {
      return;
    }

    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch('/api/development-reset/activate-doctoral', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation }),
      });
      const data = (await response.json().catch(() => ({}))) as ActionResponse;
      if (!response.ok) throw new Error(data.error || `Activation failed with ${response.status}.`);
      setMessage(data.message || 'Doctoral Research Mode activated.');
      setConfirmation('');
      await loadDoctoralReadiness();
      window.setTimeout(() => window.location.reload(), 900);
    } catch (activationError) {
      setError(
        activationError instanceof Error ? activationError.message : String(activationError),
      );
    } finally {
      setBusy(false);
    }
  };

  const doctoralMode = doctoralReadiness?.mode === 'doctoral';

  return (
    <div style={{ marginTop: '12px' }}>
      <div style={cardStyle}>
        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
          Development data controls
        </div>
        <p style={{ color: 'var(--theme-elevation-600)', margin: '0 0 14px' }}>
          Use TEST reset during development. Use Final Development Reset only once the product is
          ready to start clean doctoral data collection. Storage verification audits and their
          infrastructure artifact context are preserved.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button
            type="button"
            disabled={busy || doctoralMode}
            onClick={() => void runPreview('test')}
            style={{ ...buttonStyle, background: 'var(--theme-elevation-150)' }}
          >
            Preview TEST reset
          </button>
          <button
            type="button"
            disabled={busy || doctoralMode}
            onClick={() => void runPreview('final')}
            style={{ ...buttonStyle, background: 'var(--theme-error-500)', color: 'white' }}
          >
            Preview Final Development Reset
          </button>
        </div>

        {preview ? (
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontWeight: 600 }}>
              {preview.scope === 'final' ? 'Final reset preview' : 'TEST reset preview'}
            </div>
            <p style={{ margin: '8px 0' }}>
              Scientific records to delete: <strong>{preview.totalDeletions || 0}</strong>
              {preview.scope === 'final'
                ? ` · Metric definitions to restore: ${preview.pilotMetricDefinitionsReset || 0} · TEST researchers to remove: ${preview.testResearchers?.length || 0}`
                : ''}
            </p>
            <pre
              style={{
                background: 'var(--theme-elevation-50)',
                borderRadius: '4px',
                overflowX: 'auto',
                padding: '10px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {JSON.stringify(preview.deletions || {}, null, 2)}
            </pre>
            <p style={{ color: 'var(--theme-elevation-600)' }}>
              Preserved infrastructure context: {preview.preservedInfrastructureArtifacts || 0}{' '}
              artifact(s), {preview.preservedInfrastructureExecutions || 0} execution(s).
            </p>
            <p style={{ fontWeight: 600, marginBottom: '6px' }}>
              Type {preview.scope === 'final' ? 'FINAL DEVELOPMENT RESET' : 'RESET TEST DATA'}
            </p>
            <input
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              disabled={busy || doctoralMode}
              style={{
                border: '1px solid var(--theme-elevation-250)',
                borderRadius: '4px',
                marginRight: '10px',
                maxWidth: '420px',
                padding: '10px',
                width: '100%',
              }}
            />
            <button
              type="button"
              disabled={busy || doctoralMode}
              onClick={() => void executeReset(preview.scope || 'test')}
              style={{
                ...buttonStyle,
                background:
                  preview.scope === 'final'
                    ? 'var(--theme-error-500)'
                    : 'var(--theme-elevation-700)',
                color: 'white',
                marginTop: '10px',
              }}
            >
              {busy ? 'Working…' : preview.scope === 'final' ? 'Run Final Development Reset' : 'Reset TEST data'}
            </button>
          </div>
        ) : null}
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
          Doctoral Research Mode
        </div>
        <p style={{ color: 'var(--theme-elevation-600)', margin: '0 0 12px' }}>
          {doctoralMode
            ? 'Doctoral Research Mode is active. Synthetic generation and reset actions are disabled.'
            : doctoralReadiness?.ready
              ? 'Clean-start checks pass. Doctoral Research Mode can be activated when the real study is ready to begin.'
              : 'Activation remains blocked until the Final Development Reset leaves a clean doctoral baseline.'}
        </p>
        {doctoralReadiness?.blockers?.length ? (
          <ul>
            {doctoralReadiness.blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        ) : null}
        {!doctoralMode ? (
          <>
            <p style={{ fontWeight: 600, marginBottom: '6px' }}>
              Type ACTIVATE DOCTORAL RESEARCH MODE
            </p>
            <input
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              disabled={busy || !doctoralReadiness?.ready}
              style={{
                border: '1px solid var(--theme-elevation-250)',
                borderRadius: '4px',
                marginRight: '10px',
                maxWidth: '420px',
                padding: '10px',
                width: '100%',
              }}
            />
            <button
              type="button"
              disabled={busy || !doctoralReadiness?.ready}
              onClick={() => void activateDoctoral()}
              style={{
                ...buttonStyle,
                background: 'var(--theme-success-500)',
                color: 'white',
                marginTop: '10px',
              }}
            >
              Activate Doctoral Research Mode
            </button>
          </>
        ) : null}
      </div>

      {message ? (
        <p style={{ color: 'var(--theme-success-500)', fontWeight: 600 }}>{message}</p>
      ) : null}
      {error ? (
        <div
          role="alert"
          style={{
            background: 'var(--theme-error-100)',
            border: '1px solid var(--theme-error-400)',
            borderRadius: '4px',
            color: 'var(--theme-error-700)',
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
