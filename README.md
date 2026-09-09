# Jardin

**The art of caring for those who gave you their trust.**

*Cultivate your garden. The butterflies will come.*  
(After Voltaire: *Il faut cultiver notre jardin*)

You keep chasing new clients. Jardin helps you delight the ones you already have.

**Local app:** [http://127.0.0.1:43123](http://127.0.0.1:43123)

---

## Sales demo

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@nevermiss.app` | `nevermiss2026` |
| Sales / Pro | `demo@nevermiss.app` | `demo2026` |

On Overview, run **Sales day simulation** for the pitch (no real sends).

---

## Rename the Vercel URL (away from nevermiss)

In the Vercel dashboard (project that currently serves `nevermiss-*.vercel.app`):

1. **Settings → General → Project Name** → set to `jardin`
2. Save. Your new URL becomes `https://jardin.vercel.app` (or `jardin-xxxx.vercel.app` if taken)
3. Optional: **Settings → Domains** → add a custom domain later (`jardin.app`, etc.)
4. Old `nevermiss` URL may keep working as a redirect for a while; prefer sharing the new one in the meeting

GitHub repo can stay `nevermiss` for now; rename later under **Settings → General → Repository name** if you want.

---

## Run locally

```bash
npm install
npm run dev
```

Copy lives in `src/lib/i18n/en.ts` for future languages.
