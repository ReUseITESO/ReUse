import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Linter } from "eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

// Fix for Windows paths with special characters (like your IM² folder)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: Linter.Config[] = [
	// ... your existing configs (next, react, etc.)
	eslintConfigPrettier, // This disables the linting rules
];

export default tseslint.config(
	{
		ignores: ["dist/**", "node_modules/**"],
	},
	...tseslint.configs.recommendedTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				projectService: true, // Simplified!
				tsconfigRootDir: __dirname,
			},
		},
		rules: {
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/no-floating-promises": "error",
			"@typescript-eslint/no-explicit-any": "error",
		},
	},
	eslintConfigPrettier,
);
