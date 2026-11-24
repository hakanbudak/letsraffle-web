import { beforeEach, describe, expect, it } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import LanguageSwitcher from "./LanguageSwitcher.vue";
import { router } from "@/router";
import { i18n, getLocale, setLocale } from "@/i18n";
import { installLocaleGuard } from "@/i18n/localeGuard";

installLocaleGuard(router);

const pick = async (code: string) => {
  const wrapper = mount(LanguageSwitcher, { global: { plugins: [router, i18n] } });
  await wrapper.find(`input[value="${code}"]`).setValue();
  await flushPromises();
};

describe("LanguageSwitcher", () => {
  beforeEach(() => setLocale("tr"));

  it("moves a public page to its URL in the other language", async () => {
    await router.push("/privacy");
    await pick("en");
    expect(router.currentRoute.value.fullPath).toBe("/en/privacy");
    expect(getLocale()).toBe("en");
    await pick("tr");
    expect(router.currentRoute.value.fullPath).toBe("/privacy");
  });

  it("only changes the language on app pages", async () => {
    await router.push("/dashboard");
    await pick("en");
    expect(router.currentRoute.value.fullPath).toBe("/dashboard");
    expect(getLocale()).toBe("en");
  });
});
