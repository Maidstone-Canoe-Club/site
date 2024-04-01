<template>
  <div
    v-if="content"
    ref="contentContainer"
    v-html="content" />
</template>

<script setup lang="ts">
import type { NavigateToOptions } from "#app/composables/router";

defineProps<{
  content?: string
}>();

const contentContainer = ref();

async function tryInterceptClick (event: any) {
  const url = new URL(event.target.href);
  const page = new URL(window.location.toString());

  if (url.origin === page.origin) {
    event.preventDefault();

    const options: NavigateToOptions = {
      open: undefined
    };

    if (event.target.target && event.target.target === "_blank") {
      options.open = {
        target: "_blank"
      };
    }

    await navigateTo(url.pathname, options);
  }
}

onMounted(() => {
  const elements = contentContainer.value.getElementsByTagName("a");
  for (const el of elements) {
    el.addEventListener("click", tryInterceptClick);
  }
});

onBeforeUnmount(() => {
  const elements = contentContainer.value.getElementsByTagName("a");
  for (const el of elements) {
    el.removeEventListener("click", tryInterceptClick);
  }
});

</script>

<style scoped lang="postcss">
::v-deep(p) {
  @apply leading-relaxed;
}

::v-deep(p:not(:last-child)) {
  @apply mb-6 leading-6;
}

::v-deep(img) {
  @apply rounded-lg;
}

::v-deep(ol) {
  @apply list-decimal mx-8 pb-6;
}

::v-deep(ol > li) {
  @apply pb-2;
}

::v-deep(ul) {
  @apply list-disc mx-8 py-4;
}

::v-deep(p + ul) {
  @apply pt-0;
}

::v-deep(a) {
  @apply text-[#6475f0] underline;
}

::v-deep(h3) {
  @apply text-2xl font-bold mb-2;
}
</style>
