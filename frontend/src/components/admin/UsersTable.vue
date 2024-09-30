<script setup lang="ts">
import type {DirectusUser} from "nuxt-directus/dist/runtime/types";
import {formatDistanceToNow} from "date-fns";

const directus = useDirectus();
const {getUsers} = useDirectusUsers();

const page = ref(1);
const itemsPerPage = ref(12);

const searchLoading = ref(false);
const searchQuery = ref<string | null>(null);
const filteredRoles = ref([]);

const sort = ref({
  column: "fullName",
  direction: "desc"
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

const totalItems = computed(() => userData.value.meta.filter_count);

const users = computed(() => userData.value?.data.map(u => ({
  fullName: `${u.first_name} ${u.last_name}`,
  lastAccess: {
    value: timeSinceLastLogin(u),
    class: "hidden md:table-cell"
  },
  ...u,
  email: {
    value: u.email,
    class: "hidden sm:table-cell"
  },
  role: {
    ...u.role,
    name: u.role.name === "Unapproved" ? "Non-member" : u.role.name,
  }
})));

watch([page, filteredRoles], async () => {
  await refresh();
}, {deep: true});

function timeSinceLastLogin(user: DirectusUser) {
  if (user.role.name === "Junior") {
    return null;
  }

  if (!user.last_access) {
    return "Never"
  }
// todo clear search button
  return formatDistanceToNow(new Date(user.last_access), {addSuffix: true});
}


function getSort() {
  const dir = sort.value.direction === "desc" ? "" : "-";

  let result = sort.value.column;

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

const columns = [
  {
    label: "Name",
    key: "fullName",
    sortable: true,
  },
  {
    label: "Email",
    key: "email",
    class: "hidden sm:table-cell"
  },
  {
    label: "Last access",
    key: "lastAccess",
    sortable: true,
    class: "hidden md:table-cell"
  },
  {
    label: "Role",
    key: "role.name",
    sortable: true,
  },
  {
    key: "actions"
  }
]

async function onSort(data: any) {
  sort.value.column = data.column;
  sort.value.direction = data.direction;

  await refresh();
}

const editingUser = ref<DirectusUser | null>(null);
const editingUserModalOpen = ref(false);

function editUser(user: DirectusUser) {
  editingUser.value = {
    ...user,
    email: user.email.value,
  }
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

    <u-table :rows="users"
             :columns="columns"
             v-model:sort="sort"
             :loading="status === 'pending'"
             sort-mode="manual"
             @update:sort="onSort">
      <template #fullName-data="{row}">
        <div class="flex items-center gap-2">
          <UserAvatar :user="row"/>
          <strong>
            {{ row.fullName }}
          </strong>
        </div>
        <dl class="font-normal sm:hidden">
          <dt class="sr-only sm:hidden">Email</dt>
          <dd class="mt-1 truncate text-gray-500 sm:hidden">{{ row.email.value }}</dd>
        </dl>
        <dl class="font-normal sm:hidden">
          <dt class="sr-only sm:hidden">Last access</dt>
          <dd class="mt-1 truncate text-gray-500 sm:hidden">Last access {{ timeSinceLastLogin(row).toLowerCase() }}</dd>
        </dl>
      </template>
      <template #email-data="{row}">
        {{ row.email.value }}
      </template>
      <template #lastAccess-data="{row}">
        {{ row.lastAccess.value }}
      </template>
      <template #actions-data="{row}">
        <div class="text-right">
          <button class="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                  @click="() => editUser(row)">Edit<span class="sr-only">, {{ row.fullName }}</span></button>
        </div>
      </template>
    </u-table>

    <div class="flex items-center justify-center">
      <u-pagination v-model="page"
                    :page-count="itemsPerPage"
                    :total="totalItems"
      />
    </div>

    <user-edit-modal :user="editingUser"
                   :open="editingUserModalOpen"
                   @save="onUserSave"
                   @close="onModalClose"/>
  </div>
</template>

<style scoped lang="scss">

</style>
