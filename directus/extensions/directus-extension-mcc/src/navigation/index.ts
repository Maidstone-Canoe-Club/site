import {defineEndpoint} from "@directus/extensions-sdk";

function buildNavItem(item: any) {
  const result = {
    name: item.title,
    target: item.open_in_new_tab ? "_blank" : null,
    href: item.url,
    childItems: []
  };

  if (item.page) {
    result.href = `/${item.page.slug}`;
  }

  if (item.children && item.children.length) {
    for (const child of item.children) {
      result.childItems.push(buildNavItem(child));
    }
  }

  return result;
}

export default defineEndpoint((router, {services, database}) => {
  const {
    ItemsService
  } = services;

  const adminAccountability = {
    admin: true
  };

  router.get("/", async (req, res) => {

    try {
      const navigationService = new ItemsService("navigation", {
        knex: database,
        schema: req.schema,
        accountability: adminAccountability
      });


      const navigation = await navigationService.readSingleton({
        fields: [
          "items.*",
          "items.children.*",
          "items.children.page.slug",
          "items.children.children.*",
          "items.children.children.page.slug",
        ]
      });

      const navItems = [];

      if (navigation && navigation.items && navigation.items.length) {
        for (const item of navigation.items) {
          navItems.push(buildNavItem(item));
        }
      }

      return res.json(navItems);
    } catch (e) {
      console.error("error loading navigation", e);
      return res.status(500).send("error loading navigation");
    }
  });
});
