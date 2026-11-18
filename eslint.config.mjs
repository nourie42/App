import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextVitals,
  {
    ignores: ["scripts/**", ".next/**", "dist/**", "out/**"],
  },
];

export default eslintConfig;
