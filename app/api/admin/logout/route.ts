import config from '@payload-config';
import { getPayload } from 'payload';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const EXPIRED_COOKIE =
  'Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax';

const isAuthCookie = (name: string) =>
  /^(payload|gslhub)-token$/i.test(name) ||
  /(?:payload|gslhub|users).*(?:token|session)|(?:token|session).*(?:payload|gslhub|users)/i.test(
    name,
  );

export async function POST(request: Request) {
  const payload = await getPayload({ config });
  const auth = await payload.auth({
    headers: request.headers,
    canSetHeaders: false,
  });

  let sessionsInvalidated = false;

  if (auth.user?.collection === 'users') {
    await payload.update({
      collection: 'users',
      id: auth.user.id,
      data: {
        sessions: [],
      },
      overrideAccess: true,
    });

    sessionsInvalidated = true;
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const cookieNames = cookieHeader
    .split(';')
    .map((cookie) => cookie.split('=', 1)[0]?.trim())
    .filter((name): name is string => Boolean(name) && isAuthCookie(name));

  const authCookieNames = new Set(['payload-token', 'gslhub-token', ...cookieNames]);
  const headers = new Headers({
    'Cache-Control': 'private, no-store, no-cache, must-revalidate',
    'Content-Type': 'application/json; charset=utf-8',
    Expires: '0',
    Pragma: 'no-cache',
  });

  for (const name of authCookieNames) {
    // Clear both host-only and domain-scoped variants. This prevents an old
    // duplicate cookie from continuing to authenticate the browser.
    headers.append('Set-Cookie', `${name}=; ${EXPIRED_COOKIE}`);
    headers.append('Set-Cookie', `${name}=; Domain=gslhub.com; ${EXPIRED_COOKIE}`);
    headers.append('Set-Cookie', `${name}=; Domain=.gslhub.com; ${EXPIRED_COOKIE}`);
  }

  return new Response(
    JSON.stringify({
      status: 'ok',
      sessionsInvalidated,
      clearedCookieNames: [...authCookieNames],
    }),
    {
      status: 200,
      headers,
    },
  );
}
