<script setup lang="ts">
import { computed } from "vue";
import type { ButtonSize } from "./types";

interface Props {
  size?: ButtonSize;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
});

enum Size {
  Small = "sm",
  Medium = "md",
  Large = "lg",
  ExtraLarge = "xl",
}

const sizeClass = computed<string>(() => {
  const defaultSize: string = `h-10 px-[15px] py-[11px] text-[13px] rounded-[0.625rem] tracking-[0.13px] ${props.disabled ? "opacity-50" : ""}`;
  switch (props.size) {
    case Size.Small:
      return "h-8 px-[11px] py-[7px] text-xs rounded-lg tracking-[0.12px]";
    case Size.Medium:
      return defaultSize;
    case Size.Large:
      return "h-12 px-[23px] py-[15px] text-sm rounded-xl tracking-[0.14px]";
    case Size.ExtraLarge:
      return "h-14 px-[31px] py-[21px] text-base rounded-2xl tracking-[0.16px]";
    default:
      return defaultSize;
  }
});

defineSlots<{
  default: {};
}>();
</script>

<template>
  <button
      type="button"
      class="w-full flex items-center justify-center gap-2 font-medium font-inter !leading-4 border border-solid"
      :class="[sizeClass]">
    <slot></slot>
  </button>
</template>
