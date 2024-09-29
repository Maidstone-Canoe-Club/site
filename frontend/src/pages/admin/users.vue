<script setup lang="ts">
const {getUsers} = useDirectusUsers();

const searchLoading = ref(false);
const searchQuery = ref<string | null>(null);
const itemsPerPage = ref(12);
const page = ref(1);

const {
  data: userData,
  refresh
} = await useAsyncData("admin-users", async () => await fetchUsers());

const {newError} = useErrors();

const users = computed(() => userData.value.data.map(u => ({
  fullName: `${u.first_name} ${u.last_name}`,
  ...u,
  role: {
    ...u.role,
    name: u.role.name === "Unapproved" ? "Non-member" : u.role.name,
  }
})));

const totalItems = computed(() => userData.value.meta.filter_count);

async function fetchUsers() {
  try {
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
        page: page.value,
        limit: itemsPerPage.value,
        search: searchQuery.value || undefined,
        sort: "last_name"
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

async function onSearch() {
  page.value = 1;
  searchLoading.value = true;
  try {
    await refresh();
  }catch(err: any){
    console.error("Error performing user search", err);
    newError({
      message: "Error performing user search",
    })
  }finally {
    searchLoading.value = false;
  }
}

async function onSave(){
  await refresh();
}

watch(page, async () => {
  await refresh();
});

</script>

<template>
  <users-table :users="users"
               v-model:search-query="searchQuery"
               v-model:page="page"
               :search-loading="searchLoading"
               :total-items="totalItems"
               :items-per-page="itemsPerPage"
               @save="onSave"
               @search="onSearch"/>
</template>

<style scoped lang="scss">

</style>
