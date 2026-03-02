import { fixupConfigRules } from "@eslint/compat";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
	// Wrap these to fix the "contextOrFilename.getFilename" error
	...fixupConfigRules([...nextVitals, ...nextTs]),

	// This turns off all formatting/style rules so Biome can handle them
	eslintConfigPrettier,

	globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
