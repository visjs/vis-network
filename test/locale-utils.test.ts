import { test, given } from "sazerac";
import { deepFreeze } from "./helpers";

import { normalizeLanguageCode } from "../lib/network/locale-utils";

const noLocales = deepFreeze({});
const someLocales = deepFreeze({
  "cs-CZ": {},
  "cs-SK": {},
  cs: {},
  en: {},
});

describe("Locale utils", function () {
  test(normalizeLanguageCode, (): void => {
    given(noLocales, "en").expect("en");
    given(noLocales, "en-US").expect("en");
    given(noLocales, "en_US").expect("en");
    given(noLocales, "sk").expect("en");
    given(noLocales, "sk-SK").expect("en");
    given(noLocales, "sk_SK").expect("en");
    given(someLocales, " cs").expect("en");
    given(someLocales, "-CZ").expect("en");
    given(someLocales, "CS-CZ").expect("cs-CZ");
    given(someLocales, "Cs_I-am_an alligator!").expect("cs");
    given(someLocales, "Cs_cZ").expect("cs-CZ");
    given(someLocales, "I-am_an alligator!").expect("en");
    given(someLocales, "cs SK").expect("cs-SK");
    given(someLocales, "cs").expect("cs");
    given(someLocales, "cs").expect("cs");
    given(someLocales, "cs-SK").expect("cs-SK");
    given(someLocales, "cs-US").expect("cs");
    given(someLocales, "cs-cz").expect("cs-CZ");
    given(someLocales, "cs/SK").expect("cs-SK");
    given(someLocales, "cs_SK").expect("cs-SK");
    given(someLocales, "cs_US").expect("cs");
    given(someLocales, "cs_cz").expect("cs-CZ");
    given(someLocales, "en").expect("en");
    given(someLocales, "en-US").expect("en");
    given(someLocales, "en_US").expect("en");
    given(someLocales, "sk").expect("en");
    given(someLocales, "sk-SK").expect("en");
    given(someLocales, "sk_SK").expect("en");
  });
});
