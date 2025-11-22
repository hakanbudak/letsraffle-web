<script setup lang="ts">
const props = defineProps<{ strokeClass: string }>();
defineExpose({
  propKeys: Object.keys(props)
});
</script>

<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
        d="M14.5299 9.47004L9.46992 14.53C8.81992 13.88 8.41992 12.99 8.41992 12C8.41992 10.02 10.0199 8.42004 11.9999 8.42004C12.9899 8.42004 13.8799 8.82004 14.5299 9.47004Z"
        :class="strokeClass" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path
        d="M17.8201 5.76998C16.0701 4.44998 14.0701 3.72998 12.0001 3.72998C8.47009 3.72998 5.18009 5.80998 2.89009 9.40998C1.99009 10.82 1.99009 13.19 2.89009 14.6C3.68009 15.84 4.60009 16.91 5.60009 17.77"
        :class="strokeClass" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path
        d="M8.41992 19.5301C9.55992 20.0101 10.7699 20.2701 11.9999 20.2701C15.5299 20.2701 18.8199 18.1901 21.1099 14.5901C22.0099 13.1801 22.0099 10.8101 21.1099 9.40005C20.7799 8.88005 20.4199 8.39005 20.0499 7.93005"
        :class="strokeClass" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M15.5099 12.7C15.2499 14.11 14.0999 15.26 12.6899 15.52" :class="strokeClass" stroke-width="1.5"
          stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9.47 14.53L2 22" :class="strokeClass" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M22 2L14.53 9.47" :class="strokeClass" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>
