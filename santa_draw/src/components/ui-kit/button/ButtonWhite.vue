<script setup lang="ts">
import Button from "./Button.vue";
import type { ButtonSize } from "./types";

defineProps<{
  size?: ButtonSize
}>();

</script>

<template>
  <Button :size="size"
          class="text-neutral-600 hover:text-purple-v2-500 active:text-purple-v2-500 border-transparent [background:linear-gradient(180deg,#FFFFFF_0%,#F4F4F4_100%)_padding-box,linear-gradient(180deg,#F4F4F4_0%,rgba(244,244,244,0)_100%)_border-box] hover:[background:linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(244,244,244,0.9)_100%)_padding-box,linear-gradient(180deg,#F4F4F4_0%,rgba(244,244,244,0)_100%)_border-box] active:[background:linear-gradient(180deg,rgba(255,255,255,0.8)_0%,rgba(244,244,244,0.8)_100%)_padding-box,linear-gradient(180deg,#F4F4F4_0%,rgba(244,244,244,0)_100%)_border-box]">
    <slot/>
  </Button>
</template>
