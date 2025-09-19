<script setup lang="ts">
import { ClipboardDocumentCheckIcon } from "@heroicons/vue/24/outline";
import { useCloned } from "@vueuse/core";

const emits = defineEmits(["update:open", "dismiss", "refresh"]);

const props = defineProps<{
  open: boolean,
  bookings: any
}>();

const internalBookings = ref();

const errorMessage = ref<string | null>(null);
const internalIsOpen = ref(props.open);
const notesIndex = ref<number | null>(null);
const { updateItem } = useDirectusItems();

watch(() => props.open, (val) => {
  if (val) {
    const clone = useCloned(props.bookings);
    internalBookings.value = clone.cloned.value;
  }
  internalIsOpen.value = val;
}, { immediate: true });

watch(internalIsOpen, (val) => {
  emits("update:open");
  if (!val) {
    emits("dismiss");
  } else {
    notesIndex.value = null;
    errorMessage.value = null;
  }
});

function showNotes (index: number) {
  if (index === notesIndex.value) {
    notesIndex.value = null;
  } else {
    notesIndex.value = index;
  }
}

async function onSave () {
  try {
    let updated = false;
    for (const booking of internalBookings.value) {
      if (hasChanged(booking)) {
        await updateItem({
          collection: "event_bookings",
          id: booking.id,
          item: {
            attended: booking.attended,
            completed: booking.completed,
            attendance_notes: booking.attendance_notes
          }
        });
        updated = true;
      }
    }

    if (updated) {
      emits("refresh");
    }

    internalIsOpen.value = false;
  } catch (e: any) {
    console.error("Error updating event attendance", e);
    errorMessage.value = "Something went wrong updating attendance";
  }
}

function hasChanged (booking: any) {
  const original = props.bookings.find(b => b.id === booking.id);
  return !deepEqual(booking, original);
}

</script>

<template>
  <TransitionRoot as="template" :show="internalIsOpen">
    <Dialog as="div" class="relative z-10" @close="internalIsOpen = false">
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
              class="relative w-full transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div class="mb-3 flex gap-1.5 items-center text-lg">
                  <ClipboardDocumentCheckIcon class="size-6" />
                  <strong class="">Event attendance</strong>
                </div>
                <table v-if="internalBookings" class="min-w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        class="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter">
                        Attendee
                      </th>
                      <th
                        scope="col"
                        class="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter">
                        Attended
                      </th>
                      <th
                        scope="col"
                        class="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter">
                        Completed
                      </th>
                      <th
                        scope="col"
                        class="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-3 backdrop-blur backdrop-filter">
                        <span class="sr-only">Notes</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <template
                      v-for="(booking, index) in internalBookings"
                      :key="booking.id">
                      <tr>
                        <td
                          :class="[index !== internalBookings.length - 1 && index !== notesIndex ? 'border-b border-gray-200' : '', 'whitespace-nowrap py-4  pr-3 text-sm font-bold text-gray-900']">
                          {{ booking.user.first_name }} {{ booking.user.last_name }}
                        </td>
                        <td
                          :class="[index !== internalBookings.length - 1 && index !== notesIndex ? 'border-b border-gray-200' : '', 'whitespace-nowrap px-3 py-4 text-sm text-gray-500']">
                          <input-toggle
                            v-model="booking.attended"
                            icons />
                        </td>
                        <td
                          :class="[index !== internalBookings.length - 1 && index !== notesIndex? 'border-b border-gray-200' : '', 'whitespace-nowrap px-3 py-4 text-sm text-gray-500']">
                          <input-toggle
                            v-model="booking.completed"
                            icons />
                        </td>
                        <td
                          :class="[index !== internalBookings.length - 1 && index !== notesIndex ? 'border-b border-gray-200' : '', 'relative whitespace-nowrap py-4 pl-3 text-right text-sm font-medium']">
                          <button
                            type="button"
                            class="text-indigo-600 hover:text-indigo-900"
                            @click="() => showNotes(index)">
                            {{ index === notesIndex ? "Hide notes" : "Notes" }}
                          </button>
                        </td>
                      </tr>
                      <tr v-if="index === notesIndex" class="w-full">
                        <th
                          colspan="4"
                          :class="[index !== internalBookings.length - 1 ? 'border-b border-gray-200' : '']">
                          <input-text-area
                            v-model="booking.attendance_notes"
                            class="w-full mb-5 font-medium" />
                        </th>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>

              <div
                v-if="errorMessage"
                class=" px-4 py-3 text-red-600">
                <p>{{ errorMessage }}</p>
              </div>

              <div class="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <a-button
                  class="w-full sm:ml-3 sm:w-auto"
                  type="button"
                  variant="primary"
                  :action="onSave">
                  Save
                </a-button>
                <button
                  ref="cancelButtonRef"
                  type="button"
                  class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  @click="internalIsOpen = false">
                  Cancel
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
