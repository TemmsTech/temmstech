import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["@/modules/*/*"],
          message: "Import modules through their public index.tsx entry point.",
        }],
      }],
    },
  },
  globalIgnores([".next/**", "out/**", "next-env.d.ts", "playwright-report/**", "test-results/**"]),
]);
