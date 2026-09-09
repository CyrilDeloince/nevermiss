# Tend

**The art of caring for those who gave you their trust.**

You keep chasing new clients. Tend helps you delight the ones you already have. Cultivate your garden. The butterflies will come.

Prototype for relationship nurture: birthdays, holidays, warm follow ups across Email, WhatsApp, Discord and LinkedIn.

**Local app:** [http://127.0.0.1:43123](http://127.0.0.1:43123)

---

## Sales demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@nevermiss.app` | `nevermiss2026` |
| Sales / Pro | `demo@nevermiss.app` | `demo2026` |

Open the demo, then run the **Sales day simulation** on the overview to walk a prospect through day J (no real sends).

Switch Free / Pro / Enterprise anytime under Plan & settings.

---

## What ships

- Isolated accounts, httpOnly sessions, hashed passwords
- Each user only sees their own contacts
- Channel tokens live on the profile, never sold
- Admin sees usage totals, not private message text
- Email SMTP can send for real when configured
- WhatsApp via Meta Cloud API when configured; LinkedIn stays draft only
- Copy lives in `src/lib/i18n/en.ts` so more languages can plug in later

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).
