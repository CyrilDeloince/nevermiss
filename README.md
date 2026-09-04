# NeverMiss

SaaS **« Ne ratez plus jamais une relation »** — vœux d’anniversaire, Noël, bonne année et félicitations LinkedIn (WhatsApp, Gmail, LinkedIn).

## Essayer en ligne (sans rien installer)

**Demo live :** [https://nevermiss-fawn.vercel.app](https://nevermiss-fawn.vercel.app)

1. Ouvre le lien  
2. **Ouvrir l’app** → crée un espace Free  
3. Ajoute un contact + anniversaire  
4. **File d’envoi** → WhatsApp / Gmail / LinkedIn en 1 clic  

Hébergé sur **Vercel** (plan Hobby) — le site reste en ligne tant que le projet Vercel existe. Tu peux ensuite brancher un **domaine custom** dans Vercel → Settings → Domains.

Repo : [github.com/CyrilDeloince/nevermiss](https://github.com/CyrilDeloince/nevermiss)

---

## Fonctionnalités

| Zone | Ce que ça fait |
|------|----------------|
| **Contacts** | Anniversaire, type ami/famille/travail, heure d’envoi |
| **File d’envoi** | Envoyer maintenant en 1 clic (WhatsApp wa.me, Gmail, LinkedIn) |
| **Séquences** | Plusieurs messages le jour J |
| **Plan & réglages** | Identité expéditeur + Free / Pro 20 € / Enterprise |
| **Recherche** | Barre en haut (⌘K) |
| **Assistant** | Chatbot qui te guide dans l’app |
| **Cron** | `GET /api/cron` — tourne même PC éteint |

### Tarifs

- **Free** — 0 € · 5 contacts · email  
- **Pro** — **20 €/mois** · 500 contacts · WhatsApp  
- **Enterprise** — sur devis · LinkedIn + équipes  

---

## Lancer en local (optionnel)

```bash
npm install
npm run build
npm start
```

Ouvre [http://127.0.0.1:43123](http://127.0.0.1:43123).

---

## Déploiement

Déjà déployé sur Vercel. Pour lier GitHub → auto-deploy à chaque push :

1. [vercel.com/new](https://vercel.com/new) → Import `CyrilDeloince/nevermiss`  
   (ou Settings → Git sur le projet existant **nevermiss**)  
2. Cron quotidien : `vercel.json` → `/api/cron` à 08:00 UTC (limite Hobby)  
3. Données démo : stockage temporaire sur Vercel — OK pour tester. Prod durable = ajouter une DB plus tard.

---

## Stack

Next.js · TypeScript · Tailwind · shadcn/ui · Vercel

## Suite monétisation

Brancher **Stripe Checkout** (20 €/mois) sur le bouton Pro dans `/app/settings`.
