const blitzEslint = require("@blitzjs/next/eslint")

module.exports = {
  ...blitzEslint,
  "rules": {
    ...blitzEslint.rules,
    "react/no-unknown-property": [2, { "ignore": ["jsx", "global"] }],
    "@typescript-eslint/no-floating-promises": "off",
  }
}
