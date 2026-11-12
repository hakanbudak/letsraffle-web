<template>
  <!-- one-tap sharing of the invite: WhatsApp chat and status, Instagram story, e-mail, a printable A4 poster and the device share sheet.
       The story / status / poster targets hand over a picture of the invitation (see utils/inviteCard). -->
  <div class="mt-4">
    <p class="xm-label">{{ t("share.title") }}</p>
    <ul class="m-0 mt-2 grid list-none grid-cols-3 gap-2 p-0 sm:grid-cols-6 lg:gap-1">
      <li v-for="s in targets" :key="s.id">
        <component
            :is="s.href ? 'a' : 'button'"
            :href="s.href"
            :target="s.href && s.newTab ? '_blank' : undefined"
            :rel="s.href && s.newTab ? 'noopener noreferrer' : undefined"
            :type="s.href ? undefined : 'button'"
            class="share-btn flex w-full cursor-pointer flex-col items-center gap-2 rounded-2xl border-0 bg-transparent px-0 pb-1 pt-2.5 text-center no-underline"
            :aria-label="s.label"
            :data-testid="`share-${s.id}`"
            @click="s.onClick?.()">
          <!-- each target is a little Christmas bauble (cranberry, pine or gold) with a gold cap, like in the app -->
          <span class="bauble" :class="`bauble-${s.tone}`">
            <svg viewBox="0 0 24 24" class="h-[22px] w-[22px]" :fill="s.stroke ? 'none' : 'currentColor'" :stroke="s.stroke ? 'currentColor' : 'none'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="s.icon"></svg>
            <!-- story targets carry a little "+", like the story ring in those apps -->
            <span v-if="s.badge" class="absolute -bottom-1 -right-1 flex h-[17px] w-[17px] items-center justify-center rounded-full bg-snow text-cranberry-800 shadow-[inset_0_0_0_1.5px_#e6b94a]" aria-hidden="true">
              <svg viewBox="0 0 12 12" class="h-[9px] w-[9px]" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 2v8M2 6h8" /></svg>
            </span>
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
import { renderInviteCard, type InviteCardKind } from "@/utils/inviteCard";

const props = defineProps<{ url: string }>();
const { t, locale } = useI18n();

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

const inviteCode = computed(() => props.url.split("/").filter(Boolean).pop() ?? "");
const busy = ref(false);

function download(file: File) {
  const href = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = href;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 10_000);
}

/**
 * Story / status / poster: paint the invitation picture, then hand it to the phone's share sheet
 * (WhatsApp → "My status", Instagram → "Story", Print, Save image). Where files cannot be shared
 * (desktop browsers) the picture is downloaded instead. Stories cannot carry a tappable link from
 * outside the app, so the invite link is copied for the person to add as a link sticker.
 */
async function shareCard(kind: InviteCardKind) {
  if (busy.value) return;
  busy.value = true;
  say(t("share.preparing"));
  try {
    const blob = await renderInviteCard(kind, {
      code: inviteCode.value,
      url: props.url,
      locale: String(locale.value).startsWith("tr") ? "tr" : "en",
    });
    const file = new File([blob], `lets-raffle-${inviteCode.value}-${kind}.jpg`, { type: "image/jpeg" });
    if (kind === "story") {
      try {
        await navigator.clipboard.writeText(props.url);
      } catch {
        /* the picture still carries the code */
      }
    }
    let shared = false;
    if (isTouch && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        shared = true;
      } catch (error) {
        // closing the sheet is fine; anything else (e.g. the tap "expired" while painting) falls back to a download
        shared = (error as DOMException)?.name === "AbortError";
      }
    }
    if (!shared) download(file);
    if (kind === "story") say(t(shared ? "share.storyShared" : "share.storySaved"));
    else say(t(shared ? "share.posterShared" : "share.posterSaved"));
  } catch {
    say(t("share.imageFailed"));
  } finally {
    busy.value = false;
  }
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
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  poster: '<path d="M7 8V3h10v5"/><rect x="3" y="8" width="18" height="9" rx="2"/><rect x="7" y="14" width="10" height="7" rx="1"/>',
  more: '<path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>',
};

type Target = { id: string; label: string; tone: 0 | 1 | 2; icon: string; stroke?: boolean; badge?: boolean; href?: string; newTab?: boolean; onClick?: () => void };

const targets = computed<Target[]>(() => {
  const list: Target[] = [
    { id: "whatsapp", label: "WhatsApp", tone: 0, icon: ICON.whatsapp, href: `https://wa.me/?text=${enc(message.value)}`, newTab: true },
    { id: "status", label: t("share.status"), tone: 0, icon: ICON.whatsapp, badge: true, onClick: () => shareCard("story") },
    { id: "story", label: t("share.story"), tone: 1, icon: ICON.instagram, stroke: true, badge: true, onClick: () => shareCard("story") },
    { id: "mail", label: t("share.email"), tone: 2, icon: ICON.mail, stroke: true, href: `mailto:?subject=${enc(t("share.subject"))}&body=${enc(message.value)}` },
    { id: "poster", label: t("share.poster"), tone: 1, icon: ICON.poster, stroke: true, onClick: () => shareCard("poster") },
  ];
  if (canNativeShare) list.push({ id: "more", label: t("share.more"), tone: 0, icon: ICON.more, stroke: true, onClick: shareNative });
  return list;
});
</script>

<style scoped>
.bauble {
  position: relative;
  display: flex;
  width: 46px;
  height: 46px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  box-shadow: inset 0 0 0 2px rgba(246, 217, 138, 0.85), 0 3px 0 var(--edge);
  transition: transform 0.15s ease;
}
/* the gold cap the bauble hangs from */
.bauble::before {
  content: "";
  position: absolute;
  left: 50%;
  top: -7px;
  width: 12px;
  height: 8px;
  margin-left: -6px;
  border-radius: 2.5px;
  background: linear-gradient(180deg, #f6d98a, #b08a2e);
}
.bauble-0 { --edge: #4a080c; background: radial-gradient(circle at 34% 28%, #e0444a, #a3171c 62%, #7a0f14); color: #fffbf5; }
.bauble-1 { --edge: #0c2a1c; background: radial-gradient(circle at 34% 28%, #3f9a63, #1f5c3e 62%, #123826); color: #fffbf5; }
.bauble-2 { --edge: #8a6a1e; background: radial-gradient(circle at 34% 28%, #fdf0c4, #e6b94a 62%, #b08a2e); color: #5a0a0f; }
.share-btn:hover .bauble { transform: translateY(-2px); }
.share-btn:active .bauble { transform: translateY(1px); }
.share-btn:focus-visible { outline: 3px solid #e6b94a; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .bauble { transition: none; }
}
</style>
