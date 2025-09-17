<template>
  <div>
    <nuxt-loading-indicator />
    <error-notification />
    <nuxt-layout>
      <nuxt-page />
    </nuxt-layout>

    <page-notification />
    <medical-info-modal
      v-model:open="showMedicalInfoModal"
      continue-label="Continue"
      :users="[user]"
      @continue="onMedicalInfoConfirmed">
      <div v-if="lastCheckDaysAgo">
        We last checked your medical information was correct {{ lastCheckDaysAgo }} days ago. Please ensure the
        following is correct and up to date.
      </div>
      <div v-else>
        We need to confirm your medical information is correct and up to date.
      </div>

      <template #alert>
        <p>
          If no changes are needed, {{
            clickOrTap()
          }} confirm. If you have made changes, {{ clickOrTap() }} the save button.
        </p>
        <p>
          You can always update your medical information on your
          <nuxt-link
            to="/profile"
            class="underline">
            profile.
          </nuxt-link>
        </p>
      </template>
    </medical-info-modal>

    <div v-if="isDev" class="pointer-events-none fixed inset-x-0 bottom-0 sm:px-6 sm:pb-5 lg:px-8">
      <div class="pointer-events-auto flex items-center justify-between gap-x-6 bg-red-500 px-6 py-2.5 sm:rounded-xl sm:py-3 sm:pl-4 sm:pr-3.5">
        <p class="text-sm leading-6 text-white">
          <a href="#">
            <strong class="font-semibold mr-1">Warning!</strong>Site is running in development mode
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { provideUseId } from "@headlessui/vue";
import { differenceInDays } from "date-fns";

const isDev = computed(() => process.env.NODE_ENV === "development");

provideUseId(() => useId());

const user = useDirectusUser();
const { updateUser } = useDirectusUsers();
const key = computed(() => user.value?.id || "");
const preMedicalCheck = useState<boolean>("pre-med-check", () => false);

const showMedicalInfoModal = ref(false);
const lastCheckDaysAgo = ref<number | null>(null);
const route = useRoute();

onMounted(() => {
  tryMedicalInfoCheck();
});

watch(user, () => {
  tryMedicalInfoCheck();
});

function tryMedicalInfoCheck () {
  if (preMedicalCheck.value) {
    console.log("medical form already seen this session");
    return;
  }

  lastCheckDaysAgo.value = null;

  if (user.value) {
    const lastMedicalCheck = user.value.last_med_check;
    if (lastMedicalCheck) {
      const lastCheck = new Date(lastMedicalCheck);

      const daysBetweenChecks = 90;
      lastCheckDaysAgo.value = differenceInDays(new Date(), lastCheck);
      if (lastCheckDaysAgo.value >= daysBetweenChecks) {
        showMedCheck();
      }
    } else {
      showMedCheck();
    }
  }
}

async function onMedicalInfoConfirmed () {
  showMedicalInfoModal.value = false;
  await updateLastMedCheck();
}

function showMedCheck () {
  if (!user.value) {
    return;
  }

  showMedicalInfoModal.value = true;
  umTrackEvent("check-medical-info", { page: route.fullPath });
  user.value.last_med_check = new Date();
}

async function updateLastMedCheck () {
  if (!user.value) {
    return;
  }

  user.value.last_med_check = new Date();
  await updateUser({
    id: user.value.id,
    user: {
      last_med_check: user.value.last_med_check
    }
  });
}

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
  font-weight: normal !important;
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
