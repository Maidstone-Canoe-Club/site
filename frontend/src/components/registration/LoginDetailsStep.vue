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
        <div class="flex items-center justify-between">
          <label for="password" class="block text-sm font-medium leading-6 text-gray-900">Password</label>
        </div>
        <div class="mt-2">
          <zxcvbn-input
            v-model="internalValue.password"
            show-strength
            :v="v$.password" />
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-4 mt-14">
      <custom-button
        class="flex-grow rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        type="submit"
        :action="onSubmit">
        Next
      </custom-button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useVuelidate, Validation } from "@vuelidate/core";
import { minLength, required, email as emailValidator } from "@vuelidate/validators";
import { DirectusUser } from "nuxt-directus/dist/runtime/types";
import { InviteData } from "~/types";

const emits = defineEmits(["update:modelValue", "onNext"]);

const props = defineProps<{
  modelValue: DirectusUser,
  inviteId?: string
}>();

const internalValue = ref(props.modelValue);
const directus = useDirectus();

watch(() => props.modelValue, (val) => {
  internalValue.value = val;
}, { deep: true });

watch(internalValue, (val) => {
  emits("update:modelValue", val);
}, { deep: true });

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

  if (!v$.value.$invalid) {
    if (!props.inviteId) {
      try {
        const inviteInfo = await directus<InviteData>(`/invites?email=${internalValue.value!.email}`);

        if (inviteInfo) {
          console.log("got invite info", inviteInfo);
          internalValue.value!.email = inviteInfo.email;
          internalValue.value!.bc_number = inviteInfo.bc_number;
          internalValue.value!.club_number = inviteInfo.club_number;
          internalValue.value!.first_name = inviteInfo.first_name;
          internalValue.value!.last_name = inviteInfo.last_name;
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
