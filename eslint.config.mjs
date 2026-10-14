import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import { createNodeResolver, flatConfigs } from "eslint-plugin-import-x";
import tailwindcss from "eslint-plugin-tailwindcss";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["**/components/ui/**"]),
  ...nextCoreWebVitals,
  flatConfigs.recommended,
  flatConfigs.typescript,
  tailwindcss.configs.recommended,
  {
    settings: {
      "import-x/resolver-next": [
        createTypeScriptImportResolver({ alwaysTryTypes: true }),
        createNodeResolver(),
      ],
      tailwindcss: {
        cssConfigPath: "./src/app/globals.css",
      },
    },
    rules: {
      // Biome's useSortedClasses owns class ordering and sorts differently
      "tailwindcss/classnames-order": "off",
      "tailwindcss/no-custom-classname": "off",
    },
  },
]);
