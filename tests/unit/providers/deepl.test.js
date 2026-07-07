import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { translate } from "@/lib/translation/providers/deepl";

describe("lib/translation/providers/deepl.js", () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.DEEPL_API_KEY;

  beforeEach(() => {
    global.fetch = vi.fn();
    process.env.DEEPL_API_KEY = "test-deepl-key";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.DEEPL_API_KEY = originalKey;
  });

  it("fails fast with an honest error when DEEPL_API_KEY is not configured", async () => {
    delete process.env.DEEPL_API_KEY;
    const result = await translate("Hello", "en", "fr");
    expect(result).toEqual({
      ok: false,
      reason: "provider_error",
      detail: "DEEPL_API_KEY is not configured",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("maps portuguese to the PT-PT regional code DeepL requires (not plain PT)", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ translations: [{ text: "Ola" }] }),
    });

    await translate("Hello", "en", "pt");

    const [, options] = global.fetch.mock.calls[0];
    const body = new URLSearchParams(options.body);
    expect(body.get("target_lang")).toBe("PT-PT");
    expect(body.get("source_lang")).toBe("EN");
  });

  it("sends the Authorization header in DeepL's expected format", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ translations: [{ text: "Bonjour" }] }),
    });

    await translate("Hello", "en", "fr");

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBe("DeepL-Auth-Key test-deepl-key");
  });

  it("returns ok:true with the translated text on success", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ translations: [{ text: "Bonjour" }] }),
    });

    const result = await translate("Hello", "en", "fr");
    expect(result).toEqual({ ok: true, translatedText: "Bonjour" });
  });

  it("maps HTTP 456 (DeepL's quota-exceeded status) to an honest provider_error", async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 456, text: async () => "" });
    const result = await translate("Hello", "en", "fr");
    expect(result).toEqual({
      ok: false,
      reason: "provider_error",
      detail: "DeepL monthly quota exceeded",
    });
  });

  it("returns provider_error on a non-OK HTTP response", async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 500, text: async () => "boom" });
    const result = await translate("Hello", "en", "fr");
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("provider_error");
  });

  it("returns provider_timeout when the request aborts", async () => {
    const abortError = new Error("aborted");
    abortError.name = "AbortError";
    global.fetch.mockRejectedValue(abortError);
    const result = await translate("Hello", "en", "fr");
    expect(result).toEqual({ ok: false, reason: "provider_timeout", detail: "aborted" });
  });

  it("returns empty_translation when no translation is present", async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ translations: [] }) });
    const result = await translate("Hello", "en", "fr");
    expect(result).toEqual({
      ok: false,
      reason: "empty_translation",
      detail: "Provider returned no translation",
    });
  });
});
