import { UploadableFile } from "~/composables/useFileManager";

export const useFileUploader = () => {
  const directusUrl = useDirectusUrl();
  const { token } = useDirectusToken();

  async function createFolder (parentFolderId: number, folderName: string) {
    const url = directusUrl + "/folders";
    const data: any = await $fetch(url, {
      method: "POST",
      body: {
        name: folderName,
        parent: parentFolderId
      },
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });

    return data.data.id;
  }

  async function uploadFile (file: UploadableFile, folderId: string | null = null) {
    if (file.status === "too large") {
      console.warn("Not uploading image, dimensions too large");
      return;
    }

    const formData = new FormData();
    formData.append("title", file.file.name);
    formData.append("file", file.file);
    if (folderId) {
      formData.append("folder", folderId);
    }

    file.status = "loading";
    const url = directusUrl + "/files";

    let response;
    try {
      response = await $fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      });
      file.status = "ok";
    } catch (err) {
      file.status = "error";
      throw err;
    }

    return response;
  }

  async function uploadFiles (files: UploadableFile[], folderId: string) {
    const uploadBatchSize = 5;
    await promiseAllInBatches((file: UploadableFile) => uploadFile(file, folderId), files, uploadBatchSize);
  }

  return {
    uploadFile,
    createFolder,
    uploadFiles
  };
};
