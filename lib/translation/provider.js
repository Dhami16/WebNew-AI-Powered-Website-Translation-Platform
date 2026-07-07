import { translate as mymemory } from "./providers/mymemory";
import { translate as deepl } from "./providers/deepl";

// The seam pluggable providers plug into. Each provider module exports a
// translate(text, sourceIso, targetIso, providerConfig) with the same
// honest {ok, translatedText} / {ok:false, reason, detail} contract.
const PROVIDERS = { mymemory, deepl };

export async function translateText(text, sourceIso, targetIso, providerName = "mymemory", providerConfig = {}) {
  const provider = PROVIDERS[providerName];
  if (!provider) {
    return {
      ok: false,
      reason: "provider_error",
      detail: `Unknown translation provider: ${providerName}`,
    };
  }
  return provider(text, sourceIso, targetIso, providerConfig);
}
