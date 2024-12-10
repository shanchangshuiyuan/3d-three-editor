import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { resolve } from "path";
import qiankun from "vite-plugin-qiankun";

export default defineConfig({
  // 子应用线上服务器的绝对地址 目的是为了能够正确的加载子应用自己的静态资源（jscssimg）
  base: "http://localhost:5173/",
  plugins: [
    vue(),
    vueJsx(),
    // 这里的名称要和主应用改造是配置项中的name保持一致
    qiankun("big-screen", {
      useDevMode: true
    })
  ],
  server: {
    // 防止开发阶段的assets 静态资源加载问题
    // 子应用被主应用加载过去之后 代码中加载的静态资源 图片
    // 图片地址 走主应用地址  http://locahost:8081/assests/a.png
    origin: "//localhost:5173"
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src")
    }
  }
});
