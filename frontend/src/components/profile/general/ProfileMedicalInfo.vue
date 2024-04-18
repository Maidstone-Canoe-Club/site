<template>
  <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl" @submit.prevent>
    <div class="px-4 py-6 sm:p-8">
      <medical-information
        v-if="medicalInfo"
        v-model="medicalInfo"
        hide-heading />
    </div>
    <div class="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
      <custom-button
        type="submit"
        :action="onSave">
        Save
      </custom-button>
    </div>
  </div>
</template>

<script setup lang="ts">

const { getItems, updateItem, createItems } = useDirectusItems();
const user = useDirectusUser();

const { data: medicalInfo } = await useAsyncData(`medical-info-${user.value!.id}`, async () => {
  return await loadData();
});

async function loadData () {
  const items = await getItems({
    collection: "medical_info",
    params: {
      filter: {
        user: {
          _eq: user.value!.id
        }
      }
    }
  });

  return items && items.length ? items[0] : {};
}

async function onSave () {
  try {
    const toSave = {
      allergies: medicalInfo.value.allergies,
      asthma: medicalInfo.value.asthma,
      diabetes: medicalInfo.value.diabetes,
      epilepsy: medicalInfo.value.epilepsy,
      other: medicalInfo.value.other,
      details: medicalInfo.value.details
    };

    if (medicalInfo.value.id) {
      await updateItem({
        collection: "medical_info",
        id: medicalInfo.value.id,
        item: toSave
      });
    } else {
      toSave.user = user.value.id;

      await createItems({
        collection: "medical_info",
        items: [toSave]
      });
    }

    await loadData();
  } catch (e) {
    console.error("error updating medical information", e);
  }
}

</script>

<style scoped lang="scss">

</style>
