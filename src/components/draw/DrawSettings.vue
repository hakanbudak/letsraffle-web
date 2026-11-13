<template>
  <div class="rounded-[20px] bg-snow-200 p-1.5">
    <button
        type="button"
        class="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border-0 bg-transparent px-3 text-left"
        :class="isDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-white/60'"
        :disabled="isDisabled"
        :aria-expanded="isOpen"
        @click="toggleSettings">
      <span class="flex items-center gap-3">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-[inset_0_0_0_2px_#ecdcc9]">
          <SettingsIcon class="h-5 w-5" stroke-class="stroke-cranberry-700" />
        </span>
        <span>
          <span class="block font-extrabold text-ink">{{ t("drawSettings.settingsTitle") }}</span>
          <span class="block text-[13px] font-semibold text-ink-muted">
            {{ activeCount > 0 ? t("drawSettings.settingsActive", { count: activeCount }) : t("drawSettings.settingsOptional") }}
          </span>
        </span>
      </span>
      <span class="flex items-center gap-2">
        <span v-if="activeCount > 0" class="rounded-full bg-cranberry-800 px-2.5 py-0.5 text-xs font-black text-gold-300">{{ activeCount }}</span>
        <ChevronUpIcon v-if="isOpen" class="h-5 w-5" stroke-class="stroke-cranberry-700" />
        <ChevronDownIcon v-else class="h-5 w-5" stroke-class="stroke-cranberry-700" />
      </span>
    </button>

    <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-[800px] opacity-100"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="max-h-[800px] opacity-100"
        leave-to-class="max-h-0 opacity-0">
      <div v-if="isOpen" class="flex flex-col gap-1 overflow-hidden px-3 pb-3">
        <label class="flex min-h-12 items-center justify-between gap-3 font-bold" :class="isDisabled ? 'opacity-60' : ''">
          <span>
            <span class="block">{{ t("drawSettings.requireAddress") }}</span>
            <span class="block text-[13px] font-semibold text-ink-muted">{{ t("drawSettings.requireAddressDesc") }}</span>
          </span>
          <span class="xm-toggle" :class="{ 'is-on': requireAddress }">
            <input v-model="requireAddress" type="checkbox" :disabled="isDisabled" :aria-label="t('drawSettings.requireAddress')" />
            <span class="xm-knob"></span>
          </span>
        </label>

        <label class="flex min-h-12 items-center justify-between gap-3 font-bold" :class="isDisabled ? 'opacity-60' : ''">
          <span>
            <span class="block">{{ t("drawSettings.requirePhone") }}</span>
            <span class="block text-[13px] font-semibold text-ink-muted">{{ t("drawSettings.requirePhoneDesc") }}</span>
          </span>
          <span class="xm-toggle" :class="{ 'is-on': requirePhone }">
            <input v-model="requirePhone" type="checkbox" :disabled="isDisabled" :aria-label="t('drawSettings.requirePhone')" />
            <span class="xm-knob"></span>
          </span>
        </label>

        <label class="flex min-h-12 items-center justify-between gap-3 font-bold" :class="isDisabled ? 'opacity-60' : ''">
          <span>
            <span class="block">{{ t("drawSettings.enableDrawDate") }}</span>
            <span class="block text-[13px] font-semibold text-ink-muted">
              {{ isDrawDateEnabled ? t("drawSettings.drawDateEnabledDesc") : t("drawSettings.drawDateDisabledDesc") }}
            </span>
          </span>
          <span class="xm-toggle" :class="{ 'is-on': isDrawDateEnabled }">
            <input v-model="isDrawDateEnabled" type="checkbox" :disabled="isDisabled" :aria-label="t('drawSettings.enableDrawDate')" />
            <span class="xm-knob"></span>
          </span>
        </label>

        <transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2">
          <div v-if="isDrawDateEnabled" class="mt-1 flex flex-col gap-2">
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div class="flex flex-col gap-1.5">
                <label class="xm-label" :for="`draw-date-${uniqueId}`">{{ t("drawSettings.dateLabel") }}</label>
                <div class="xm-field" :class="{ 'is-disabled': isDisabled, 'is-invalid': drawDateError }">
                  <CalendarIcon class="h-5 w-5 flex-none" stroke-class="stroke-cranberry-600" />
                  <input :id="`draw-date-${uniqueId}`" v-model="drawDate" type="date" :min="minDrawDate" :disabled="isDisabled" @input="handleDateTimeChange" />
                </div>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="xm-label" :for="`draw-time-${uniqueId}`">{{ t("drawSettings.timeLabel") }}</label>
                <div class="xm-field" :class="{ 'is-disabled': isDisabled || !drawDate }">
                  <select :id="`draw-time-${uniqueId}`" v-model="drawTime" :disabled="isDisabled || !drawDate" @change="handleDateTimeChange">
                    <option value="">{{ t("drawSettings.selectTime") }}</option>
                    <option v-for="hour in 24" :key="hour - 1" :value="formatHour(hour - 1)">{{ formatHour(hour - 1) }}</option>
                  </select>
                </div>
              </div>
            </div>

            <p v-if="drawDateError" class="xm-error" role="alert">{{ drawDateError }}</p>

            <div v-if="drawDate && !drawDateError" class="flex items-start gap-2 rounded-xl bg-white p-3 shadow-[inset_0_0_0_2px_#ecdcc9]">
              <InfoIcon class="mt-0.5 h-4 w-4 flex-none" stroke-class="stroke-cranberry-600" />
              <p class="m-0 text-[13px] font-semibold leading-relaxed text-cranberry-900">
                <template v-if="drawTime">{{ t("drawSettings.drawDateTimeInfo", { date: formatDrawDateTime(drawDate, drawTime) }) }}</template>
                <template v-else>{{ t("drawSettings.drawDateOnlyInfo", { date: formatDrawDate(drawDate) }) }}</template>
              </p>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import SettingsIcon from "@/components/icons/IconSettings.vue";
import ChevronUpIcon from "@/components/icons/IconChevronUp.vue";
import ChevronDownIcon from "@/components/icons/IconChevronDownIcon.vue";
import CalendarIcon from "@/components/icons/IconCalendar.vue";
import InfoIcon from "@/components/icons/IconInfo.vue";

const { t, locale } = useI18n();

const uniqueId = Math.random().toString(36).substring(2, 9);

const props = defineProps<{
  requireAddress: boolean;
  requirePhone: boolean;
  isDrawDateEnabled: boolean;
  drawDate: string;
  drawTime: string;
  drawDateError: string;
  minDrawDate: string;
  isDisabled: boolean;
}>();

const emit = defineEmits<{
  (e: "update:requireAddress", value: boolean): void;
  (e: "update:requirePhone", value: boolean): void;
  (e: "update:isDrawDateEnabled", value: boolean): void;
  (e: "update:drawDate", value: string): void;
  (e: "update:drawTime", value: string): void;
  (e: "update:drawDateError", value: string): void;
  (e: "normalizeDrawDate"): void;
}>();

const isOpen = ref<boolean>(true);

const requireAddress = computed({
  get: () => props.requireAddress,
  set: (value) => emit("update:requireAddress", value),
});

const requirePhone = computed({
  get: () => props.requirePhone,
  set: (value) => emit("update:requirePhone", value),
});

const isDrawDateEnabled = computed({
  get: () => props.isDrawDateEnabled,
  set: (value) => emit("update:isDrawDateEnabled", value),
});

const drawDate = computed({
  get: () => props.drawDate,
  set: (value) => emit("update:drawDate", value),
});

const drawTime = computed({
  get: () => props.drawTime,
  set: (value) => emit("update:drawTime", value),
});

const drawDateError = computed({
  get: () => props.drawDateError,
  set: (value) => emit("update:drawDateError", value),
});

const activeCount = computed(() => {
  let count = 0;
  if (requireAddress.value) count++;
  if (requirePhone.value) count++;
  if (isDrawDateEnabled.value) count++;
  return count;
});

const toggleSettings = () => {
  if (!props.isDisabled) {
    isOpen.value = !isOpen.value;
  }
};

const closeSettings = () => {
  isOpen.value = false;
};

const formatHour = (hour: number): string => {
  return `${hour.toString().padStart(2, "0")}:00`;
};

const handleDateTimeChange = () => {
  emit("update:drawDateError", "");
  emit("normalizeDrawDate");
};

const localeMap: Record<string, string> = {
  tr: "tr-TR",
  en: "en-US",
};

const formatDrawDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString + "T00:00:00");
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
  const currentLocale = localeMap[locale.value] || "tr-TR";
  return new Intl.DateTimeFormat(currentLocale, options).format(date);
};

const formatDrawDateTime = (dateString: string, timeString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString + "T" + timeString + ":00");
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const currentLocale = localeMap[locale.value] || "tr-TR";
  return new Intl.DateTimeFormat(currentLocale, options).format(date);
};

defineExpose({
  closeSettings,
});

</script>