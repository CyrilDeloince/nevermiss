# NeverMiss

SaaS **« Ne ratez plus jamais une relation »** — vœux d’anniversaire, Noël, bonne année et félicitations LinkedIn.

**App locale :** [http://127.0.0.1:43123](http://127.0.0.1:43123)

---

## Fonctionnalités

| Zone | Ce que ça fait |
|------|----------------|
| **Contacts** | Anniversaire, type ami/famille/travail, heure d’envoi, WhatsApp / email / LinkedIn |
| **File d’envoi** | Envoyer maintenant en 1 clic (WhatsApp wa.me, Gmail, LinkedIn) |
| **Séquences** | Plusieurs messages le jour J |
| **Plan & réglages** | Ton identité (ton 06, ton mail, ton LinkedIn) + Free / Pro 20 € / Enterprise |
| **Recherche** | Barre en haut de l’app (⌘K) — contacts, modèles, pages |
| **Assistant IA** | Chatbot en bas à droite qui te dit *où cliquer* |
| **Cron** | `GET /api/cron` → tourne PC éteint |

### Tarifs

- **Free** — 0 € · 5 contacts · email
- **Pro** — **20 €/mois** · 500 contacts · WhatsApp
- **Enterprise** — sur devis · LinkedIn + équipes

---

## Lancer en local

```bash
npm install
npm run build
npm start
```

Ouvre [http://127.0.0.1:43123](http://127.0.0.1:43123).

1. **Ouvrir l’app** → créer un espace  
2. **Plan & réglages** → ton WhatsApp / email  
3. **Contacts** → ajouter quelqu’un + anniversaire  
4. **File d’envoi** → WhatsApp / Gmail / LinkedIn  

---

## Mettre en ligne (GitHub → Vercel)

> **GitHub Pages ne suffit pas** : NeverMiss a des API Next.js et un cron.  
> Utilise **Vercel** (gratuit) branché sur ton repo GitHub — c’est le déploiement officiel Next.js.

### 1. Repo GitHub

Si le projet n’a pas encore de repo GitHub public/privé :

1. Dans Cursor, clique **Create repo** (ou crée un repo vide sur github.com)  
2. Pousse le code :

```bash
git remote add github https://github.com/TON_USER/nevermiss.git
git push -u github main
```

### 2. Déployer sur Vercel (1 clic)

1. Va sur [vercel.com/new](https://vercel.com/new)  
2. **Import** ton repo GitHub `nevermiss`  
3. Framework : Next.js (détecté auto) → **Deploy**  
4. Tu obtiens une URL du type `https://nevermiss-xxx.vercel.app`

### 3. Cron PC éteint

Sur Vercel, `vercel.json` lance déjà `/api/cron` **toutes les heures**.  
Optionnel : définis le secret `CRON_SECRET` dans Vercel → Settings → Environment Variables.

Ou [cron-job.org](https://cron-job.org) :

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://TON-URL.vercel.app/api/cron
```

### 4. Données

En local : fichier `data/store.json`.  
Sur Vercel : stockage temporaire (`/tmp`) — OK pour démo. Pour de la prod durable, ajoute ensuite une base (Turso / Postgres).

---

## Stack

Next.js 16 · TypeScript · Tailwind · shadcn/ui · nodemailer · cron Vercel

## Monétisation

Brancher **Stripe Checkout** (20 €/mois) sur le bouton Pro dans `/app/settings`.
