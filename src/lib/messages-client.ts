/** Client-safe date helpers (no Node crypto) */
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export function formatFrDate(iso: string): string {
  try {
    return format(parseISO(iso), "d MMM yyyy 'à' HH:mm", { locale: fr });
  } catch {
    return iso;
  }
}
