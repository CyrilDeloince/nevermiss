/** English copy (default). Swap this module later for FR / other locales. */
export const en = {
  brand: {
    name: "Tend",
    tagline: "The art of caring for those who gave you their trust",
    promise:
      "You want more new clients. Start by delighting the ones you already have. Cultivate your garden. The butterflies will come.",
  },
  nav: {
    how: "How it works",
    pricing: "Pricing",
    privacy: "Your data",
    login: "Log in",
    try: "Try the demo",
    pricingCta: "See pricing",
  },
  heroSupport:
    "You keep chasing new clients. Tend helps you delight the ones you already have. Cultivate your garden. The butterflies will come.",
  howTitle: "Three quiet steps",
  howSupport: "Connect once. Choose who matters. Tend remembers the rest.",
  steps: [
    {
      n: "1",
      t: "Connect your channels",
      d: "Gmail, WhatsApp Business, Discord, LinkedIn drafts. One calm place to care for people.",
    },
    {
      n: "2",
      t: "Choose who to nurture",
      d: "Birthdays, holidays, warm follow ups. You pick the people. Tend handles the timing.",
    },
    {
      n: "3",
      t: "Stay present without the scramble",
      d: "Messages leave in the background on the day that matters. You stay focused on the work in front of you.",
    },
  ],
  pricingTitle: "Simple plans",
  pricingSupport: "Switch plans anytime in the demo. See what fits your team.",
  plans: [
    {
      name: "Free",
      price: "€0",
      desc: "Try Tend on a handful of relationships.",
      highlight: false,
    },
    {
      name: "Pro",
      price: "€20 / month",
      desc: "For sales who want warm follow through at scale.",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "Teams, admin view, higher volume.",
      highlight: false,
    },
  ],
  privacyTitle: "Your garden stays yours",
  privacyBody:
    "Each account only sees its own contacts. Passwords are hashed. Sessions stay in secure cookies. Channel tokens live on your profile, never sold. Admins see usage totals, not private message text.",
  footer: "Tend · care for the people who already trust you",
  login: {
    title: "Welcome back",
    signupTitle: "Create your space",
    subtitle: "Your contacts stay with your account. Come back anytime.",
    signupSubtitle: "Isolated account. Only you see your garden.",
    email: "Email",
    password: "Password",
    name: "Name",
    submit: "Log in",
    create: "Create account",
    demo: "Open sales demo",
    switchSignup: "New here?",
    switchLogin: "Already have an account?",
  },
  app: {
    overview: "Overview",
    contacts: "Contacts",
    templates: "Templates",
    sequences: "Sequences",
    messages: "Send queue",
    channels: "Channels",
    settings: "Plan & settings",
    logout: "Log out",
    greeting: "Hello",
    schedule: "Schedule & send",
    upcoming: "Upcoming sends",
    activity: "Activity",
    seeAll: "See all",
    loading: "Loading…",
    privacyNote:
      "Each account only sees its own contacts. Channel tokens stay on your profile. Admins see usage totals, not your private messages.",
  },
  demo: {
    title: "Sales day simulation",
    support:
      "Show a prospect what day J looks like across Email, WhatsApp, Discord and LinkedIn. No real sends. Pure story.",
    run: "Run birthday simulation",
    running: "Sending across channels…",
    done: "Simulation complete",
    reset: "Run again",
  },
} as const;

/** Alias kept for older imports during the rebrand. */
export const copy = {
  brand: en.brand.name,
  tagline: en.brand.tagline,
  heroSupport: en.heroSupport,
  nav: en.nav,
  howTitle: en.howTitle,
  howSupport: en.howSupport,
  steps: en.steps,
  pricingTitle: en.pricingTitle,
  pricingSupport: en.pricingSupport,
  plans: en.plans,
  privacyTitle: en.privacyTitle,
  privacyBody: en.privacyBody,
  footer: en.footer,
  login: en.login,
  demo: en.demo,
};

export type Locale = "en";
export const defaultLocale: Locale = "en";
