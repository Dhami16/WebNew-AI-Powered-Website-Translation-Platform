import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/translation/providers/mymemory", () => ({ translate: vi.fn() }));
vi.mock("@/lib/translation/providers/deepl", () => ({ translate: vi.fn() }));

import { translate as mymemory } from "@/lib/translation/providers/mymemory";
import { translate as deepl } from "@/lib/translation/providers/deepl";
import { translateText } from "@/lib/translation/provider";

describe("lib/translation/provider.js dispatcher", () => {
  beforeEach(() => {
    mymemory.mockReset();
    deepl.mockReset();
  });

  it("defaults to mymemory when no provider name is given (backward compatible)", async () => {
    mymemory.mockResolvedValue({ ok: true, translatedText: "Bonjour" });
    const result = await translateText("Hello", "en", "fr");
    expect(mymemory).toHaveBeenCalledWith("Hello", "en", "fr", {});
    expect(deepl).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: true, translatedText: "Bonjour" });
  });

  it("routes to deepl when providerName is 'deepl'", async () => {
    deepl.mockResolvedValue({ ok: true, translatedText: "Bonjour" });
    await translateText("Hello", "en", "fr", "deepl");
    expect(deepl).toHaveBeenCalledWith("Hello", "en", "fr", {});
    expect(mymemory).not.toHaveBeenCalled();
  });

  it("returns an explicit error for an unknown provider name instead of silently falling back", async () => {
    const result = await translateText("Hello", "en", "fr", "some-made-up-provider");
    expect(result).toEqual({
      ok: false,
      reason: "provider_error",
      detail: "Unknown translation provider: some-made-up-provider",
    });
    expect(mymemory).not.toHaveBeenCalled();
    expect(deepl).not.toHaveBeenCalled();
  });
});
