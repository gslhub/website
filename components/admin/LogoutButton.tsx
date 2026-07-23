'use client';

import { useState } from 'react';

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const response = await fetch('/api/users/logout?allSessions=true', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Logout failed with status ${response.status}`);
      }

      window.location.replace('/admin/login');
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
