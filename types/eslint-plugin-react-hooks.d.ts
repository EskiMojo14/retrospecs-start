declare module "eslint-plugin-react-hooks" {
  import type { TSESLint } from "@typescript-eslint/utils";
  import type { Rule } from "eslint";
  export const rules: {
    "exhaustive-deps": Rule.RuleModule;
    "rules-of-hooks": Rule.RuleModule;
  };
  export const configs: {
    recommended: {
      plugins: Array<string>;
      rules: TSESLint.FlatConfig.Rules;
    };
  };
  const allExports: { rules: typeof rules; configs: typeof configs };
  export default allExports;
}
