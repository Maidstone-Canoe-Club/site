<template>
  <form @submit.prevent>
    <div class="space-y-6">
      <div>
        <label for="email" class="block text-sm font-medium leading-6 text-gray-900">Email address</label>
        <div class="mt-2">
          <input-field
            id="email"
            v-model="internalValue.email"
            name="email"
            type="email"
            autocomplete="email"
            required
            :v="v$.email" />
        </div>
      </div>

      <div>
        <zxcvbn-input
          v-model="internalValue.password"
          label="Password"
          show-strength
          :v="v$.password" />
      </div>
    </div>

    <div class="flex flex-col gap-4 mt-14">
      <div
        v-if="emailInUse"
        class="rounded-md bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <XCircleIcon class="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              That email address is already in use, please try another
            </h3>
          </div>
        </div>
      </div>

      <custom-button
        class="flex-grow rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        type="submit"
        :disabled="emailInUse"
        :action="onSubmit">
        Next
      </custom-button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { XCircleIcon } from "@heroicons/vue/20/solid";
import { useVuelidate, Validation } from "@vuelidate/core";
import { minLength, required, email as emailValidator } from "@vuelidate/validators";
import { DirectusUser } from "nuxt-directus/dist/runtime/types";
import { InviteCheckResult } from "~/types";

const emits = defineEmits(["update:modelValue", "onNext", "invite"]);

const props = defineProps<{
  modelValue: DirectusUser,
  inviteId?: string
}>();

const internalValue = ref(props.modelValue);
const directus = useDirectus();

const emailInUse = ref(false);

watch(() => props.modelValue, (val) => {
  internalValue.value = val;
}, { deep: true });

watch(internalValue, (val) => {
  emits("update:modelValue", val);
}, { deep: true });

watch(() => internalValue.value.email, () => {
  if (emailInUse.value) {
    emailInUse.value = false;
  }
});

const rules = {
  email: {
    required,
    emailValidator
  },
  password: {
    required,
    minLength: minLength(8)
  }
};

const v$: Ref<Validation> = useVuelidate(rules, internalValue);

async function onSubmit () {
  v$.value.$touch();

  if (!v$.value.$invalid && !emailInUse.value) {
    emailInUse.value = false;
    if (!props.inviteId) {
      try {
        const existingEmail = await directus(`/registration/check?email=${internalValue.value!.email}`);

        if (existingEmail && !existingEmail.result) {
          emailInUse.value = true;
          return;
        }

        const inviteInfo = await directus<InviteCheckResult>(`/invites?email=${internalValue.value!.email}`);

        if (inviteInfo.result && inviteInfo.invite) {
          const invite = inviteInfo.invite;
          internalValue.value!.email = invite.email;
          internalValue.value!.bc_number = invite.bc_number;
          internalValue.value!.club_number = invite.club_number;
          internalValue.value!.first_name = invite.first_name;
          internalValue.value!.last_name = invite.last_name;
          emits("invite", invite.id);
        }
      } catch (e) {
        console.log("could not load invite");
      }
    }

    emits("onNext");
  }
}

</script>

<style scoped lang="scss">

</style>
