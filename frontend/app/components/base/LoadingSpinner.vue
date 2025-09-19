<template>
  <svg class="spinner" viewBox="0 0 50 50">
    <circle
      class="path"
      cx="25"
      cy="25"
      r="20"
      fill="none"
      stroke="currentColor"
      :stroke-width="strokeWidth" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  color?: string,
  size?: string,
  strokeWidth?: number
}>(), {
  color: "#fff",
  size: "25px",
  strokeWidth: 5
});
</script>

<style scoped lang="css">
.spinner {
  animation: rotate 2s linear infinite;
  z-index: 2;
  width: v-bind(size);
  height: v-bind(size);
  color: v-bind(color);
}

.spinner .path {
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

</style>
