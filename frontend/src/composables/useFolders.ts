export function useFolders () {
  const directus = useDirectus();

  type Folder = {
    id: string,
    name: string,
    parent?: string
  }

  async function getFolderId (name: string) {
    const { data: folders } = await directus<{ data: Folder[] }>("/folders", {
      params: {
        filter: {
          name: {
            _eq: name
          }
        }
      }
    });

    if (!folders || folders.length === 0) {
      return null;
    }

    if (folders.length > 1) {
      console.warn(`Multiple folders found with name: ${name}`);
    }

    const folder = folders[0];
    return folder.id;
  }

  return {
    getFolderId
  };
}
