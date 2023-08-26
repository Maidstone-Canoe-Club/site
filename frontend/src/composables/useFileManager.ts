import { Ref } from "vue";

export class UploadableFile {
  file: File;
  id: string;
  url: Ref<string | null>;
  status: string | null;

  constructor (file: File, resize = false) {
    this.file = file;
    this.id = `${file.name}-${file.size}-${file.lastModified}-${file.type}`;
    this.url = ref(null);
    this.status = null;
    if (resize) {
      resizeImage(file, this);
    }
  }
}

function resizeImage (file: File, uploadableFile: UploadableFile) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = document.createElement("img");
    img.onload = function (event) {
      const MAX_UPLOAD_DIMENSION = 6000;
      const MAX_WIDTH = 600;
      const MAX_HEIGHT = 300;

      let width = img.width;
      let height = img.height;

      if (width > MAX_UPLOAD_DIMENSION || height > MAX_UPLOAD_DIMENSION) {
        uploadableFile.status = "too large";
        console.warn(" Image dimensions too large");
      }

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
      } else if (height > MAX_HEIGHT) {
        width = Math.round((width * MAX_HEIGHT) / height);
        height = MAX_HEIGHT;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);

      uploadableFile.url.value = canvas.toDataURL(file.type);
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

export const useFileManager = (maxFiles?: number) => {
  const files: Ref<UploadableFile[]> = ref([]);

  function addFiles (newFiles: FileList) {
    const newUploadableFiles = [...newFiles]
      .map(file => new UploadableFile(file))
      .filter(file => !fileExists(file.id));

    files.value = files.value.concat(newUploadableFiles);

    if (maxFiles && maxFiles > 0) {
      files.value = files.value.splice(0, maxFiles);
    }
  }

  function fileExists (otherId: string) {
    return files.value.some(({ id }) => id === otherId);
  }

  function removeFile (file: UploadableFile) {
    const newFiles = [...files.value];
    const index = newFiles.indexOf(file);
    if (index > -1) {
      newFiles.splice(index, 1);
    }

    files.value = newFiles;
  }

  return {
    files,
    addFiles,
    removeFile
  };
};
