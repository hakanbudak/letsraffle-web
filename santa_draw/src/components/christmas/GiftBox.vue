<template>
  <div
      :class="[
      'relative rounded-lg shadow-xl',
      customClass,
      `w-${size} h-${size}`,
      rotationClass
    ]"
      :style="boxStyle"
  >
    <div
        class="absolute inset-x-0 top-1/2"
        :style="{ height: ribbonThickness + 'px', background: ribbonColor, transform: 'translateY(-50%)' }"
    ></div>

    <div
        class="absolute inset-y-0 left-1/2"
        :style="{ width: ribbonThickness + 'px', background: ribbonColor, transform: 'translateX(-50%)' }"
    ></div>

    <div
        class="absolute -top-2 left-1/2 -translate-x-1/2 rounded-t-lg"
        :style="{ width: topRibbonWidth, height: topRibbonHeight, background: ribbonColor }"
    ></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: number
  boxColor?: string
  ribbonColor?: string
  customClass?: string
  rotate?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 20,
  boxColor: "linear-gradient(to bottom right, #34d399, #059669)",
  ribbonColor: "#dc2626",
  customClass: "",
  rotate: 0
})

const boxStyle = {
  background: props.boxColor
}

const rotationClass = props.rotate ? `rotate-${props.rotate}` : ''

const ribbonThickness = Math.max(2, Math.floor(props.size / 8))
const topRibbonWidth = props.size * 0.4 + 'px'
const topRibbonHeight = props.size * 0.2 + 'px'
</script>
