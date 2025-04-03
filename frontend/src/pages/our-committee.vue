<script setup lang="ts">

useHead({
  title: "Our committee"
});

type CommitteeUser = {
  first_name: string,
  last_name: string,
  id: string
}

type CommitteeMember = {
  user?: CommitteeUser,
  role?: string,
  first_name?: string,
  last_name?: string
}

const { getItems } = useDirectusItems();

const userToContact = ref<CommitteeUser | null>(null);
const openContactFormModal = ref(false);

const data = await useAsyncData("committee", async () => {
  return await getItems<CommitteeMember>({
    collection: "committee",
    params: {
      fields: [
        "*",
        "user.first_name",
        "user.last_name",
        "user.id",
        "user.avatar"
      ]
    }
  });
});

const committeeMembers = computed<CommitteeMember[]>(() => {
  if (data.data.value) {
    return data.data.value
      .sort((a: CommitteeMember, b: CommitteeMember) => {
        const textA = (a.user?.last_name ?? a.last_name)?.toUpperCase() ?? Infinity;
        const textB = (b.user?.last_name ?? b.last_name)?.toUpperCase() ?? Infinity;

        if (textA === Infinity) {
          return 1;
        }
        if (textB === Infinity) {
          return -1;
        }

        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });
  }

  return [];
});

function onContact (user: any) {
  userToContact.value = user;
  openContactFormModal.value = true;
}

function onCloseModal () {
  openContactFormModal.value = false;
}

</script>

<template>
  <section class="mx-auto max-w-3xl mt-8 px-3 sm:px-0">
    <h1 class="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
      Committee Members
    </h1>
    <div
      v-if="committeeMembers && committeeMembers.length"
      class="space-y-5">
      <div
        v-for="(committeeMember, index) in committeeMembers"
        :key="index">
        <div class="flex gap-5 items-center ">
          <user-avatar
            :user="committeeMember.user"
            :image-size="64"
            size-class="size-16" />
          <div class="flex flex-col gap-0.5">
            <span class="font-semibold">
              {{
                committeeMember.user?.first_name || committeeMember.first_name
              }} {{ committeeMember.user?.last_name || committeeMember.last_name }}
            </span>
            <span
              v-if="committeeMember.role"
              class="text-sm">{{ committeeMember.role }}</span>
            <beta-wrapper hide-indicator>
              <a-button
                v-if="committeeMember.user"
                size="xs"
                variant="outline"
                @click="() => onContact(committeeMember.user)">
                Contact
              </a-button>
            </beta-wrapper>
          </div>
        </div>
      </div>

      <TransitionRoot as="template" :show="openContactFormModal">
        <Dialog as="div" class="relative z-10">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="ease-in duration-200"
            leave-from="opacity-100"
            leave-to="opacity-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </TransitionChild>

          <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <TransitionChild
                as="template"
                enter="ease-out duration-300"
                enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enter-to="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leave-from="opacity-100 translate-y-0 sm:scale-100"
                leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                <DialogPanel
                  class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 w-full sm:max-w-sm sm:p-6">
                  <div class="space-y-3">
                    <strong>Send {{ userToContact?.first_name }} {{ userToContact?.last_name }} a message</strong>
                    <contact-user-form
                      :user-id="userToContact?.id!"
                      @close="onCloseModal" />
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>
    </div>
    <p v-else>
      Uh oh! No committee members found!
    </p>
  </section>
</template>

<style scoped lang="scss">

</style>
