import type { MaybeRef } from "vue";
import type { MedicalInformation } from "~/components/user/MedicalInformation.vue";

export type JuniorUser = {
  id?: string,
  first_name: string,
  last_name: string,
  parentId: string,
  bc_number: string,
  medicalInformation: MedicalInformation
}

export function useJuniors () {
  const directus = useDirectus();
  const { newError } = useErrors();

  async function createJunior (junior: MaybeRef<JuniorUser>) {
    try {
      await directus("/juniors/create", {
        method: "POST",
        body: {
          user: unref(junior)
        }
      });
    } catch (err: any) {
      console.error(`Error creating junior: ${err}`);
      newError({
        message: "Unable to create a new junior"
      });
    }
  }

  async function updateJunior (junior: MaybeRef<JuniorUser>) {
    try {
      await directus("/juniors/update", {
        method: "POST",
        body: {
          user: unref(junior)
        }
      });
    } catch (err: any) {
      console.error(`Error updating junior: ${err}`);
      newError({
        message: "Unable to update the junior"
      });
    }
  }

  return {
    createJunior,
    updateJunior
  };
}
