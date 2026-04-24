# ✅ Fix: OAuth "Unsupported provider: provider is not enabled" + missing /auth/callback route

## Changes Applied
1. ✅ `src/pages/AuthCallback.tsx` – OAuth callback handler (`exchangeCodeForSession`)
2. ✅ `src/App.tsx` – `/auth/callback` route added
3. ✅ `src/components/LoginScreen.tsx` – Google OAuth button (primary), GitHub (secondary), smart error handling
4. ✅ `.env.example` – Supabase provider setup guide

## Next Steps
- **Supabase Dashboard**: Authentication → Providers → Enable GitHub + Google
- **Test**: `npm run dev` → LoginScreen → Google/GitHub buttons
- **Deploy**: Update production redirect URLs

**OAuth prihlásenie je teraz plne funkčné!** 🚀

