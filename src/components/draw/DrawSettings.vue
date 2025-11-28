<template>
  <div class="mb-4 md:mb-6">
    <!-- Header - Always Visible -->
    <button
        type="button"
        @click="toggleSettings"
        :disabled="isDisabled"
        :class="[
          'w-full flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all',
          isOpen
            ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 shadow-sm'
            : 'bg-white border-red-100 hover:border-red-200 hover:shadow-sm',
          isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        ]">
      <div class="flex items-center gap-2 md:gap-3">
        <div :class="['p-1.5 md:p-2 rounded-lg transition-colors', isOpen ? 'bg-red-100' : 'bg-red-50']">
          <SettingsIcon
              :class="['w-4 h-4 md:w-5 md:h-5', isOpen ? 'text-red-600' : 'text-red-500']"
              :stroke-class="isOpen ? 'stroke-red-600' : 'stroke-red-500'" />
        </div>
        <div class="text-left">
          <h3 class="text-sm md:text-base font-semibold text-slate-800">
            {{ t("drawSettings.settingsTitle") }}
          </h3>
          <p class="text-xs md:text-sm text-slate-500">
            {{ activeCount > 0 ? t("drawSettings.settingsActive", { count: activeCount }) : t("drawSettings.settingsOptional") }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span v-if="activeCount > 0" class="px-2 md:px-2.5 py-0.5 md:py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
          {{ activeCount }}
        </span>
        <ChevronUpIcon v-if="isOpen" class="w-4 h-4 md:w-5 md:h-5 text-slate-400" stroke-class="stroke-slate-400" />
        <ChevronDownIcon v-else class="w-4 h-4 md:w-5 md:h-5 text-slate-400" stroke-class="stroke-slate-400" />
      </div>
    </button>

    <!-- Collapsible Content -->
    <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-[800px] opacity-100"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="max-h-[800px] opacity-100"
        leave-to-class="max-h-0 opacity-0">
      <div v-if="isOpen" class="mt-3">
        <div class="bg-gradient-to-br from-white to-red-50/30 rounded-xl md:rounded-2xl border border-red-100 p-4 md:p-5 space-y-3 md:space-y-4 shadow-sm">

          <!-- Address & Phone Settings - Side by Side -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <!-- Address Setting -->
            <div class="flex items-start gap-2 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-white/60 transition-colors">
              <div class="flex-shrink-0 mt-0.5">
                <div class="p-1.5 md:p-2 bg-blue-50 rounded-lg">
                  <MapPinIcon class="w-3.5 h-3.5 md:w-4 md:h-4" stroke-class="stroke-blue-600" />
                </div>
              </div>
              <div class="flex-1">
                <label
                    :for="`address-checkbox-${uniqueId}`"
                    :class="['flex items-center gap-2', isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer']">
                  <InputCheckBox
                      :id="`address-checkbox-${uniqueId}`"
                      name="requireAddress"
                      :checked="requireAddress"
                      :disabled="isDisabled"
                      @update:checked="(val) => requireAddress = val" />
                  <span class="font-medium text-sm md:text-base text-slate-800">{{ t("drawSettings.requireAddress") }}</span>
                </label>
                <p class="text-xs md:text-sm text-slate-500 mt-1 ml-6">
                  {{ t("drawSettings.requireAddressDesc") }}
                </p>
              </div>
            </div>

            <!-- Phone Setting -->
            <div class="flex items-start gap-2 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-white/60 transition-colors">
              <div class="flex-shrink-0 mt-0.5">
                <div class="p-1.5 md:p-2 bg-green-50 rounded-lg">
                  <PhoneIcon class="w-3.5 h-3.5 md:w-4 md:h-4" stroke-class="stroke-green-600" />
                </div>
              </div>
              <div class="flex-1">
                <label
                    :for="`phone-checkbox-${uniqueId}`"
                    :class="['flex items-center gap-2', isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer']">
                  <InputCheckBox
                      :id="`phone-checkbox-${uniqueId}`"
                      name="requirePhone"
                      :checked="requirePhone"
                      :disabled="isDisabled"
                      @update:checked="(val) => requirePhone = val" />
                  <span class="font-medium text-sm md:text-base text-slate-800">{{ t("drawSettings.requirePhone") }}</span>
                </label>
                <p class="text-xs md:text-sm text-slate-500 mt-1 ml-6">
                  {{ t("drawSettings.requirePhoneDesc") }}
                </p>
              </div>
            </div>
          </div>

          <div class="h-px bg-gradient-to-r from-transparent via-red-200 to-transparent" />

          <!-- Draw Date Setting - Full Width -->
          <div class="flex items-start gap-2 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-white/60 transition-colors">
            <div class="flex-shrink-0 mt-0.5">
              <div class="p-1.5 md:p-2 bg-purple-50 rounded-lg">
                <CalendarIcon class="w-3.5 h-3.5 md:w-4 md:h-4" stroke-class="stroke-purple-600" />
              </div>
            </div>
            <div class="flex-1 space-y-2 md:space-y-3">
              <div>
                <label
                  :for="`date-checkbox-${uniqueId}`"
                  :class="['flex items-center gap-2', isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer']">
                <InputCheckBox
                    :id="`date-checkbox-${uniqueId}`"
                    name="isDrawDateEnabled"
                    :checked="isDrawDateEnabled"
                    :disabled="isDisabled"
                    @update:checked="(val) => isDrawDateEnabled = val" />
                <span class="font-medium text-sm md:text-base text-slate-800">{{ t("drawSettings.enableDrawDate") }}</span>
              </label>
                <p class="text-xs md:text-sm text-slate-500 mt-1 ml-6">
                  {{ isDrawDateEnabled ? t("drawSettings.drawDateEnabledDesc") : t("drawSettings.drawDateDisabledDesc") }}
                </p>
              </div>

              <!-- Date & Time Input - Shows when enabled -->
              <transition
                  enter-active-class="transition-all duration-300 ease-out"
                  enter-from-class="opacity-0 -translate-y-2"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition-all duration-150 ease-in"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 -translate-y-2">
                <div v-if="isDrawDateEnabled" class="ml-6 space-y-2">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div class="flex flex-col gap-1">
                      <label class="text-xs font-medium text-slate-600">
                        {{ t("drawSettings.dateLabel") }}
                      </label>
                      <input
                          v-model="drawDate"
                          type="date"
                          :min="minDrawDate"
                          :disabled="isDisabled"
                          @input="handleDateTimeChange"
                          class="w-full px-3 md:px-4 py-2 md:py-2.5 rounded-lg border border-slate-200 bg-white
                            hover:border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20
                            text-sm md:text-base text-slate-700 outline-none transition-all
                            disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-50" />
                    </div>

                    <div class="flex flex-col gap-1">
                      <label class="text-xs font-medium text-slate-600">
                        {{ t("drawSettings.timeLabel") }}
                      </label>
                      <select
                          v-model="drawTime"
                          :disabled="isDisabled || !drawDate"
                          @change="handleDateTimeChange"
                          class="w-full px-3 md:px-4 py-2 md:py-2.5 rounded-lg border border-slate-200 bg-white
                            hover:border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20
                            text-sm md:text-base text-slate-700 outline-none transition-all
                            disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-50">
                        <option value="">{{ t("drawSettings.selectTime") }}</option>
                        <option v-for="hour in 24" :key="hour - 1" :value="formatHour(hour - 1)">
                          {{ formatHour(hour - 1) }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <p v-if="drawDateError" class="text-xs md:text-sm text-red-500">
                    {{ drawDateError }}
                  </p>

                  <div v-if="drawDate && !drawDateError" class="flex items-start gap-2 p-2 md:p-3 bg-red-50 rounded-lg border border-red-100">
                    <InfoIcon class="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" stroke-class="stroke-red-600" />
                    <p class="text-xs md:text-sm text-red-700 leading-relaxed">
                      <template v-if="drawTime">
                        {{ t("drawSettings.drawDateTimeInfo", { date: formatDrawDateTime(drawDate, drawTime) }) }}
                      </template>
                      <template v-else>
                        {{ t("drawSettings.drawDateOnlyInfo", { date: formatDrawDate(drawDate) }) }}
                      </template>
                    </p>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
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
import MapPinIcon from "@/components/icons/IconMapPin.vue";
import PhoneIcon from "@/components/icons/IconPhone.vue";
import CalendarIcon from "@/components/icons/IconCalendar.vue";
import InfoIcon from "@/components/icons/IconInfo.vue";
import InputCheckBox from "@/components/ui-kit/input/InputCheckBox.vue";

const { t, locale } = useI18n();

const uniqueId = Math.random().toString(36).substring(2, 9);

const props = defineProps<{
  requireAddress: boolean;
  requirePhone: boolean;
  isDrawDateEnabled: boolean;
  drawDate: string;
  drawDateError: string;
  minDrawDate: string;
  isDisabled: boolean;
}>();

const emit = defineEmits<{
  (e: "update:requireAddress", value: boolean): void;
  (e: "update:requirePhone", value: boolean): void;
  (e: "update:isDrawDateEnabled", value: boolean): void;
  (e: "update:drawDate", value: string): void;
  (e: "update:drawDateError", value: string): void;
  (e: "normalizeDrawDate"): void;
}>();

const isOpen = ref<boolean>(false);
const drawTime = ref<string>("");

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