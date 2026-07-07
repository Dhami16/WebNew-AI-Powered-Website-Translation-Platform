// DeepL (https://www.deepl.com/pro-api) free tier -- 500,000 characters/month,
// no credit card required for the free API. Requires DEEPL_API_KEY (one
// global, owner-configured credential shared across every site that opts
// into this provider -- same pattern as MYMEMORY_EMAIL, not a per-tenant key).
//
// DeepL's target_lang codes diverge from plain ISO 639-1 (uppercase, and
// Portuguese needs a regional variant) -- this map is DeepL-specific and
// deliberately kept out of the shared lib/translation/languages.js.
const DEEPL_TARGET_LANG = {
  fr: "FR",
  es: "ES",
  de: "DE",
  it: "IT",
  pt: "PT-PT",
  nl: "NL",
  ru: "RU",
  zh: "ZH",
  ja: "JA",
  ko: "KO",
};

export async function translate(text, sourceIso, targetIso, providerConfig = {}) {
  const timeoutMs = providerConfig.timeoutMs || 10000;
  const apiKey = providerConfig.apiKey || process.env.DEEPL_API_KEY;

  if (!apiKey) {
    return { ok: false, reason: "provider_error", detail: "DEEPL_API_KEY is not configured" };
  }

  const targetLang = DEEPL_TARGET_LANG[targetIso.toLowerCase()] || targetIso.toUpperCase();
  const sourceLang = sourceIso.toUpperCase();

  let response;
  try {
    response = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ text, source_lang: sourceLang, target_lang: targetLang }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    if (err.name === "AbortError" || err.name === "TimeoutError") {
      return { ok: false, reason: "provider_timeout", detail: err.message };
    }
    return { ok: false, reason: "provider_error", detail: err.message };
  }

  // DeepL's own "quota exceeded" status -- distinct from a generic HTTP error
  // so it reads the same way MyMemory's embedded quotaFinished flag does.
  if (response.status === 456) {
    return { ok: false, reason: "provider_error", detail: "DeepL monthly quota exceeded" };
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return { ok: false, reason: "provider_error", detail: `HTTP ${response.status}: ${detail}` };
  }

  const data = await response.json().catch(() => null);
  const translatedText = data && data.translations && data.translations[0] && data.translations[0].text;

  if (!translatedText) {
    return { ok: false, reason: "empty_translation", detail: "Provider returned no translation" };
  }

  return { ok: true, translatedText };
}
