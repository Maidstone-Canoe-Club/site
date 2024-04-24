<template>
  <nuxt-layout :key="key">
    <nuxt-page />
    <medical-info-modal
      v-if="showMedicalInfoModal"
      continue-label="Confirm"
      open
      :users="[user.value]"
      @continue="showMedicalInfoModal = false">
      <div>
        <template v-if="isRandomCheck">
          🎉
        </template>
        We need to confirm your medical information is correct and up to date.
      </div>

      <template #alert>
        <p>
          If no changes are needed, {{
            clickOrTap()
          }} confirm. If you have made changes, {{ clickOrTap() }} the save button.
        </p>
        <p>
          You can always update your medical information on your <nuxt-link
            to="/profile"
            class="underline">
            profile.
          </nuxt-link>
        </p>
      </template>
    </medical-info-modal>
  </nuxt-layout>
</template>

<script setup lang="ts">
import { provideUseId } from "@headlessui/vue";
import { differenceInDays } from "date-fns";

provideUseId(() => useId());

const user = useDirectusUser();
const key = computed(() => user.value?.id || "");

const isRandomCheck = ref(false);
const showMedicalInfoModal = ref(false);

onMounted(() => {
  if (user.value) {
    // There is a 0.5% chance to show the medical info confirmation check when a logged-in user visits
    // the site. If the last medical check was over 60 days ago, there a chance to show the
    // confirmation modal that will increase by 10% each day over the 60 days since the last check.

    if (Math.random() < 0.005) {
      isRandomCheck.value = true;
      showMedicalInfoModal.value = true;
      umTrackEvent("check-medical-info");
      window.localStorage.setItem("last-med-check", new Date().toISOString());
    } else {
      const lastMedicalCheck = window.localStorage.getItem("last-med-check");
      if (lastMedicalCheck) {
        const lastCheck = new Date(lastMedicalCheck);

        const diff = differenceInDays(new Date(), lastCheck);
        if (diff >= 60) {
          const daysOver = diff - 60;
          const chance = 0.1 + (daysOver * 0.1);
          if (Math.random() < chance) {
            showMedicalInfoModal.value = true;
            umTrackEvent("check-medical-info");
            window.localStorage.setItem("last-med-check", new Date().toISOString());
          }
        }
      } else {
        window.localStorage.setItem("last-med-check", new Date().toISOString());
      }
    }
  }
});

</script>

<style lang="postcss">
@tailwind components;

html {
  font-family: 'Karla', Arial, sans-serif;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: "Space Grotesk", Arial, sans-serif;
}

html, body, #__nuxt {
  margin: 0;
  height: 100%;
}

.required:after {
  content: " *";
  color: red;
}

.page-enter-active,
.page-leave-active {
  transition: all .2s ease-out;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(.5rem);
  filter: blur(0.1rem);
  pointer-events: none;
}

.layout-content,
.layout-enter-active,
.layout-leave-active {
  transition: all .2s ease-out;
}

.layout-enter-from,
.layout-leave-to {
  .layout-content {
    opacity: 0;
    transform: translateY(.5rem);
    filter: blur(0.1rem);
    pointer-events: none;
  }
}

</style>
