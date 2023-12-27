<template>
  <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
    <div class="px-4 py-6 sm:p-8">
      <emergency-contact-information
        v-model="contacts"
        :show-validation="showContactsValidation"
        add-button-label="Add" />
    </div>
    <div class="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
      <a-button
        type="submit"
        :action="onSave">
        Save
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">

const { getItems, createItems, deleteItems } = useDirectusItems();
const user = useDirectusUser();

const { data: contacts } = await useAsyncData("emergency-contacts", async () => {
  return await loadData();
});

const showContactsValidation = ref(false);

async function loadData () {
  const items = await getItems({
    collection: "emergency_contacts",
    params: {
      filter: {
        user: {
          _eq: user.value!.id
        }
      }
    }
  });

  return items || [];
}

async function onSave () {
  showContactsValidation.value = false;

  if (!contacts.value.length) {
    showContactsValidation.value = true;
    return;
  }

  try {
    const toAdd = [];
    const toRemove = [];

    for (const contact of contacts.value) {
      if (contact.shouldRemove) {
        toRemove.push(contact);
      } else if (!contact.id) {
        toAdd.push(contact);
      }
    }

    if (toAdd.length) {
      await createItems({
        collection: "emergency_contacts",
        items: toAdd
      });
    }

    if (toRemove.length) {
      await deleteItems({
        collection: "emergency_contacts",
        items: toRemove.map(x => x.id)
      });
    }

    if (toAdd.length || toRemove.length) {
      await loadData();
    }
  } catch (e) {
    console.error("error saving emergency contacts", e);
  }
}

</script>

<style scoped lang="scss">

</style>
