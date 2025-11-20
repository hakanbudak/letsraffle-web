import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import QRCode from "qrcode";
import confetti from "canvas-confetti";
import api from "@/services/api";
import type { Participant, ParticipantForm, InvitedParticipant } from "@/components/draw/types";
import type { Ref } from "vue";
import type { Router } from "vue-router";

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
  const { t } = useI18n();
  const drawDate = ref<string>("");
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
  const showExecuteSuccessModal = ref(false);
  const isOrganizerSaved = ref(false);

  const minDrawDate = computed(() => {
    const min = new Date();
    min.setDate(min.getDate() + 1);
    min.setHours(0, 0, 0, 0);
    return min.toISOString().slice(0, 10);
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

      if (data.drawDate) {
        try {
          const serverDate = new Date(data.drawDate);
          drawDate.value = serverDate.toISOString().slice(0, 10);
          isDrawDateEnabled.value = true;
        } catch {
          isDrawDateEnabled.value = false;
        }
      } else {
        isDrawDateEnabled.value = false;
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
      selectedDate = new Date(drawDate.value + "T00:00:00");
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (selectedDate <= now) {
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

  const markDrawAsReady = async () => {
    if (!drawId.value || !isDrawDateEnabled.value || !drawDate.value) {
      return;
    }

    isSaving.value = true;
    try {
      const payload = {
        draw_id: drawId.value,
      };

      await api.post(`/api/v1/draws/${drawId.value}/execute`, payload);
      await fetchInvitedParticipants();
    } catch (error) {
      console.error("Çekiliş hazırlanırken hata:", error);
    } finally {
      isSaving.value = false;
    }
  };

  const executeDraw = async () => {
    if (!drawId.value || !canExecuteDraw.value) return;
    isExecutingDraw.value = true;
    try {
      await api.post(`/api/v1/draws/${drawId.value}/execute`, {
        draw_id: drawId.value,
      });
      
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

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
      console.error("Çekiliş yürütülürken hata:", error);
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

  if (!drawDate.value) {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    drawDate.value = defaultDate.toISOString().slice(0, 10);
  }

  const resetInviteDraw = () => {
    drawDate.value = "";
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
  };

  return {
    drawDate,
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
    normalizeDrawDate,
    saveOrganizer,
    fetchInvitedParticipants,
    copyToClipboard,
    setInviteLink,
    executeDraw,
    deleteInvitedParticipant,
    isOrganizerSaved,
    resetInviteDraw,
    markDrawAsReady,
  };
}

