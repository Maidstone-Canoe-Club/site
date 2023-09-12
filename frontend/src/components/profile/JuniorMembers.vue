<template>
  <div>
    <div>
      <table class="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
              Name
            </th>
            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Date of birth
            </th>
            <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">
              <span class="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="junior in juniors" :key="junior.email">
            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
              {{ junior.first_name }} {{ junior.last_name }}
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
              {{ junior.dob }}
            </td>
            <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
              <button
                class="text-indigo-600 hover:text-indigo-900"
                @click="edit(junior)">
                Edit<span class="sr-only">, {{ junior.first_name }} {{ junior.last_name }}</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <button
        class="mt-5 rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        @click="addNew">
        Add new junior
      </button>
    </div>

    <div class="space-y-5">
      <h3 class="font-bold text-xl">
        New junior details
      </h3>
      <div class="space-y-4 max-w-lg">
        <input-field
          id="first-name"
          v-model="newJunior.first_name"
          label="First name"
          name="first-name"
          :v="v$.first_name" />

        <input-field
          id="last-name"
          v-model="newJunior.last_name"
          label="Last name"
          name="last-name"
          :v="v$.last_name" />

        <input-date
          id="dob"
          v-model="newJunior.dob"
          name="dob"
          label="Date of birth"
          :v="v$.dob" />
      </div>

      <medical-information
        v-model="newJunior.medicalInformation"
        checkboxes-label="Does the junior have any of the following:" />

      <custom-button
        :action="createJunior">
        Create junior
      </custom-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { required } from "@vuelidate/validators";
import { useVuelidate, Validation } from "@vuelidate/core";
import { Ref } from "vue";

const user = useDirectusUser();
const { getUsers } = useDirectusUsers();
const { getItems } = useDirectusItems();
const directus = useDirectus();

const mode = ref("");

const newJunior = ref(blankData());

const { data: juniors } = await useAsyncData("juniors-" + user.value.id, async () => {
  return await getUsers({
    params: {
      // TODO: and role === junior
      filter: {
        parent: {
          _eq: user.value.id
        }
      }
    }
  });
});

const rules = {
  first_name: { required },
  last_name: { required },
  dob: { required }
};

const v$: Ref<Validation> = useVuelidate(rules, newJunior);

async function createJunior () {
  v$.value.$touch();

  if (!v$.value.$invalid) {
    try {
      await directus("/juniors/create", {
        method: "POST",
        body: { user: newJunior.value }
      });

      newJunior.value = blankData();
      v$.value.$reset();
    } catch (e) {
      console.error("error creating junior", e);
    }
  }
}

function blankData () {
  return {
    medicalInformation: {},
    parentId: user.value.id
  };
}

function addNew () {
  mode.value = "new";
}

async function edit (junior) {
  try {
    const medicalInfoList = await getItems({
      collection: "medical_info",
      params: {
        filter: {
          user: {
            _eq: junior.id
          }
        }
      }
    });
    const medicalInfo = medicalInfoList.length ? medicalInfoList[0] : null;
    console.log("medical info", medicalInfo);

    mode.value = "edit";
    junior.medicalInformation = medicalInfo;
    newJunior.value = junior;
  } catch (e) {
    console.error("could not load medical info for junior", e);
  }
}

</script>

<style scoped lang="scss">

</style>
