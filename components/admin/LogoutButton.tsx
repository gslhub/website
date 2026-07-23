'use client';

import { useAuth } from '@payloadcms/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
  const { logOut } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logOut();
      router.replace('/admin/login');
      router.refresh();
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
