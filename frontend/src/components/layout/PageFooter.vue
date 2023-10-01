<template>
  <footer class="bg-white border-t border-gray-200">
    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div class="md:flex md:justify-between">
        <div class="mb-6 md:mb-0">
          <div class="flex items-center">
            <nuxt-img
              src="/images/logo.svg"
              class="mr-3"
              width="60"
              height="60"
              alt="Maidstone Canoe Club logo">
              <span class="self-center font-semibold whitespace-nowrap">Maidstone Canoe Club</span>
            </nuxt-img>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
          <div>
            <h2 class="mb-6 text-sm font-semibold text-gray-900 uppercase">
              Resources
            </h2>
            <ul class="text-gray-500">
              <li class="mb-4">
                <nuxt-link to="/about-us" class="hover:underline">
                  About us
                </nuxt-link>
              </li>
              <li class="mb-4">
                <nuxt-link to="/contact-us" class="hover:underline">
                  Contact us
                </nuxt-link>
              </li>
              <li class="mb-4">
                <nuxt-link to="/where-we-are" class="hover:underline">
                  Find us
                </nuxt-link>
              </li>
            </ul>
          </div>
          <div>
            <h2 class="mb-6 text-sm font-semibold text-gray-900 uppercase ">
              Legal
            </h2>
            <ul class="text-gray-500">
              <li class="mb-4">
                <nuxt-link to="/privacy-policy" class="hover:underline">
                  Privacy policy
                </nuxt-link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <hr class="my-6 border-gray-200 sm:mx-auto lg:my-8">
      <div class="sm:flex sm:items-center sm:justify-between">
        <span class="text-sm text-gray-500 sm:text-center ">© 2023 Maidstone Canoe Club. All Rights Reserved.
        </span>
        <div class="flex mt-4 space-x-5 sm:justify-center sm:mt-0">
          <nuxt-link to="https://www.facebook.com/MaidstoneCanoeClub/" class="text-gray-500 hover:text-gray-900 e">
            <svg
              class="w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 8 19">
              <path
                fill-rule="evenodd"
                d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z"
                clip-rule="evenodd" />
            </svg>
            <span class="sr-only">Facebook page</span>
          </nuxt-link>
          <nuxt-link to="https://www.facebook.com/MaidstoneCanoeClub/" class="text-gray-500 hover:text-gray-900 e">
            <svg
              class="w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 17">
              <path
                fill-rule="evenodd"
                d="M20 1.892a8.178 8.178 0 0 1-2.355.635 4.074 4.074 0 0 0 1.8-2.235 8.344 8.344 0 0 1-2.605.98A4.13 4.13 0 0 0 13.85 0a4.068 4.068 0 0 0-4.1 4.038 4 4 0 0 0 .105.919A11.705 11.705 0 0 1 1.4.734a4.006 4.006 0 0 0 1.268 5.392 4.165 4.165 0 0 1-1.859-.5v.05A4.057 4.057 0 0 0 4.1 9.635a4.19 4.19 0 0 1-1.856.07 4.108 4.108 0 0 0 3.831 2.807A8.36 8.36 0 0 1 0 14.184 11.732 11.732 0 0 0 6.291 16 11.502 11.502 0 0 0 17.964 4.5c0-.177 0-.35-.012-.523A8.143 8.143 0 0 0 20 1.892Z"
                clip-rule="evenodd" />
            </svg>
            <span class="sr-only">Twitter page</span>
          </nuxt-link>
          <nuxt-link to="https://www.youtube.com/MaidstoneCanoeClub/" class="text-gray-500 hover:text-gray-900 e">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="1em"
              viewBox="0 0 576 512"
              fill="currentColor">
              <path
                d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" />
            </svg>
            <span class="sr-only">YouTube channel</span>
          </nuxt-link>
          <nuxt-link to="https://www.instagram.com/maidstonecanoeclub/" class="text-gray-500 hover:text-gray-900 e">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="1em"
              viewBox="0 0 448 512"
              fill="currentColor">
              <path
                d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
            </svg>
            <span class="sr-only">Instagram account</span>
          </nuxt-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">

</script>

<style scoped lang="scss">

</style>
