import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import QRCode from "qrcode";
import confetti from "canvas-confetti";
import api from "@/services/api";
import type { Participant, ParticipantForm, InvitedParticipant } from "@/components/draw/types";
import type { Ref } from "vue";
import type { Router } from "vue-router";
import { setLocale, type Locale } from "@/i18n";
import { combineLocalDateTime, toLocalDateInput, toLocalHourInput } from "@/utils/drawSchedule";

interface Options {
  participants: Ref<Participant[]>;
  requireAddress: Ref<boolean>;
  requirePhone: Ref<boolean>;
  form: ParticipantForm;
  validateForm: () => boolean;
  router: Router;
}

const INVITE_LINK_BASE = () => `${window.location.origin}/draw/join`;

export function useInviteActions(options: Options) {
  const { t, locale } = useI18n();
  const drawDate = ref<string>("");
  const drawTime = ref<string>("");
  const drawDateError = ref<string>("");
  const isDrawDateEnabled = ref(false);
  const inviteCode = ref<string | null>(null);
  const inviteUrl = ref<string>("");
  const drawId = ref<number | null>(null);
  const isSaving = ref(false);
  const qrCodeDataUrl = ref<string>("");
  const invitedParticipants = ref<InvitedParticipant[]>([]);
  const isLoadingInvites = ref(false);
  const isExecutingDraw = ref(false);
  const deletingParticipantId = ref<number | null>(null);
  const showExecuteSuccessModal = ref<boolean>(false);
  const isOrganizerSaved = ref<boolean>(false);
  const isInviteDrawLocked = ref<boolean>(false);
  const executeDrawError = ref<string>("");

  const minDrawDate = computed(() => {
    const min = new Date();
    min.setDate(min.getDate() + 1);
    return toLocalDateInput(min);
  });

  const normalizeDrawDate = () => {
    if (drawDate.value) {
      drawDate.value = drawDate.value.slice(0, 10);
    }
  };

  const setInviteLink = (code: string) => {
    inviteCode.value = code;
    inviteUrl.value = `${INVITE_LINK_BASE()}/${code}`;
  };

  const isCopied = ref(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl.value);
      isCopied.value = true;
      setTimeout(() => {
        isCopied.value = false;
      }, 2000);
    } catch (error) {
      console.error("Kopyalama hatası:", error);
    }
  };

  const generateQRCode = async (url: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      qrCodeDataUrl.value = dataUrl;
    } catch (error) {
      console.error("QR kod oluşturulurken hata:", error);
    }
  };

  watch(inviteUrl, (url) => {
    if (url) {
      generateQRCode(url);
    } else {
      qrCodeDataUrl.value = "";
    }
  });

  const fetchInvitedParticipants = async () => {
    if (!inviteCode.value) return;

    isLoadingInvites.value = true;
    try {
      const { data } = await api.get(`/api/v1/draws/${inviteCode.value}`);
      invitedParticipants.value = data.participants || [];

      if (data.inviteCode && !inviteCode.value) {
        setInviteLink(data.inviteCode);
      }

      if (data.id && !drawId.value) {
        drawId.value = data.id;
      }

      if (typeof data.requireAddress === "boolean") {
        options.requireAddress.value = data.requireAddress;
      }

      if (typeof data.requirePhone === "boolean") {
        options.requirePhone.value = data.requirePhone;
      }

      if (data.drawDate) {
        try {
          const serverDate = new Date(data.drawDate);
          drawDate.value = toLocalDateInput(serverDate);
          drawTime.value = toLocalHourInput(serverDate);
          isDrawDateEnabled.value = true;
        } catch {
          isDrawDateEnabled.value = false;
        }
      } else {
        isDrawDateEnabled.value = false;
      }

      if (data.language) {
        const normalizedLang = data.language.toLowerCase();
        if (normalizedLang === "tr" || normalizedLang === "en") {
          setLocale(normalizedLang as Locale);
        }
      }
    } catch (error) {
      console.error("Katılımcılar yüklenirken hata:", error);
    } finally {
      isLoadingInvites.value = false;
    }
  };

  const saveOrganizer = async () => {
    if (!options.validateForm()) return;

    drawDateError.value = "";
    let selectedDate: Date | null = null;
    if (isDrawDateEnabled.value) {
      if (!drawDate.value) {
        drawDateError.value = t("alerts.drawDateRequired");
        return;
      }
      selectedDate = combineLocalDateTime(drawDate.value, drawTime.value);
      if (selectedDate <= new Date()) {
        drawDateError.value = t("alerts.drawDateFuture");
        return;
      }
    }

    isSaving.value = true;
    try {
      const allParticipants = [
        ...options.participants.value.map((p) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          address: p.address || "",
          phone: p.phone || "",
        })),
        {
          firstName: options.form.firstName.value.trim(),
          lastName: options.form.lastName.value.trim(),
          email: options.form.email.value.trim(),
          address: options.form.address.value.trim() || "",
          phone: options.form.phone.value.trim() || "",
        },
      ];

      const payload: Record<string, unknown> = {
        addressRequired: options.requireAddress.value,
        phoneNumberRequired: options.requirePhone.value,
        participants: allParticipants,
        language: locale.value,
      };
      if (isDrawDateEnabled.value && selectedDate) {
        payload.drawDate = selectedDate.toISOString();
      }

      const { data } = await api.post("/api/v1/draws/dynamic", payload);

      if (data.success) {
        drawId.value = data.drawId;
        setInviteLink(data.inviteCode);
        isOrganizerSaved.value = true;
        if (data.inviteCode) {
          options.router.push(`/draws/${data.inviteCode}`);
        } else {
          options.router.push("/draw/dynamic");
        }
        await fetchInvitedParticipants();
      }
    } catch (error) {
      console.error("Çekiliş oluşturulurken hata:", error);
    } finally {
      isSaving.value = false;
    }
  };

  const canExecuteDraw = computed(() => invitedParticipants.value.length >= 3 && !!drawId.value);

  const executeDraw = async () => {
    if (!drawId.value || !canExecuteDraw.value) return;
    isExecutingDraw.value = true;
    executeDrawError.value = "";
    try {
      await api.post(`/api/v1/draws/${drawId.value}/execute`, {
        draw_id: drawId.value,
      });
      isInviteDrawLocked.value = true;
      
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      setTimeout(() => {
        showExecuteSuccessModal.value = true;
      }, 500);
      
      await fetchInvitedParticipants();
    } catch (error) {
      executeDrawError.value = error.response?.data?.detail || t("alerts.executeDrawError");
    } finally {
      isExecutingDraw.value = false;
    }
  };

  const deleteInvitedParticipant = async (participantId: number) => {
    if (!drawId.value) return;
    deletingParticipantId.value = participantId;
    try {
      await api.delete(`/api/v1/draws/${drawId.value}/participants/${participantId}`);
      invitedParticipants.value = invitedParticipants.value.filter((p) => p.id !== participantId);
    } catch (error) {
      console.error("Katılımcı silinirken hata:", error);
    } finally {
      deletingParticipantId.value = null;
    }
  };

  const clearExecuteDrawError = () => {
    executeDrawError.value = "";
  };

  if (!drawDate.value) {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    drawDate.value = toLocalDateInput(defaultDate);
  }

  const resetInviteDraw = () => {
    drawDate.value = "";
    drawTime.value = "";
    drawDateError.value = "";
    isDrawDateEnabled.value = false;
    inviteCode.value = null;
    inviteUrl.value = "";
    drawId.value = null;
    qrCodeDataUrl.value = "";
    invitedParticipants.value = [];
    isOrganizerSaved.value = false;
    isCopied.value = false;
    deletingParticipantId.value = null;
    isInviteDrawLocked.value = false;
    executeDrawError.value = "";
  };

  return {
    drawDate,
    drawTime,
    drawDateError,
    isDrawDateEnabled,
    minDrawDate,
    inviteCode,
    inviteUrl,
    drawId,
    isSaving,
    qrCodeDataUrl,
    invitedParticipants,
    isLoadingInvites,
    canExecuteDraw,
    isExecutingDraw,
    deletingParticipantId,
    isCopied,
    showExecuteSuccessModal,
    executeDrawError,
    normalizeDrawDate,
    saveOrganizer,
    fetchInvitedParticipants,
    copyToClipboard,
    setInviteLink,
    executeDraw,
    deleteInvitedParticipant,
    isOrganizerSaved,
    isInviteDrawLocked,
    resetInviteDraw,
    clearExecuteDrawError,
  };
}

