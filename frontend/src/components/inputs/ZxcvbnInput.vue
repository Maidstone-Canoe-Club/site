<template>
  <div>
    <div class="flex flex-row gap-1">
      <input-field
        id="password"
        v-model="password"
        :label="label"
        :type="showPassword ? 'text' : 'password'"
        class="flex-grow"
        :v="v" />

      <button
        type="button"
        class="rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        :title="showPassword ? 'Hide password' : 'Show password'"
        @click="showPassword = !showPassword">
        <!--        {{ showPassword ? "hide": "show" }}-->
        <EyeIcon
          v-if="showPassword"
          class="w-5 h-5 text-gray-600" />
        <EyeSlashIcon
          v-else
          class="w-5 h-5 text-gray-600" />
      </button>
    </div>

    <span
      v-if="showStrength"
      class="mt-2 flex flex-row gap-2 justify-between flex-wrap">
      <span
        v-for="index in 4"
        :key="index"
        class="block h-1 flex-grow rounded"
        :class="getBarStyle(index)" />
      <span
        v-if="passwordStrengthLabel"
        class="text-sm flex-grow-0 flex-shrink-0 basis-full text-right -mt-2"
        :class="getLabelColor()">
        {{ passwordStrengthLabel }}
      </span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/solid";
import { ZxcvbnResult } from "@zxcvbn-ts/core";
import { Validation } from "@vuelidate/core";
import { Ref } from "vue";

const { zxcvbnOptions, zxcvbnAsync, debounce } = await import("@zxcvbn-ts/core");
const zxcvbnCommonPackage = await import("@zxcvbn-ts/language-common");

const options = {
  dictionary: {
    ...zxcvbnCommonPackage.default.dictionary
  },
  graphs: zxcvbnCommonPackage.default.adjacencyGraphs
};
zxcvbnOptions.setOptions(options);

const props = defineProps<{
  modelValue?: string,
  label?: string
  v: Validation,
  showStrength?: boolean
}>();

const emit = defineEmits(["update:modelValue"]);

const result: Ref<ZxcvbnResult | null> = ref(null);

const password = computed<string>({
  get () {
    return props.modelValue ?? "";
  },
  set (value) {
    zxcvbnDebounce();
    emit("update:modelValue", value);
  }
});

const showPassword = ref(false);

const useZxcvbn = async () => {
  if (password) {
    result.value = await zxcvbnAsync(password.value);
  } else {
    result.value = null;
  }
};

const passwordStrengthLabel = computed(() => {
  const score: number = result.value?.score ?? 0;
  const labels: string[] = ["Very weak", "So-so", "Ok", "Great!"];
  return labels[score - 1] ?? null;
});

useZxcvbn();
const zxcvbnDebounce = debounce(useZxcvbn, 200, false);

const backgroundColors: string[] = ["bg-red-800", "bg-orange-600", "bg-yellow-500", "bg-lime-600"];
const textColors: string[] = ["text-red-800", "text-orange-600", "text-yellow-500", "text-lime-600"];

function getBarStyle (index: number) {
  const score: number = result.value?.score ?? 0;

  if (index <= score) {
    return backgroundColors[score - 1];
  }
  return "bg-gray-200";
}

function getLabelColor () {
  const score: number = result.value?.score ?? 0;
  return textColors[score - 1] ?? "text-white";
}

</script>

<!--<style lang="scss">-->
<!--.password-strength {-->
<!--  margin-top: .5rem;-->
<!--  display: flex;-->
<!--  flex-direction: row;-->
<!--  gap: .5rem;-->
<!--  justify-content: space-between;-->
<!--  flex-wrap: wrap;-->

<!--  &__bar {-->
<!--    display: block;-->
<!--    height: 3px;-->
<!--    background-color: lightgray;-->
<!--    flex-grow: 1;-->

<!--    &&#45;&#45;red {-->
<!--      background-color: var(&#45;&#45;color-danger-500);-->
<!--    }-->

<!--    &&#45;&#45;orange {-->
<!--      background-color: var(&#45;&#45;color-warning-500);-->
<!--    }-->

<!--    &&#45;&#45;lightgreen {-->
<!--      background-color: var(&#45;&#45;color-success-500);-->
<!--    }-->

<!--    &&#45;&#45;green {-->
<!--      background-color: var(&#45;&#45;color-primary-500);-->
<!--    }-->
<!--  }-->

<!--  &__label {-->
<!--    color: #fff;-->
<!--    font-size: .875rem;-->
<!--    flex: 0 0 100%;-->
<!--    text-align: right;-->
<!--    margin-top: -.25rem;-->

<!--    &&#45;&#45;red {-->
<!--      color: var(&#45;&#45;color-danger-500);-->
<!--    }-->

<!--    &&#45;&#45;orange {-->
<!--      color: var(&#45;&#45;color-warning-600);-->
<!--    }-->

<!--    &&#45;&#45;lightgreen {-->
<!--      color: var(&#45;&#45;color-success-600);-->
<!--    }-->

<!--    &&#45;&#45;green {-->
<!--      color: var(&#45;&#45;color-primary-500);-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</style>-->
