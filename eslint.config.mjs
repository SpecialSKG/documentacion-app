import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "templates/**",
    "src (Base)/**",
    "src/components/wizard/ui/DetalleRowEditor.tsx",
    "exportExcel_PATCH.ts",
    "excelAnchors_FIXED.ts",
  ]),
]);

export default eslintConfig;
