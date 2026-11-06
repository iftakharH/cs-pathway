# OAuth setup (deferred)

Email and password accounts are live. Google and GitHub are wired in
`server/auth.ts` but intentionally disabled until their credentials exist.
This is the checklist to enable them later.

## 1. Create the provider apps

Google (Google Cloud Console → APIs & Services → Credentials → OAuth client ID,
Web application):

- Authorised redirect URI: `https://cs-pathway.vercel.app/api/auth/callback/google`
- Authorised redirect URI: `http://localhost:5173/api/auth/callback/google`

GitHub (Settings → Developer settings → OAuth Apps → New OAuth App):

- Homepage URL: `https://cs-pathway.vercel.app`
- Authorisation callback URL: `https://cs-pathway.vercel.app/api/auth/callback/github`
- Add `http://localhost:5173/api/auth/callback/github` as a second callback only if the
  provider UI allows it; otherwise create a separate development OAuth app.

## 2. Set the four values

Local `.env.local`:

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

Vercel, for production, preview and development:

```bash
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add GITHUB_CLIENT_ID production
vercel env add GITHUB_CLIENT_SECRET production
```

Repeat for `preview` and `development`. Values are secret; never commit them.

## 3. Verify

1. `npm run dev` and open `http://localhost:5173/signin`.
2. Confirm `/api/config` returns `{"google":true,"github":true}`.
3. Sign in with each provider; confirm `/account` lists the provider and a session.
4. Sign out, sign in again, and delete the account.
5. Confirm a preview deployment returns the provider buttons and redirects to the
   preview callback URL, not production.

## Current state

- `/api/config` on the deployed preview returns `{"google":false,"github":false}`.
- The buttons are hidden and the UI states that OAuth is not configured.
- No provider login has been executed. This remains **UNVERIFIED** until the steps
  above are completed.
