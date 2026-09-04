export type HelpEntry = {
  id: string;
  title: string;
  keywords: string[];
  href: string;
  description: string;
  steps?: string[];
};

export const HELP_CATALOG: HelpEntry[] = [
  {
    id: "overview",
    title: "Vue d’ensemble",
    keywords: ["dashboard", "accueil", "résumé", "moteur", "stats"],
    href: "/app",
    description: "Tableau de bord : plan, contacts, prochains envois, lancer le moteur.",
    steps: ["Ouvrez Vue d’ensemble", "Cliquez « Lancer le moteur maintenant »"],
  },
  {
    id: "contacts",
    title: "Contacts",
    keywords: [
      "contact",
      "anniversaire",
      "guillaume",
      "ami",
      "famille",
      "travail",
      "téléphone",
      "ajouter",
    ],
    href: "/app/contacts",
    description:
      "Ajoutez des personnes avec anniversaire, type de relation et heure d’envoi.",
    steps: [
      "Allez dans Contacts",
      "Remplissez nom, WhatsApp du destinataire, anniversaire",
      "Choisissez ami / famille / travail + heure",
    ],
  },
  {
    id: "templates",
    title: "Modèles de messages",
    keywords: ["modèle", "template", "texte", "message", "anniv", "noël"],
    href: "/app/templates",
    description: "Textes réutilisables avec {{prenom}}, {{signature}}, etc.",
  },
  {
    id: "sequences",
    title: "Séquences",
    keywords: ["séquence", "automatique", "j0", "multi", "étapes"],
    href: "/app/sequences",
    description: "Enchaînez WhatsApp + Gmail + LinkedIn le jour J.",
  },
  {
    id: "messages",
    title: "File d’envoi",
    keywords: [
      "envoyer",
      "whatsapp",
      "gmail",
      "linkedin",
      "file",
      "prêt",
      "maintenant",
      "wa.me",
    ],
    href: "/app/messages",
    description:
      "Programmez ou envoyez maintenant : 1 clic ouvre WhatsApp / Gmail / LinkedIn.",
    steps: [
      "Allez dans File d’envoi",
      "Section « Envoyer maintenant »",
      "Cliquez WhatsApp, Gmail ou LinkedIn",
      "Validez Envoyer dans l’app ouverte",
    ],
  },
  {
    id: "channels",
    title: "Canaux",
    keywords: ["canal", "smtp", "api", "wa.me", "email", "config"],
    href: "/app/channels",
    description: "Configurez Email (Gmail), WhatsApp wa.me / Business API, LinkedIn.",
  },
  {
    id: "settings",
    title: "Plan & réglages",
    keywords: [
      "plan",
      "pro",
      "free",
      "identité",
      "horaire",
      "profil",
      "mon numéro",
      "tarif",
    ],
    href: "/app/settings",
    description:
      "Votre WhatsApp / email / LinkedIn + horaires ami/famille/travail + plans.",
    steps: [
      "Allez dans Plan & réglages",
      "Remplissez votre identité (expéditeur)",
      "Réglez les heures par type de relation",
      "Choisissez Free / Pro / Enterprise",
    ],
  },
  {
    id: "pricing",
    title: "Tarifs Free / Pro / Enterprise",
    keywords: ["prix", "20", "euros", "abonnement", "cash"],
    href: "/#tarifs",
    description: "Free 0 € · Pro 20 €/mois · Enterprise sur devis.",
  },
  {
    id: "cron",
    title: "PC éteint / cron cloud",
    keywords: ["cron", "éteint", "cloud", "automatique", "horaire"],
    href: "/app",
    description: "Appelez GET /api/cron toutes les heures pour envoyer sans PC allumé.",
  },
  {
    id: "deploy",
    title: "Déployer en ligne",
    keywords: ["deploy", "vercel", "github", "ligne", "online", "héberger"],
    href: "/#tarifs",
    description:
      "Poussez sur GitHub puis déployez sur Vercel (recommandé). GitHub Pages ne gère pas les API Next.js.",
  },
];

export function searchHelp(query: string, limit = 8): HelpEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return HELP_CATALOG.slice(0, limit);
  const scored = HELP_CATALOG.map((entry) => {
    const hay = [
      entry.title,
      entry.description,
      ...entry.keywords,
      ...(entry.steps ?? []),
    ]
      .join(" ")
      .toLowerCase();
    let score = 0;
    for (const token of q.split(/\s+/)) {
      if (!token) continue;
      if (entry.title.toLowerCase().includes(token)) score += 5;
      if (entry.keywords.some((k) => k.includes(token) || token.includes(k)))
        score += 3;
      if (hay.includes(token)) score += 1;
    }
    return { entry, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.entry);
}

export type ChatReply = {
  answer: string;
  links: { label: string; href: string }[];
};

export function answerHelpQuestion(question: string): ChatReply {
  const q = question.trim().toLowerCase();
  const matches = searchHelp(q, 3);

  if (!q) {
    return {
      answer:
        "Dis-moi ce que tu veux faire : envoyer un anniversaire WhatsApp, ajouter un contact, changer ton plan, déployer en ligne…",
      links: [
        { label: "File d’envoi", href: "/app/messages" },
        { label: "Contacts", href: "/app/contacts" },
        { label: "Plan & réglages", href: "/app/settings" },
      ],
    };
  }

  if (
    q.includes("whatsapp") ||
    q.includes("anniv") ||
    q.includes("envoyer") ||
    q.includes("souhait")
  ) {
    return {
      answer:
        "Pour envoyer un vœu WhatsApp maintenant : File d’envoi → « Envoyer maintenant » → bouton WhatsApp. NeverMiss ouvre wa.me avec le texte ; tu appuies sur Envoyer. Vérifie que le contact a bien SON numéro (pas le tien).",
      links: [
        { label: "Ouvrir File d’envoi", href: "/app/messages" },
        { label: "Vérifier le contact", href: "/app/contacts" },
        { label: "Mon identité WhatsApp", href: "/app/settings" },
      ],
    };
  }

  if (q.includes("gmail") || q.includes("email") || q.includes("mail")) {
    return {
      answer:
        "Pour Gmail : File d’envoi → Envoyer maintenant → Gmail. Ça ouvre une composition Gmail préremplie. Ou configure SMTP dans Canaux pour l’envoi 100 % auto.",
      links: [
        { label: "File d’envoi", href: "/app/messages" },
        { label: "Canaux Email", href: "/app/channels" },
      ],
    };
  }

  if (q.includes("linkedin")) {
    return {
      answer:
        "LinkedIn : File d’envoi → LinkedIn ouvre le profil du contact. Colle le message (l’API LinkedIn est fermée). Active Enterprise / brouillons dans Canaux.",
      links: [
        { label: "File d’envoi", href: "/app/messages" },
        { label: "Canaux LinkedIn", href: "/app/channels" },
      ],
    };
  }

  if (
    q.includes("heure") ||
    q.includes("horaire") ||
    q.includes("ami") ||
    q.includes("famille") ||
    q.includes("travail")
  ) {
    return {
      answer:
        "Les horaires par défaut : ami 10:30, famille 09:00, travail 08:45. Change-les dans Plan & réglages, ou mets une heure perso sur chaque contact.",
      links: [
        { label: "Plan & réglages", href: "/app/settings" },
        { label: "Contacts", href: "/app/contacts" },
      ],
    };
  }

  if (
    q.includes("deploy") ||
    q.includes("github") ||
    q.includes("vercel") ||
    q.includes("ligne") ||
    q.includes("héberg") ||
    q.includes("heberg")
  ) {
    return {
      answer:
        "Pour mettre NeverMiss en ligne : 1) repo GitHub 2) importe sur Vercel (gratuit, 1 clic). GitHub Pages ne convient pas (pas d’API Next.js). Puis branche un cron sur /api/cron.",
      links: [
        { label: "Tarifs / produit", href: "/#tarifs" },
        { label: "Réglages", href: "/app/settings" },
      ],
    };
  }

  if (q.includes("plan") || q.includes("pro") || q.includes("20") || q.includes("prix")) {
    return {
      answer:
        "Free = 5 contacts famille. Pro = 20 €/mois, 500 contacts + WhatsApp. Enterprise = LinkedIn + équipes. Change le plan dans Plan & réglages.",
      links: [
        { label: "Plan & réglages", href: "/app/settings" },
        { label: "Voir les tarifs", href: "/#tarifs" },
      ],
    };
  }

  if (matches.length === 0) {
    return {
      answer:
        "Je n’ai pas trouvé ça. Essaie : « envoyer WhatsApp », « ajouter contact », « changer horaires », « déployer ». Ou utilise la barre de recherche.",
      links: [
        { label: "Vue d’ensemble", href: "/app" },
        { label: "File d’envoi", href: "/app/messages" },
      ],
    };
  }

  const top = matches[0];
  return {
    answer: `${top.description}${
      top.steps ? `\n\nÉtapes :\n• ${top.steps.join("\n• ")}` : ""
    }`,
    links: matches.map((m) => ({ label: m.title, href: m.href })),
  };
}
