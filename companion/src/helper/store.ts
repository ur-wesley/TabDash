import { persistentAtom } from "@nanostores/persistent";
import type { AvailableLanguages } from "../lang.js";

export const language = persistentAtom<AvailableLanguages>("language", "en");
