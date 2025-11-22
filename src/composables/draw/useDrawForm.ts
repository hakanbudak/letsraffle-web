import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { FieldKey, Participant, ParticipantForm } from "@/components/draw/types";

export function useDrawForm() {
  const { t } = useI18n();
  const requireAddress = ref<boolean>(false);
  const requirePhone = ref<boolean>(false);

  const form = reactive<ParticipantForm>({
    firstName: { value: "", inValidMessage: "" },
    lastName: { value: "", inValidMessage: "" },
    address: { value: "", inValidMessage: "" },
    phone: { value: "", inValidMessage: "" },
    email: { value: "", inValidMessage: "" },
    isOrganizer: false,
  });

  const participants = ref<Participant[]>([]);
  const editingParticipantId = ref<number | null>(null);
  let idCounter = 1;

  const clearError = (key: FieldKey) => {
    form[key].inValidMessage = "";
  };

  const resetForm = () => {
    form.firstName.value = "";
    form.lastName.value = "";
    form.address.value = "";
    form.phone.value = "";
    form.email.value = "";
    form.isOrganizer = false;
    form.firstName.inValidMessage = "";
    form.lastName.inValidMessage = "";
    form.address.inValidMessage = "";
    form.phone.inValidMessage = "";
    form.email.inValidMessage = "";
    editingParticipantId.value = null;
  };

  const validateForm = () => {
    let valid = true;

    if (!form.firstName.value.trim()) {
      form.firstName.inValidMessage = t("validation.firstNameRequired");
      valid = false;
    }

    if (!form.lastName.value.trim()) {
      form.lastName.inValidMessage = t("validation.lastNameRequired");
      valid = false;
    }

    if (requireAddress.value && !form.address.value.trim()) {
      form.address.inValidMessage = t("validation.addressRequired");
      valid = false;
    }

    if (requirePhone.value && !form.phone.value.trim()) {
      form.phone.inValidMessage = t("validation.phoneRequired");
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValue = form.email.value.trim().toLowerCase();

    if (!emailValue) {
      form.email.inValidMessage = t("validation.emailRequired");
      valid = false;
    } else if (!emailRegex.test(emailValue)) {
      form.email.inValidMessage = t("validation.emailInvalid");
      valid = false;
    } else {
      const existingParticipant = participants.value.find(
          (p) => p.email.toLowerCase() === emailValue && p.id !== editingParticipantId.value,
      );

      if (existingParticipant) {
        form.email.inValidMessage = t("validation.emailDuplicate");
        valid = false;
      }
    }

    return valid;
  };

  const handleAddParticipant = () => {
    if (!validateForm()) return;

    const payload: Participant = {
      id: editingParticipantId.value ?? idCounter++,
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      address: form.address.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      isOrganizer: form.isOrganizer,
    };

    if (editingParticipantId.value) {
      const index = participants.value.findIndex((p) => p.id === editingParticipantId.value);
      if (index !== -1) {
        participants.value[index] = payload;
      }
      editingParticipantId.value = null;
    } else {
      participants.value.push(payload);
    }

    resetForm();
  };

  const editParticipant = (participant: Participant) => {
    form.firstName.value = participant.firstName;
    form.lastName.value = participant.lastName;
    form.address.value = participant.address;
    form.phone.value = participant.phone;
    form.email.value = participant.email;
    form.isOrganizer = participant.isOrganizer;
    form.firstName.inValidMessage = "";
    form.lastName.inValidMessage = "";
    form.address.inValidMessage = "";
    form.phone.inValidMessage = "";
    form.email.inValidMessage = "";
    editingParticipantId.value = participant.id;
  };

  const removeParticipant = (id: number) => {
    participants.value = participants.value.filter((p) => p.id !== id);
    if (editingParticipantId.value === id) {
      resetForm();
    }
  };

  return {
    requireAddress,
    requirePhone,
    form,
    participants,
    editingParticipantId,
    clearError,
    resetForm,
    validateForm,
    handleAddParticipant,
    editParticipant,
    removeParticipant,
  };
}


