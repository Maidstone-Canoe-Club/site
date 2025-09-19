<template>
  <div class="mt-20">
    <div class="mb-10">
      <p class="mb-4">
        Input the csv of the users you wish to send invites for. If a user already has an invite they will not be added again. If a user does not have an email address, they will not be added.
      </p>
      <pre class="mb-4">first_name, last_name, email_address, club_number, bc_number</pre>
      <textarea
        v-model="input"
        rows="4"
        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
    </div>
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-base font-semibold leading-6 text-gray-900">
            New Invites
          </h1>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            @click="createInvites">
            Create {{ people.length }} invites
          </button>
        </div>
      </div>
      <div class="mt-8 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table class="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                    First name
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    First name
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Club number
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    BC number
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="person in people" :key="person.email">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                    {{ person.firstName }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                    {{ person.lastName }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                    {{ person.email }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                    {{ person.clubNumber }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                    {{ person.bcNumber }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-base font-semibold leading-6 text-gray-900">
            Existing Invites
          </h1>
        </div>
      </div>
      <div class="mt-8 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table class="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                    First name
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    First name
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Club number
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    BC number
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="person in existingInvites" :key="person.email">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                    {{ person.first_name }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                    {{ person.last_name }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                    {{ person.email }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                    {{ person.club_number }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                    {{ person.bc_number }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

definePageMeta({
  middleware: ["auth", "admin"]
});

const { getItems, createItems } = useDirectusItems();

const { data: existingInvites } = await useAsyncData("invites", async () => {
  return await getItems({
    collection: "member_invites",
    params: {
      limit: 9999
    }
  });
});

const input = ref("");

const people = computed(() => {
  if (!input.value) {
    return [];
  }

  const result = [];
  const lines = input.value.split("\n");
  lines.forEach((line) => {
    const split = line.split(",");
    const email = split[2];
    if (email && !alreadyExists(email)) {
      result.push({
        firstName: split[0],
        lastName: split[1],
        email,
        clubNumber: split[3],
        bcNumber: split[4].includes("-") ? null : split[4]
      });
    }
  });

  return result;
});

watch(input, (val) => {
  const lines = val.split("\n");
  console.log("found ", lines.length, "lines");
});

function alreadyExists (email: string) {
  if (existingInvites.value && existingInvites.value.length) {
    return !!existingInvites.value.find(x => x.email === email);
  }

  return false;
}

async function createInvites () {
  console.log("creating invites...");
  try {
    await createItems({
      collection: "member_invites",
      items: people.value.map(p => ({
        first_name: p.firstName,
        last_name: p.lastName,
        email: p.email,
        club_number: p.clubNumber,
        bc_number: p.bcNumber
      }))
    });
    console.log("created invites!");
  } catch (e) {
    console.error("error creating invites", e);
  }
}

</script>

<style scoped lang="scss">

</style>
