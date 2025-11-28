<script setup lang="ts">
import { computed, ref } from "vue";
import { vClickOutside } from "@/directives";
import IconCheck from "@/components/icons/IconCheck.vue";


const props = defineProps<{
  checked?: boolean,
  id: string,
  name: string,
  disabled?: boolean
}>();

defineEmits<{
  (e: "update:checked", value: boolean): void,
}>();
const isFocused = ref<boolean>(false);

const labelClass = computed<string>(() => {
  let classes = "grid place-items-center w-4 h-4 rounded-md p-[3px] ";

  if (props.checked) {
    classes += props.disabled ? "bg-red-400/50 " : "bg-red-400 ";
  } else {
    classes += `${props.disabled ? "" : "hover:border-red-200"} bg-white border border-solid border-gray-200 `;
  }

  if (isFocused.value) {
    classes += props.disabled ? "" : "ring-1 ring-offset-1 ring-red-300"
  }

  return classes;
});
</script>

<template>
  <label :for="id"
         @click="isFocused = true"
         v-click-outside="()=>isFocused =false"
         :class="labelClass">

    <input type="checkbox"
           class="hidden peer"
           :key="String(checked)"
           :name="name"
           :id="id"
           :checked="checked"
           :disabled="disabled"
           @click.prevent="event=>$emit('update:checked', (event.target as HTMLInputElement).checked)">

    <IconCheck
        stroke-class="stroke-white"
        class="w-2.5 h-2.5 peer-has-[:checked]:hidden" />
  </label>
</template>