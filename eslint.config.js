import globals from "globals";
import pluginJs from "@eslint/js";
import pluginVue from "eslint-plugin-vue";

export default [
  { files: ["**/*.{js,mjs,cjs,vue}"] }, // 校验文件类型，如果明确我们的项目中没有 mjs 和 cjs 文件,可以删除掉这两个后缀
  { languageOptions: { globals: globals.browser } }, // 全局变量
  pluginJs.configs.recommended, // eslint-plugin-js 的推荐配置, 具体有啥推荐，可以查看官方文档 https://zh-hans.eslint.org/docs/latest/rules/
  ...pluginVue.configs["flat/essential"], // 表示使用Vue.js的扁平化基本配置
  /** 自定义规则 */
  {
    rules: {
      // 代码风格
      indent: ["error", 2], // 缩进2个空格
      quotes: ["error", "double"], // 字符串使用单引号
      semi: ["error", "always"], // 语句结尾使用分号
      "vue/multi-word-component-names": [
        "warn",
        {
          // 指定需要忽略的组件名称
          ignores: ["index"]
        }
      ],
      "space-before-function-paren": ["error", "never"], // 函数定义时括号前面不加空格

      // 变量声明
      "no-var": "error", // 禁止使用 var
      "no-unused-vars": "error", // 禁止出现未使用的变量

      // 最佳实践
      "no-console": "error", // 禁止使用 console
      "no-debugger": "error", // 禁止使用 debugger
      "no-alert": "error", // 禁止使用 alert

      // 错误处理
      "handle-callback-err": "error", // 要求回调函数中有错误处理

      // Vue
      "vue/html-indent": ["error", 2] // vue文件缩进2个空格
    }
  }
];
