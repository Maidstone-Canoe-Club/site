<script setup lang="ts">

export type RadioGroupOption = {
  id: string,
  name: string,
  description?: string,
  disabled?: boolean
}

defineProps<{
  options: RadioGroupOption[],
  label?: string
  hideLabel?: string
  by?: string
}>();

const selected = defineModel<string>({
  required: true
});

</script>

<template>
  <RadioGroup
    v-model="selected"
    :by="by">
    <RadioGroupLabel :class="[hideLabel ? 'sr-only' : 'block text-sm font-medium leading-6 text-gray-900 mb-2']">
      Paddle type
    </RadioGroupLabel>
    <div class="-space-y-px rounded-md bg-white">
      <RadioGroupOption
        v-for="(option, index) in options"
        id="id"
        :key="option.id"
        v-slot="{ checked, active }"
        :disabled="option.disabled"
        as="template"
        :value="option">
        <div
          :class="[
            index === 0 ? 'rounded-tl-md rounded-tr-md' : '',
            index === options.length - 1 ? 'rounded-bl-md rounded-br-md' : '',
            checked ? 'z-10 border-indigo-200 bg-indigo-50' : 'border-gray-200',
            'relative flex cursor-pointer border p-4 focus:outline-none',
            option.disabled ? 'opacity-60' : '']">
          <span
            :class="[checked ? 'bg-indigo-600 border-transparent' : 'bg-white border-gray-300', active ? 'ring-2 ring-offset-2 ring-indigo-600' : '', 'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-full border flex items-center justify-center']"
            aria-hidden="true">
            <span class="rounded-full bg-white w-1.5 h-1.5" />
          </span>
          <span class="ml-3 flex flex-col">
            <RadioGroupLabel
              as="span"
              :class="[checked ? 'text-indigo-900' : 'text-gray-900', 'block text-sm font-medium']">{{
                option.name
              }}</RadioGroupLabel>
            <RadioGroupDescription
              as="span"
              :class="[checked ? 'text-indigo-700' : 'text-gray-500', 'block text-sm']">{{
                option.description
              }}</RadioGroupDescription>
          </span>
        </div>
      </RadioGroupOption>
    </div>
  </RadioGroup>
</template>

<style scoped lang="scss">

</style>
