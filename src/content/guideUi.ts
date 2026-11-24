import type { Locale } from "@/i18n";

/** fixed labels around the guide pages */
export const guideUi: Record<Locale, {
  breadcrumb: string;
  home: string;
  faq: string;
  related: string;
  guidesHeading: string;
  ctaTitle: string;
  ctaText: string;
  ctaManual: string;
  ctaInvite: string;
}> = {
  tr: {
    breadcrumb: "Sayfa yolu",
    home: "Ana sayfa",
    faq: "Sık sorulan sorular",
    related: "Diğer rehberler",
    guidesHeading: "Rehberler",
    ctaTitle: "Çekilişini şimdi kur",
    ctaText: "Ücretsiz. Katılımcıları kendin eklersen hesap bile gerekmez.",
    ctaManual: "Hemen isim çek",
    ctaInvite: "Davet linkiyle başla",
  },
  en: {
    breadcrumb: "Breadcrumb",
    home: "Home",
    faq: "Frequently asked questions",
    related: "More guides",
    guidesHeading: "Guides",
    ctaTitle: "Set up your draw now",
    ctaText: "Free. If you add the participants yourself, you do not even need an account.",
    ctaManual: "Draw names now",
    ctaInvite: "Start with an invite link",
  },
};
