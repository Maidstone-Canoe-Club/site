<script setup lang="ts">
import type {DirectusUser} from "nuxt-directus/dist/runtime/types";

defineProps<{
  users: DirectusUser[] | null,
  itemsPerPage: number,
  totalItems: number
}>();

const emits = defineEmits(["search"])

const page = defineModel("page", {required: true});
const searchQuery = defineModel("searchQuery", {required: true});

const editingUser = ref<DirectusUser | null>(null);
const editingUserModalOpen = ref(false);

function editUser(user: DirectusUser) {
  editingUser.value = user;
  editingUserModalOpen.value = true;
}

function onModalClose() {
  editingUserModalOpen.value = false;
}

function onPrevPage() {
  page.value -= 1;
}

function onNextPage() {
  page.value += 1;
}

function onSearch() {
  emits("search");
}

</script>

<template>
  <div class="mt-8">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center justify-between">
        <h1 class="text-base font-semibold leading-6 text-gray-900">Users</h1>
        <form class="flex gap-1" @submit.prevent="onSearch">
          <input-field placeholder="Search users"
                       v-model="searchQuery"/>
          <a-button variant="outline"
                    size="sm"
                    type="submit">Search
          </a-button>
        </form>
      </div>
      <div class="-mx-4 mt-8 sm:-mx-0">
        <table class="min-w-full divide-y divide-gray-300">
          <thead>
          <tr>
            <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Name</th>
            <th scope="col" class="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell">
              Email
            </th>
            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
            <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">
              <span class="sr-only">Edit</span>
            </th>
          </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id">
            <td class="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-0">
              <div class="flex items-center gap-2">
                <UserAvatar :user="user"/>
                {{ user.fullName }}
              </div>
              <dl class="font-normal lg:hidden">
                <dt class="sr-only">Title</dt>
                <dt class="sr-only sm:hidden">Email</dt>
                <dd class="mt-1 truncate text-gray-500 sm:hidden">{{ user.email }}</dd>
              </dl>
            </td>
            <td class="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
              {{ user.email }}
            </td>
            <td class="px-3 py-4 text-sm text-gray-500">{{ user.role.name }}</td>
            <td class="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
              <button class="text-indigo-600 hover:text-indigo-900" @click="() => editUser(user)">
                Edit<span class="sr-only">, {{ user.fullName }}</span>
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <simple-pagination :items-per-page="itemsPerPage"
                       :total-items="totalItems"
                       :page="page"
                       @prev="onPrevPage"
                       @next="onNextPage"/>
    <UserEditModal :user="editingUser" :open="editingUserModalOpen"
                   @close="onModalClose"/>
  </div>
</template>

<style scoped lang="scss">

</style>
