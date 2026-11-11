<template>
  <!-- one-tap sharing of the invite link: WhatsApp, Telegram, Instagram, X, e-mail, SMS and the device share sheet -->
  <div class="mt-4">
    <p class="xm-label">{{ t("share.title") }}</p>
    <ul class="m-0 mt-2 grid list-none grid-cols-4 gap-2 p-0 sm:grid-cols-7 lg:grid-cols-5 lg:gap-1.5">
      <li v-for="s in targets" :key="s.id">
        <component
            :is="s.href ? 'a' : 'button'"
            :href="s.href"
            :target="s.href && s.newTab ? '_blank' : undefined"
            :rel="s.href && s.newTab ? 'noopener noreferrer' : undefined"
            :type="s.href ? undefined : 'button'"
            class="share-btn group flex w-full cursor-pointer flex-col items-center gap-1 rounded-2xl border-0 bg-white px-1 py-2.5 text-center no-underline shadow-[inset_0_0_0_2px_#f3e6d6] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[inset_0_0_0_2px_#e6b94a]"
            :aria-label="s.label"
            :data-testid="`share-${s.id}`"
            @click="s.onClick?.()">
          <span class="flex h-10 w-10 items-center justify-center rounded-full text-white" :style="{ background: s.color }">
            <svg viewBox="0 0 24 24" class="h-[22px] w-[22px]" :fill="s.stroke ? 'none' : 'currentColor'" :stroke="s.stroke ? 'currentColor' : 'none'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="s.icon"></svg>
          </span>
          <span class="text-[11.5px] font-extrabold leading-tight text-ink-soft lg:text-[10.5px]">{{ s.label }}</span>
        </component>
      </li>
    </ul>
    <p v-if="notice" class="mt-2 rounded-xl bg-pine-100 px-3 py-2 text-[13px] font-bold text-pine-700" role="status">{{ notice }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{ url: string }>();
const { t } = useI18n();

const notice = ref("");
let noticeTimer: ReturnType<typeof setTimeout> | undefined;
const say = (text: string) => {
  notice.value = text;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => (notice.value = ""), 4000);
};

const message = computed(() => t("share.message", { url: props.url }));
const enc = (v: string) => encodeURIComponent(v);
const isTouch = typeof window !== "undefined" && window.matchMedia?.("(hover: none)").matches;
const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

/** Instagram has no "share this link" address: copy the invite text and open Instagram so it can be pasted in a DM or story */
async function shareInstagram() {
  try {
    await navigator.clipboard.writeText(message.value);
    say(t("share.instagramCopied"));
  } catch {
    say(t("share.copyFailed"));
  }
  window.open(isTouch ? "instagram://direct-inbox" : "https://www.instagram.com/direct/inbox/", isTouch ? "_self" : "_blank", "noopener");
}

async function shareNative() {
  try {
    await navigator.share({ title: t("share.subject"), text: t("share.messageNoUrl"), url: props.url });
  } catch {
    /* sheet dismissed */
  }
}

const ICON = {
  whatsapp: '<path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.29.18-1.42-.08-.13-.27-.2-.57-.35M12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88M20.46 3.49A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.42"/>',
  telegram: '<path d="M21.94 4.3 18.9 18.63c-.23 1.01-.83 1.26-1.68.79l-4.63-3.41-2.23 2.15c-.25.25-.45.45-.93.45l.33-4.71 8.58-7.75c.37-.33-.08-.52-.58-.19L7.16 12.64l-4.57-1.43c-.99-.31-1.01-.99.21-1.47L20.66 2.86c.83-.31 1.55.19 1.28 1.44Z"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/>',
  x: '<path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  sms: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',
  more: '<path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>',
};

type Target = { id: string; label: string; color: string; icon: string; stroke?: boolean; href?: string; newTab?: boolean; onClick?: () => void };

const targets = computed<Target[]>(() => {
  const list: Target[] = [
    { id: "whatsapp", label: "WhatsApp", color: "#25D366", icon: ICON.whatsapp, href: `https://wa.me/?text=${enc(message.value)}`, newTab: true },
    { id: "telegram", label: "Telegram", color: "#29A9EB", icon: ICON.telegram, href: `https://t.me/share/url?url=${enc(props.url)}&text=${enc(t("share.messageNoUrl"))}`, newTab: true },
    { id: "instagram", label: "Instagram", color: "linear-gradient(45deg,#F9CE34 0%,#EE2A7B 50%,#6228D7 100%)", icon: ICON.instagram, stroke: true, onClick: shareInstagram },
    { id: "x", label: "X", color: "#111111", icon: ICON.x, href: `https://twitter.com/intent/tweet?text=${enc(message.value)}`, newTab: true },
    { id: "mail", label: t("share.email"), color: "#9B1418", icon: ICON.mail, stroke: true, href: `mailto:?subject=${enc(t("share.subject"))}&body=${enc(message.value)}` },
  ];
  // SMS only makes sense on a phone
  if (isTouch) list.push({ id: "sms", label: "SMS", color: "#1F5C3E", icon: ICON.sms, stroke: true, href: `sms:?&body=${enc(message.value)}` });
  if (canNativeShare) list.push({ id: "more", label: t("share.more"), color: "#B08A2E", icon: ICON.more, stroke: true, onClick: shareNative });
  return list;
});
</script>
