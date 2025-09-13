import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";


/** @type {import('eslint').Linter.Config[]} */
export default [
    {files: ["**/*.{js,mjs,cjs,ts}"]},
    {languageOptions: { globals: globals.node }},
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: {
            "@stylistic": stylistic
        },
        rules: {
            "@stylistic/indent": ["error", 4],
            "@stylistic/brace-style": "error",
            "no-case-declarations": "off",
            "semi": "error"
        }
    }
];