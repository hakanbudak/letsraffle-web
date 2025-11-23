<script setup lang="ts">
import { type Component, computed, ref, watch } from "vue";
import { vClickOutside } from "@/directives";
import IconEye from "@/components/icons/IconEye.vue";
import IconEyeSlash from "@/components/icons/IconEyeSlash.vue";

type InputType = "text" | "number" | "email" | "password";

interface Props {
  id: string;
  name?: string;
  input: string;
  label?: string;
  type?: InputType;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  invalidMessage?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  invalidMessage: "",
  disabled: false,
});

const emit = defineEmits<{
  (e: "update:input", value: string): void;
  (e: "onBlur"): void;
  (e: "onFocus"): void;
}>();

enum InputTypes {
  TEXT = "text",
  NUMBER = "number",
  EMAIL = "email",
  PASSWORD = "password",
}

defineSlots<{
  icon(): void;
  headerRight(): void;
  right(): void;
}>();

const inputElement = ref<HTMLInputElement | null>(null);
const inputType = ref<InputType>(props.type);
const invalidMessage = ref<string>(props.invalidMessage);
const showPassword = ref<boolean>(false);

const inputClass = computed<string>(() => {

  if (props.disabled) {
    return "bg-gray-50";
  }

  if (invalidMessage.value) {
    return "bg-white !border-red-500";
  }

  return "bg-white hover:border-red-200 focus-within:!border-red-500";
});
const isPasswordType = computed<boolean>(() => props.type === InputTypes.PASSWORD);
const iconEyeComponent = computed<Component>(() => (showPassword.value ? IconEyeSlash : IconEye));

watch(
    () => props.invalidMessage,
    (newVal) => (invalidMessage.value = newVal),
);

function onInput(event: Event) {
  emit("update:input", (event.target as HTMLInputElement).value);
}

function onFocus() {
  inputElement.value?.focus();
  emit("onFocus");
}

function togglePassword() {
  inputType.value = inputType.value == InputTypes.TEXT ? InputTypes.PASSWORD : InputTypes.TEXT;
  showPassword.value = inputType.value == InputTypes.TEXT;
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <label
          v-if="label"
          :for="id"
          class="flex items-center gap-0.5 font-rethink-sans font-medium text-sm md:text-base text-gray-700 !leading-4 tracking-[0.12px]">
        {{ label }}

        <span
            v-if="required"
            class="text-red-500">
          *
        </span>
      </label>

      <div
          v-if="$slots.headerRight"
          class="font-inter font-medium text-gray-400 text-xs md:text-[10px] !leading-4">
        <slot name="headerRight"></slot>
      </div>
    </div>

    <div
        v-click-outside="() => emit('onBlur')"
        class="flex items-center gap-2 h-12 w-full rounded-xl px-[15px] border border-solid border-gray-200"
        :class="[inputClass]"
        @click="onFocus">
      <slot
          v-if="$slots.icon"
          name="icon"></slot>

      <input
          :id="id"
          ref="inputElement"
          :type="inputType"
          :disabled="disabled"
          :value="input"
          :name="name"
          :placeholder="placeholder"
          :required="required"
          autocomplete="off"
          class="outline-none h-full min-h-4 w-full bg-transparent shadow-transparent autofill:shadow-[inset_0_0_0px_100px_rgb(0,0,0,0)] font-inter font-normal !leading-4 text-base md:text-base tracking-[0.14px]"
          :class="[invalidMessage ? 'text-red-500' : input.length ? 'text-gray-700' : 'text-gray-400 focus:text-gray-700']"
          @input="onInput" />

      <slot
          v-if="(isPasswordType && !disabled) || $slots.right"
          name="right">
        <component
            :is="iconEyeComponent"
            v-if="isPasswordType && !disabled"
            class="cursor-pointer w-4 h-4"
            strokeClass="stroke-gray-400"
            @click="togglePassword" />
      </slot>
    </div>

    <span
        v-if="invalidMessage"
        class="text-xs md:text-[10px] font-inter font-normal text-red-500 !leading-3">
      {{ invalidMessage }}
    </span>
  </div>
</template>
