'use client';

import { useState } from 'react';

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Logout failed with status ${response.status}`);
      }

      const verification = await fetch(`/api/users/me?logoutCheck=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await verification.json();

      if (data?.user) {
        throw new Error('Session is still active after logout cleanup');
      }

      window.location.replace(`/admin/login?loggedOut=${Date.now()}`);
    } catch (error) {
      console.error('[admin-logout]', error);
      setIsLoggingOut(false);
      window.alert('No se pudo cerrar la sesión completamente. Revisa la consola del navegador.');
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
