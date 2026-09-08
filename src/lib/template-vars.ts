/** Variables de message — l’utilisateur clique des pastilles, jamais de {{}} à taper */

export const TEMPLATE_VARS = [
  { key: "prenom", label: "Prénom" },
  { key: "nom", label: "Nom complet" },
  { key: "entreprise", label: "Entreprise" },
  { key: "signature", label: "Votre signature" },
  { key: "annee", label: "Année" },
] as const;

export type TemplateVarKey = (typeof TEMPLATE_VARS)[number]["key"];

/** Stockage interne : {{prenom}} — jamais montré brut dans l’UI */
export function tokenFor(key: string): string {
  return `{{${key}}}`;
}

export function renderTemplate(
  text: string,
  vars: Record<string, string>
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

/** Affiche un aperçu lisible sans accolades */
export function previewTemplate(
  text: string,
  sample: Record<string, string> = {
    prenom: "Sophie",
    nom: "Sophie Dupont",
    entreprise: "Acme",
    signature: "Alex",
    annee: String(new Date().getFullYear()),
  }
): string {
  return renderTemplate(text, sample);
}

/** Convertit le corps en segments pour un rendu chips */
export function parseTemplateBody(
  text: string
): Array<{ type: "text" | "var"; value: string }> {
  const parts: Array<{ type: "text" | "var"; value: string }> = [];
  const re = /\{\{(\w+)\}\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) {
      parts.push({ type: "text", value: text.slice(last, m.index) });
    }
    parts.push({ type: "var", value: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  return parts;
}

export function labelForVar(key: string): string {
  return TEMPLATE_VARS.find((v) => v.key === key)?.label ?? key;
}
