<template>
  <main class="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
    <div class="text-center">
      <p class="text-base font-semibold text-indigo-600">
        {{ error.statusCode }}
      </p>
      <h1 class="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
        Something went wrong
      </h1>
      <p class="mt-6 text-base leading-7 text-gray-700">
        {{ message }}
      </p>
      <div class="mt-5">
        <a-button
          :disabled="state === 'reloading'"
          :action="reload">
          {{ state === "reloading" ? "Reloading" : "Reload" }}
        </a-button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";

const router = useRouter();

const { error } = defineProps<{
  error: Partial<NuxtError>
}>();

const errorCodes: Record<number, string> = {
  401: "Not allowed",
  404: "Page not found"
};

if (import.meta.dev) {
  console.error(error);
}

const defaultMessage = "Something went wrong";

const message = error.message ?? errorCodes[error.statusCode!] ?? defaultMessage;

const state = ref<"error" | "reloading">("error");

async function reload () {
  state.value = "reloading";

  try {
    await clearError({
      redirect: "/"
    });
  } catch (err) {
    console.error(err);
    state.value = "error";
  }
}

</script>

<style scoped lang="scss">

</style>
