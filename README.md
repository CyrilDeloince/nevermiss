# NeverMiss

> Ne ratez plus jamais une relation.

Vœux d’anniversaire, Noël, bonne année et félicitations LinkedIn — programmés à l’avance, envoyés en 1 clic sur **WhatsApp**, **Gmail** et **LinkedIn**.

---

## Demo live

### [Ouvrir NeverMiss →](https://nevermiss-fawn.vercel.app)

Pas besoin d’installer quoi que ce soit. Clique, crée un espace Free, teste.

| | |
|---|---|
| **App** | [nevermiss-fawn.vercel.app](https://nevermiss-fawn.vercel.app) |
| **Repo** | [CyrilDeloince/nevermiss](https://github.com/CyrilDeloince/nevermiss) |
| **Hébergeur** | Vercel (Hobby) |

**En 1 minute :**
1. Ouvre la demo  
2. **Ouvrir l’app** → crée ton espace  
3. Ajoute un contact + date d’anniversaire  
4. **File d’envoi** → bouton WhatsApp / Gmail / LinkedIn  

---

## Pourquoi NeverMiss ?

- Rester top-of-mind sans y penser (clients, famille, réseau)
- Multi-canal sans payer WhatsApp Business API ni laisser n8n allumé
- Tourne sur le cloud : même PC éteint (cron Vercel)

### Tarifs

| Plan | Prix | Pour qui |
|------|------|----------|
| **Free** | 0 € | Tester (5 contacts, email) |
| **Pro** | **20 €/mois** | Commercial solo + WhatsApp |
| **Enterprise** | Sur devis | Équipes + LinkedIn |

---

## Fonctionnalités

| Zone | Description |
|------|-------------|
| **Contacts** | Anniversaire, relation ami / famille / travail, heure d’envoi |
| **File d’envoi** | Envoi immédiat en 1 clic (wa.me, Gmail compose, LinkedIn) |
| **Séquences** | Plusieurs messages le jour J |
| **Plan & réglages** | Ton identité (WhatsApp, email, LinkedIn) + offres |
| **Recherche** | Barre globale (⌘K) |
| **Assistant** | Chatbot qui te guide dans l’app |

---

## Lancer en local *(optionnel)*

La demo Vercel suffit pour tester. En local :

```bash
npm install
npm run build
npm start
```

→ [http://127.0.0.1:43123](http://127.0.0.1:43123)

---

## Déploiement

Déjà en prod sur Vercel. Pour l’auto-deploy à chaque `git push` :

1. Vercel → projet **nevermiss** → **Settings → Git**
2. Connecte ce repo `CyrilDeloince/nevermiss`

Cron : `GET /api/cron` tous les jours à 08:00 UTC (`vercel.json`).

> Données : démo en mémoire temporaire sur Vercel. Pour une vraie prod multi-users, brancher une base (Turso / Postgres) ensuite.

---

## Stack

Next.js · TypeScript · Tailwind · shadcn/ui · Vercel

## Suite

Brancher **Stripe Checkout** (20 €/mois) sur le plan Pro dans `/app/settings`.
