import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const cookieStore = await cookies();
  const authCookies = cookieStore
    .getAll()
    .filter(({ name }) => /payload|users|token|session/i.test(name));

  for (const { name } of authCookies) {
    cookieStore.set(name, '', {
      path: '/',
      expires: new Date(0),
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
    });
  }

  return Response.json(
    { status: 'ok', clearedCookies: authCookies.map(({ name }) => name) },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    },
  );
}
