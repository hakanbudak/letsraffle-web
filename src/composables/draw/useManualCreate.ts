import { ref } from "vue";
import { useI18n } from "vue-i18n";
import confetti from "canvas-confetti";
import api from "@/services/api";
import type { Participant } from "@/components/draw/types";
import type { Ref } from "vue";

interface Options {
  participants: Ref<Participant[]>;
  requireAddress: Ref<boolean>;
  requirePhone: Ref<boolean>;
}

export function useManualCreate(options: Options) {
  const { t } = useI18n();
  const isCreatingEvent = ref<boolean>(false);
  const showSuccessModal = ref<boolean>(false);
  const isDrawCompleted = ref<boolean>(false);

  const handleCreateEvent = async () => {
    if (!options.participants.value.length) {
      return;
    }

    if (options.participants.value.length < 3) {
      return;
    }

    isCreatingEvent.value = true;
    try {
      const payload = {
        addressRequired: options.requireAddress.value,
        phoneNumberRequired: options.requirePhone.value,
        participants: options.participants.value.map((p) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          address: p.address || "",
          phone: p.phone || "",
        })),
      };

      const { data } = await api.post("/api/v1/draws/manual", payload);

      if (data && (data.success || data.drawId || data.id)) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#EF4444", "#10B981", "#3B82F6", "#F59E0B", "#8B5CF6"],
        });

        isDrawCompleted.value = true;
        showSuccessModal.value = true;
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error("Çekiliş oluşturulurken hata:", error);
    } finally {
      isCreatingEvent.value = false;
    }
  };

  const resetDraw = () => {
    isDrawCompleted.value = false;
    options.participants.value = [];
  };

  return {
    isCreatingEvent,
    showSuccessModal,
    isDrawCompleted,
    handleCreateEvent,
    resetDraw,
  };
}

