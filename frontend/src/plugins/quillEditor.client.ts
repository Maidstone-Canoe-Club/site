import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";

export default defineNuxtPlugin(() => {
  const { vueApp } = useNuxtApp();
  vueApp.component("QuillEditor", QuillEditor);
});
