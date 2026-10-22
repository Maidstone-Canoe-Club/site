<script setup lang="ts">
import type {DirectusUser} from "nuxt-directus/dist/runtime/types";
import {formatDistanceToNow} from "date-fns";
import {ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpDownIcon, ChevronUpIcon} from "@heroicons/vue/20/solid";

type SortColumn = "fullName" | "lastAccess" | "role.name";

const directus = useDirectus();
const {getUsers} = useDirectusUsers();

const page = ref(1);
const itemsPerPage = ref(12);

const searchLoading = ref(false);
const searchQuery = ref<string | null>(null);
const filteredRoles = ref([]);

const sort = ref<{ column: SortColumn, direction: "asc" | "desc" }>({
  column: "fullName",
  direction: "asc"
});

const {
  data: userData,
  refresh,
  status
} = await useAsyncData("admin-users", async () => await fetchUsers());

const {data: roles} = await useAsyncData("directus-roles", async () => await fetchRoles());

async function fetchRoles() {
  const foundRoles = await directus("/roles");
  return foundRoles.data;
}

const rolesOptions = computed(() => {
  return roles.value.map(r => ({
    name: r.name === "Unapproved" ? "Non-member" : r.name,
    id: r.id,
  }));
});

const totalItems = computed(() => userData.value?.meta.filter_count ?? 0);
const pageCount = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)));

// Page numbers to show, with null standing in for a gap ("...")
const pageLinks = computed<(number | null)[]>(() => {
  const count = pageCount.value;
  const current = page.value;
  const pages = [...new Set([1, current - 1, current, current + 1, count])]
    .filter(p => p >= 1 && p <= count)
    .sort((a, b) => a - b);

  const result: (number | null)[] = [];
  pages.forEach((p, index) => {
    if (index > 0 && p - pages[index - 1]! > 1) {
      result.push(null);
    }
    result.push(p);
  });
  return result;
});

const users = computed(() => userData.value?.data.map(u => ({
  ...u,
  fullName: `${u.first_name} ${u.last_name}`,
  lastAccess: timeSinceLastLogin(u),
  role: {
    ...u.role,
    name: u.role.name === "Unapproved" ? "Non-member" : u.role.name,
  }
})) ?? []);

watch([page, filteredRoles], async () => {
  await refresh();
}, {deep: true});

function timeSinceLastLogin(user: DirectusUser) {
  if (!user.last_access) {
    return "Never"
  }

  return formatDistanceToNow(new Date(user.last_access), {addSuffix: true});
}


function getSort() {
  const dir = sort.value.direction === "asc" ? "" : "-";

  let result: string = sort.value.column;

  if (sort.value.column === "fullName") {
    result = "last_name";
  } else if (sort.value.column === "lastAccess") {
    result = "last_access";
  }

  return dir + result;
}

async function fetchUsers() {
  try {

    let filter = null;

    if (filteredRoles.value?.length) {
      filter = {
        role: {
          name: {
            "_in": filteredRoles.value.map(r => r.name === "Non-member" ? "Unapproved" : r.name)
          }
        }
      }
    }

    const users = await getUsers({
      params: {
        meta: "filter_count",
        fields: [
          "id",
          "first_name",
          "last_name",
          "email",
          "avatar",
          "last_access",
          "bc_number",
          "club_number",
          "dob",
          "role",
          "role.id",
          "role.name"
        ],
        filter,
        page: page.value,
        limit: itemsPerPage.value,
        search: searchQuery.value || undefined,
        sort: getSort()
      },

    });

    if (!users.data) {
      return null;
    }

    return users;
  } catch (err: any) {
    console.log("error", err);
    newError({
      message: "Unable to load users"
    });
    return null;
  }
}

const sortableColumns: { label: string, key: SortColumn, class?: string }[] = [
  {
    label: "Name",
    key: "fullName"
  },
  {
    label: "Last access",
    key: "lastAccess",
    class: "hidden md:table-cell"
  },
  {
    label: "Role",
    key: "role.name"
  }
];

async function onSort(column: SortColumn) {
  if (sort.value.column === column) {
    sort.value.direction = sort.value.direction === "asc" ? "desc" : "asc";
  } else {
    sort.value = {column, direction: "asc"};
  }

  await refresh();
}

function goToPage(target: number) {
  page.value = Math.min(Math.max(target, 1), pageCount.value);
}

const editingUser = ref<DirectusUser | null>(null);
const editingUserModalOpen = ref(false);

function editUser(user: DirectusUser) {
  editingUser.value = {...user};
  editingUserModalOpen.value = true;
}

function onModalClose() {
  editingUserModalOpen.value = false;
}

async function onUserSave() {
  await refresh();
}

async function onSearch() {
  page.value = 1;
  searchLoading.value = true;
  try {
    await refresh();
  } catch (err: any) {
    console.error("Error performing user search", err);
    newError({
      message: "Error performing user search",
    })
  } finally {
    searchLoading.value = false;
  }
}

async function clearSearch() {
  searchQuery.value = null;
  await onSearch();
}

</script>

<template>
  <div class="space-y-6 mt-8">
    <h1 class="text-base font-semibold leading-6 text-gray-900">User Admin</h1>

    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">

      <input-dropdown id="role-filter"
                      v-model="filteredRoles"
                      name="role-filter"
                      placeholder="Filter by role"
                      class="min-w-[200px]"
                      hide-selected
                      :options="rolesOptions"
                      multiple></input-dropdown>

      <form class="flex gap-1"
            @submit.prevent="onSearch">
        <input-field placeholder="Search users"
                     class="flex-grow"
                     id="user-search"
                     name="user-search"
                     :disabled="searchLoading"
                     v-model="searchQuery"/>
        <a-button variant="primary"
                  :loading="searchLoading"
                  size="sm"
                  type="submit">Search
        </a-button>
        <a-button variant="outline"
                  size="sm"
                  :action="clearSearch">
          Clear
        </a-button>
      </form>
    </div>

    <div class="relative -mx-4 sm:-mx-0">
      <table class="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <template v-for="(column, index) in sortableColumns" :key="column.key">
              <th scope="col"
                  class="py-3.5 text-left text-sm font-semibold text-gray-900"
                  :class="[index === 0 ? 'pl-4 pr-3 sm:pl-0' : 'px-3', column.class]"
                  :aria-sort="sort.column === column.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined">
                <button type="button"
                        class="group inline-flex items-center gap-1"
                        @click="onSort(column.key)">
                  {{ column.label }}
                  <ChevronUpIcon v-if="sort.column === column.key && sort.direction === 'asc'" class="size-4 text-gray-900" aria-hidden="true"/>
                  <ChevronDownIcon v-else-if="sort.column === column.key" class="size-4 text-gray-900" aria-hidden="true"/>
                  <ChevronUpDownIcon v-else class="size-4 text-gray-400 group-hover:text-gray-600" aria-hidden="true"/>
                </button>
              </th>
              <th v-if="index === 0"
                  scope="col"
                  class="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell">
                Email
              </th>
            </template>
            <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">
              <span class="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="!users.length">
            <td colspan="5" class="py-8 text-center text-sm text-gray-500">
              {{ status === 'pending' ? 'Loading users...' : 'No users found' }}
            </td>
          </tr>
          <tr v-for="row in users" :key="row.id">
            <td class="w-full max-w-0 py-4 pl-4 pr-3 text-sm text-gray-900 sm:w-auto sm:max-w-none sm:pl-0">
              <div class="flex items-center gap-2">
                <UserAvatar :user="row"/>
                <strong>
                  {{ row.fullName }}
                </strong>
              </div>
              <dl class="font-normal sm:hidden">
                <dt class="sr-only">Email</dt>
                <dd class="mt-1 truncate text-gray-500">{{ row.email }}</dd>
              </dl>
              <dl class="font-normal md:hidden">
                <dt class="sr-only">Last access</dt>
                <dd class="mt-1 truncate text-gray-500">Last access {{ row.lastAccess.toLowerCase() }}</dd>
              </dl>
            </td>
            <td class="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
              {{ row.email }}
            </td>
            <td class="hidden px-3 py-4 text-sm text-gray-500 md:table-cell">
              {{ row.lastAccess }}
            </td>
            <td class="px-3 py-4 text-sm text-gray-500">
              {{ row.role.name }}
            </td>
            <td class="py-4 pl-3 pr-4 text-right text-sm sm:pr-0">
              <button class="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                      @click="() => editUser(row)">Edit<span class="sr-only">, {{ row.fullName }}</span></button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="status === 'pending' && users.length"
           class="absolute inset-0 flex items-center justify-center bg-white/60">
        <loading-spinner color="#6366F1"/>
      </div>
    </div>

    <nav v-if="pageCount > 1"
         class="flex items-center justify-center gap-1"
         aria-label="Pagination">
      <button type="button"
              class="inline-flex items-center rounded-md px-2 py-2 text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent"
              :disabled="page === 1"
              @click="goToPage(page - 1)">
        <span class="sr-only">Previous</span>
        <ChevronLeftIcon class="size-5" aria-hidden="true"/>
      </button>
      <template v-for="(link, index) in pageLinks" :key="index">
        <span v-if="link === null" class="px-2 text-sm text-gray-500">...</span>
        <button v-else
                type="button"
                class="min-w-9 rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset"
                :class="link === page ? 'bg-indigo-600 text-white ring-indigo-600' : 'text-gray-900 ring-gray-300 hover:bg-gray-50'"
                :aria-current="link === page ? 'page' : undefined"
                @click="goToPage(link)">
          {{ link }}
        </button>
      </template>
      <button type="button"
              class="inline-flex items-center rounded-md px-2 py-2 text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent"
              :disabled="page === pageCount"
              @click="goToPage(page + 1)">
        <span class="sr-only">Next</span>
        <ChevronRightIcon class="size-5" aria-hidden="true"/>
      </button>
    </nav>

    <user-edit-modal :user="editingUser"
                   :open="editingUserModalOpen"
                   @save="onUserSave"
                   @close="onModalClose"/>
  </div>
</template>

<style scoped lang="scss">

</style>
