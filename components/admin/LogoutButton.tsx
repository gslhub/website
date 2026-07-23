'use client';

import { useAuth } from '@payloadcms/ui';
import { useState } from 'react';

export default function LogoutButton() {
  const { logOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logOut();

      const verification = await fetch(`/api/users/me?logoutCheck=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await verification.json();

      if (data?.user) {
        const fallback = await fetch('/api/users/logout?allSessions=true', {
          method: 'POST',
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!fallback.ok) {
          throw new Error(`Logout fallback failed with status ${fallback.status}`);
        }
      }

      window.location.replace(`/admin/login?loggedOut=${Date.now()}`);
    } catch (error) {
      console.error('[admin-logout]', error);
      setIsLoggingOut(false);
      window.alert('No se pudo cerrar la sesión. Inténtalo de nuevo.');
    }
  };

  return (
    <button
      type="button"
      className="gslhub-admin-logout"
      onClick={handleLogout}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
    </button>
  );
}
