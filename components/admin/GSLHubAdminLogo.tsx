import { GSLHubLogo } from '../brand/GSLHubLogo';

export default function GSLHubAdminLogo() {
  return (
    <div
      style={{
        color: 'var(--theme-text)',
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <GSLHubLogo className="gslhub-admin-brand-logo" />
    </div>
  );
}
