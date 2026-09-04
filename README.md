# NeverMiss

SaaS **« Ne ratez plus jamais une relation »** — vœux d’anniversaire, Noël, bonne année et félicitations LinkedIn, programmés à l’avance et envoyés automatiquement.

## Pourquoi ce produit

Vertical claire : **commerciaux / freelances / TPE** qui veulent rester top-of-mind sans y penser.

| Plan | Prix | Pour qui |
|------|------|----------|
| **Free** | 0 € | Tester sur la famille (5 contacts, email) |
| **Pro** | 20 €/mois | Un commercial (500 contacts, séquences, WhatsApp) |
| **Enterprise** | Sur devis | Équipes sales + LinkedIn |

## Ce qui marche aujourd’hui

- **Email** : mode démo (journal) ou **SMTP réel** (Gmail App Password, Brevo, Resend…)
- **WhatsApp** : liens `wa.me` prêts (sans API Meta payante) + option Business API
- **LinkedIn** : brouillons de messages (l’API messaging est fermée — honnête et vendable)
- **Séquences multi-messages** : J-1, J0, J+1, Noël, bonne année…
- **Cron cloud** : `GET /api/cron` → tourne même PC éteint

## Lancer en local

```bash
npm install
npm run build
npm start
```

Ouvrir [http://127.0.0.1:43123](http://127.0.0.1:43123).

Dev hot-reload : `npm run dev` (port 43123).

1. Landing → **Ouvrir l’app**
2. Créer un espace Free
3. Ajouter un contact + anniversaire
4. **Lancer le moteur** / File d’envoi → Programmer + Traiter

## PC éteint

Déployez (Railway, Fly.io, VPS…) puis planifiez un cron horaire :

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://votre-domaine/api/cron
```

Ou utilisez [cron-job.org](https://cron-job.org) gratuitement.

## Stack

Next.js · TypeScript · Tailwind · shadcn/ui · stockage JSON local (`data/store.json`)

## Monétisation suivante

Brancher **Stripe Checkout** (20 €/mois) sur le bouton Pro dans `/app/settings`. Les limites Free/Pro/Enterprise sont déjà appliquées côté API.
