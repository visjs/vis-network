import { expect } from "chai";

import { normalizeLanguageCode } from "../lib/network/locale-utils.ts";
import { deepFreeze } from "./helpers/index.ts";

const noLocales = deepFreeze({});
const someLocales = deepFreeze({
  "cs-CZ": {},
  "cs-SK": {},
  cs: {},
  en: {},
});

describe("Locale utils", function () {
  it("normalizeLanguageCode", (): void => {
    expect(normalizeLanguageCode(noLocales, "en")).to.equal("en");
    expect(normalizeLanguageCode(noLocales, "en-US")).to.equal("en");
    expect(normalizeLanguageCode(noLocales, "en_US")).to.equal("en");
    expect(normalizeLanguageCode(noLocales, "sk")).to.equal("en");
    expect(normalizeLanguageCode(noLocales, "sk-SK")).to.equal("en");
    expect(normalizeLanguageCode(noLocales, "sk_SK")).to.equal("en");
    expect(normalizeLanguageCode(someLocales, " cs")).to.equal("en");
    expect(normalizeLanguageCode(someLocales, "-CZ")).to.equal("en");
    expect(normalizeLanguageCode(someLocales, "CS-CZ")).to.equal("cs-CZ");
    expect(
      normalizeLanguageCode(someLocales, "Cs_I-am_an alligator!"),
    ).to.equal("cs");
    expect(normalizeLanguageCode(someLocales, "Cs_cZ")).to.equal("cs-CZ");
    expect(normalizeLanguageCode(someLocales, "I-am_an alligator!")).to.equal(
      "en",
    );
    expect(normalizeLanguageCode(someLocales, "cs SK")).to.equal("cs-SK");
    expect(normalizeLanguageCode(someLocales, "cs")).to.equal("cs");
    expect(normalizeLanguageCode(someLocales, "cs")).to.equal("cs");
    expect(normalizeLanguageCode(someLocales, "cs-SK")).to.equal("cs-SK");
    expect(normalizeLanguageCode(someLocales, "cs-US")).to.equal("cs");
    expect(normalizeLanguageCode(someLocales, "cs-cz")).to.equal("cs-CZ");
    expect(normalizeLanguageCode(someLocales, "cs/SK")).to.equal("cs-SK");
    expect(normalizeLanguageCode(someLocales, "cs_SK")).to.equal("cs-SK");
    expect(normalizeLanguageCode(someLocales, "cs_US")).to.equal("cs");
    expect(normalizeLanguageCode(someLocales, "cs_cz")).to.equal("cs-CZ");
    expect(normalizeLanguageCode(someLocales, "en")).to.equal("en");
    expect(normalizeLanguageCode(someLocales, "en-US")).to.equal("en");
    expect(normalizeLanguageCode(someLocales, "en_US")).to.equal("en");
    expect(normalizeLanguageCode(someLocales, "sk")).to.equal("en");
    expect(normalizeLanguageCode(someLocales, "sk-SK")).to.equal("en");
    expect(normalizeLanguageCode(someLocales, "sk_SK")).to.equal("en");
  });
});
