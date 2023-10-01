<template>
  <main class="mt-[77vh]">
    <!--    <div class="mx-auto w-full max-w-7xl flex-grow px-4 sm:px-6 lg-px-8">-->
    <!--      <h1 class="text-4xl font-bold">-->
    <!--        Maidstone Canoe Club-->
    <!--      </h1>-->
    <!--      <p class="sm:w-2/3 mt-3">-->
    <!--        Lorem ipsum dolor sit amet. Et sunt libero qui laborum impedit qui perferendis velit qui fugiat numquam. Eum-->
    <!--        rerum quia aut quia laudantium At beatae voluptatem et ipsum nemo non impedit quisquam. Sit cumque dolorem aut-->
    <!--        unde eligendi qui sunt soluta. Sit nemo dolores hic voluptates quam est aliquid soluta ab aliquam nostrum ea-->
    <!--        nihil unde aut magni laudantium.-->
    <!--      </p>-->
    <!--    </div>-->

    <!--    <div class="mt-16">-->
    <!--      <div class="flex px-4 md:justify-center gap-5 md:gap-14 overflow-auto md:overflow-hidden pb-11 pt-3">-->
    <!--        <div-->
    <!--          v-for="(image, index) in images"-->
    <!--          :key="index"-->
    <!--          class="relative w-44 sm:w-72 aspect-[9/14] flex-none">-->
    <!--          <img-->
    <!--            class="absolute inset-0 w-full h-full object-cover rounded-2xl"-->
    <!--            :class="index % 2 !== 0 ? 'mt-8 rotate-2': '-rotate-2'"-->
    <!--            alt="alt text goes here"-->
    <!--            :src="image">-->
    <!--        </div>-->
    <!--      </div>-->
    <!--    </div>-->

    <div class="mx-auto w-full max-w-7xl flex-grow px-4 sm:px-6 lg-px-8 mt-16">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-y-10">
        <div class="flex flex-col gap-3">
          <h3 class="text-xl font-bold">
            Latest News
          </h3>
          <div class="flex flex-col gap-10">
            <article
              v-for="(news, index) in newsItems"
              :key="index"
              class="relative flex flex-col items-start">
              <h2 class="text-base font-semibold tracking-tight">
                <nuxt-link :to="news.href">
                  <span class="absolute inset-0 z-20" />
                  <span class="relative">{{ news.title }}</span>
                </nuxt-link>
              </h2>
              <time class="relative order-first text-sm text-gray-500 mb-3">{{ formatDate(news.date_created) }}</time>
              <div
                class="relative mt-2 text-sm line-clamp-4 overflow-hidden overflow-ellipsis"
                v-html="news.content" />
              <div class="mt-4 font-medium text-sm text-indigo-500 flex flex-row gap-2 items-center">
                Continue reading
                <ChevronRightIcon class="w-5 h-5" />
              </div>
            </article>
          </div>
        </div>
        <div class="space-y-10 lg:pl-16 xl:pl-32">
          <!--          <div class="p-6 border border-gray-200 rounded-2xl">-->
          <!--            <h3 class="flex items-center text-sm font-semibold gap-3">-->
          <!--              <EnvelopeIcon class="w-5 h-5" />-->
          <!--              Stay up to date-->
          <!--            </h3>-->
          <!--            <p class="mt-2 text-sm text-gray-800">-->
          <!--              Subscribe to the MCC newsletter-->
          <!--            </p>-->
          <!--            <div class="flex gap-2 mt-6">-->
          <!--              <input-field-->
          <!--                id="newsletter-signup"-->
          <!--                v-model="newsletterEmail"-->
          <!--                class="flex-grow"-->
          <!--                name="newsletter-signup"-->
          <!--                placeholder="Email address"-->
          <!--                type="email" />-->
          <!--              <button-->
          <!--                class="rounded bg-indigo-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">-->
          <!--                Signup-->
          <!--              </button>-->
          <!--            </div>-->
          <!--          </div>-->

          <div class="bg-white shadow sm:rounded-lg mt-12">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-base font-semibold leading-6 text-gray-900">
                Stay up to date
              </h3>
              <div class="mt-2 max-w-xl text-sm text-gray-500">
                <p>Subscribe to the MCC newsletter</p>
              </div>
              <form class="mt-5 sm:flex sm:items-center">
                <div class="w-full sm:max-w-xs">
                  <label for="email" class="sr-only">Email</label>
                  <input id="email" type="email" name="email" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="you@example.com">
                </div>
                <button type="submit" class="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto">
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <!--          <div class="mt-10 p-5 border border-gray-200 rounded-2xl">-->
          <!--            <small>List of events this week</small>-->
          <!--          </div>-->
        </div>
      </div>
    </div>

    <client-only>
      <TransitionRoot as="template" :show="showWelcome">
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
                  class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                  <div>
                    <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <HandRaisedIcon class="h-6 w-6 text-green-600" aria-hidden="true" />
                    </div>
                    <div class="mt-3 sm:mt-5">
                      <DialogTitle as="h3" class="text-center text-base font-semibold leading-6 text-gray-900">
                        Hello there!
                      </DialogTitle>
                      <div class="mt-2">
                        <rich-text
                          class="text-sm"
                          :content="home.welcome_message" />
                      </div>
                    </div>
                  </div>
                  <div class="mt-5 sm:mt-6">
                    <button
                      type="button"
                      class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      @click="closeWelcome">
                      Continue
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>
    </client-only>
  </main>
</template>

<script setup lang="ts">
import { EnvelopeIcon, HandRaisedIcon } from "@heroicons/vue/24/outline";
import { ChevronRightIcon } from "@heroicons/vue/24/solid";
import { format } from "date-fns";
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";
import { useDirectusItems } from "#imports";
import { Home, NewsItem } from "~/types";

definePageMeta({
  layout: "no-container"
});

const { getItems, getSingletonItem } = useDirectusItems();

const newsletterEmail = ref("");

const { data: home } = await useAsyncData("home", async () => {
  return await getSingletonItem<Home>({
    collection: "home"
  });
});

const { data: newsItems } = await useAsyncData("news-items-home", async () => {
  const items = await getItems<NewsItem>({
    collection: "news",
    params: {
      limit: 3,
      sort: ["-date_created"]
    }
  });

  return items.map(x => ({
    ...x,
    href: `/news/${x.id}/${x.slug}`
  }));
});

function formatDate (date: string) {
  return format(new Date(date), "MMMM dd, yyyy");
}

const showWelcome = ref(false);

onMounted(() => {
  showWelcome.value = window.localStorage.getItem("hide-welcome-message") !== "true";
});

function closeWelcome () {
  window.localStorage.setItem("hide-welcome-message", "true");
  showWelcome.value = false;
}

</script>

<style scoped lang="scss">

</style>
