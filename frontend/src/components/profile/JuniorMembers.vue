<template>
  <div>
    <div>
      <div v-if="!juniors || !juniors.length">
        No junior accounts created
      </div>
      <table
        v-else
        class="min-w-full divide-y divide-gray-300">
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
              {{ formatDate(junior.dob) }}
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
        v-if="!mode"
        class="mt-5 rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        @click="addNew">
        Add new junior
      </button>
    </div>

    <junior-form
      v-if="mode"
      v-model="juniorValue"
      class="mt-5"
      :mode="mode"
      @complete="onFormComplete" />
  </div>
</template>

<script setup lang="ts">
import { format } from "date-fns";

const user = useDirectusUser();
const { getUsers } = useDirectusUsers();
const { getItems } = useDirectusItems();

const mode = ref<"create" | "edit" | null>(null);

const juniorValue = ref(blankData());

const { data: juniors } = await useAsyncData("juniors-" + user.value.id, async () => {
  return await loadData();
});

async function loadData () {
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
}

async function onFormComplete () {
  mode.value = null;
  juniorValue.value = blankData();
  juniors.value = await loadData();
}

function blankData () {
  return {
    medicalInformation: {},
    parentId: user.value.id
  };
}

function addNew () {
  mode.value = "create";
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

    const clone = { ...junior };
    clone.medicalInformation = medicalInfo;
    juniorValue.value = clone;

    mode.value = "edit";
  } catch (e) {
    console.error("could not load medical info for junior", e);
  }
}

function formatDate (input: string) {
  return format(new Date(input), "do MMMM yyyy");
}

</script>

<style scoped lang="scss">

</style>
