<template>
  <div>
    <div class="space-y-4">
      <input-field
        id="title"
        v-model="internalValue.title"
        required
        label="Title"
        name="title"
        :v="v$.title" />

      <input-wysiwyg
        id="description"
        v-model="internalValue.description"
        label="Description" />

      <input-field
        id="location"
        v-model="internalValue.location"
        label="Location"
        required
        name="location"
        :v="v$.location" />

      <input-dropdown
        v-model="internalValue.allowedRoles"
        multiple
        :options="allowedRoles"
        label="Who can join this event?"
        :v="v$.allowedRole" />

      <input-currency
        v-if="showPrice"
        id="price"
        v-model="internalValue.price"
        label="Price"
        name="price" />

      <input-currency
        v-if="juniorsAllowed"
        id="junior-price"
        v-model="internalValue.junior_price"
        label="Junior price"
        name="junior-price" />

      <input-field
        id="max-spaces"
        v-model="internalValue.max_spaces"
        type="number"
        label="Max spaces"
        name="max-spaces" />
    </div>
    <event-wizard-footer
      :show-back-button="showBackButton"
      can-go-next
      :is-last="isLast"
      @prev="onPrev"
      @next="onNext" />
  </div>
</template>

<script setup lang="ts">
import { useVuelidate, Validation } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { Ref } from "vue";

const emits = defineEmits(["update:modelValue", "prev", "next"]);

const props = defineProps<{
  eventItem: any,
  showBackButton: boolean,
  isLast: boolean
}>();

const internalValue = computed({
  get () {
    return props.eventItem;
  },
  set (val) {
    emits("update:modelValue", val);
  }
});

const allowedRoles = [
  { id: "non-members", name: "Non-members" },
  { id: "members", name: "Members" },
  { id: "juniors", name: "Juniors" },
  { id: "none", name: "No one" }
];

watch(() => internalValue.value.allowedRoles, (val, oldVal) => {
  if (oldVal.length === 1 && oldVal[0].id === "none" && val.length > 1) {
    internalValue.value.allowedRoles = val.filter(x => x.id !== "none");
  } else {
    const noOne = val.find(x => x.id === "none");
    if (noOne && val.length > 1) {
      internalValue.value.allowedRoles.value = [noOne];
    }
  }
}, { deep: true });

const juniorsAllowed = computed(() => !!internalValue.value.allowedRoles.find(x => x.id === 3));
const showPrice = computed(() => !internalValue.value.allowedRoles.find(x => x.id === 4));

const rules = {
  title: { required },
  location: { required },
  allowedRoles: { required }
};

const v$: Ref<Validation> = useVuelidate(rules, internalValue);

function onPrev () {
  emits("prev");
}

function onNext () {
  v$.value.$touch();

  if (!v$.value.$invalid) {
    emits("next");
  }
}

</script>

<style scoped lang="scss">

</style>
