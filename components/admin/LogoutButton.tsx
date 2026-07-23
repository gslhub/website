'use client';

import { useState } from 'react';

import { logoutAction } from './logoutAction';

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logoutAction();

      window.location.assign(`/admin/login?loggedOut=${Date.now()}`);
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
