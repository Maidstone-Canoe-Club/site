// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  {
    files: ["**/*.vue"],
    rules: {
      "vue/component-name-in-template-casing": ["error", "PascalCase"]
    }
  }
).overrideRules({
  "vue/max-attributes-per-line": ["warn", { singleline: 3 }],
  "vue/component-name-in-template-casing": ["error", "PascalCase"]
});
