<template>
  <div class="container reset-password container--md">
    <h1>Set new password</h1>
    <div class="reset-password__form input-group">
      <zxcvbn-input
        v-model="password"
        show-strength
        label="New password"
        :v="v$.password" />
      <input-field
        id="confirm-password"
        v-model="confirmedPassword"
        type="password"
        label="Confirm password"
        :v="v$.confirmedPassword" />
      <custom-button class="btn btn-primary" type="button" :action="onSubmit">
        Submit
      </custom-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref } from "vue";
import { useVuelidate, Validation } from "@vuelidate/core";
import { sameAs, minLength, helpers, required } from "@vuelidate/validators";

const password = ref();
const confirmedPassword = ref();

const { resetPassword } = useDirectusAuth();
const route = useRoute();
const token = route.query.token;

const rules = {
  password: {
    required,
    minLength: minLength(8)
  },
  confirmedPassword: {
    required,
    sameAsRef: helpers.withMessage("The passwords must match", sameAs(password))
  }
};

const v$: Ref<Validation> = useVuelidate(rules, { password, confirmedPassword });

watch([password, confirmedPassword], () => {
  v$.value.$reset();
});

async function onSubmit () {
  v$.value.$touch();

  // todo: get token from query
  // await resetPassword({
  //   token,
  //   password: password.value
  // });

  if (!v$.value.$invalid) {
    try {
      const foo = new Promise(resolve => setTimeout(() => resolve(), 2000));
      await foo;
    } catch {

    }
  }
}
</script>
