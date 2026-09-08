# NeverMiss

SaaS **« Ne ratez plus jamais une relation »** — comptes isolés, base SQL, vœux programmés en arrière-plan.

**App locale :** [http://127.0.0.1:43123](http://127.0.0.1:43123)

---

## Comptes démo (sales)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin (tout voir) | `admin@nevermiss.app` | `nevermiss2026` |
| Sales / Pro | `demo@nevermiss.app` | `demo2026` |

Depuis **Plan & réglages**, basculez Free / Pro / Enterprise pour la démo.

---

## Ce qui est livré

- **Auth multi-comptes** — inscription / connexion, session cookie httpOnly, données par utilisateur
- **SQL (SQLite / Turso)** — contacts, modèles, séquences, file d’envoi, activité
- **Admin** — `/app/admin` : comptes, nb contacts, messages envoyés
- **Envoi background** — email SMTP silencieux ; WhatsApp via **Cloud API Meta** (sans ouvrir l’app)
- **Modèles** — pastilles Prénom / Nom / Signature (plus de `{{}}` à taper)
- **Cron** — `GET /api/cron` même PC éteint
- **UI** — simple, ink + accent corail (plus de vert menthe)

### Limite honnête WhatsApp

Meta **interdit** l’envoi WhatsApp silencieux sans Business / Cloud API. Sans token Meta dans **Canaux**, WhatsApp ne part pas en silence (c’est voulu).

---

## Lancer en local

```bash
npm install
npm run dev
```

Ouvre [http://127.0.0.1:43123](http://127.0.0.1:43123) → **Se connecter**.

Base locale : fichier `data/nevermiss.db`.

---

## Production (Vercel + Turso)

Sur Vercel le disque n’est pas persistant. Ajoutez :

```
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
CRON_SECRET=...
```

Puis branchez le repo sur Vercel. Cron quotidien : `vercel.json` → `/api/cron`.

---

## Tarifs

- **Free** — 0 € · 5 contacts · email  
- **Pro** — 20 €/mois · 500 contacts · WhatsApp API  
- **Enterprise** — sur devis · LinkedIn drafts + admin  
