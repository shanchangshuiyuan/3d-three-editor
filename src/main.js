import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementPlus from "element-plus";
import "@/style/index.scss";
// 自定义封装全局方法
import GlobalProperties from "@/utils/globalProperties.js";
// 全局组件
import GlobalComponent from "@/utils/globalComponent";
// 自定义全局指令
import Directive from "@/utils/directive.js";
import "element-plus/theme-chalk/src/index.scss";
import "default-passive-events";

import { renderWithQiankun, qiankunWindow } from "vite-plugin-qiankun/dist/helper";

// const app = createApp(App);
// app.use(ElementPlus, { size: "small", zIndex: 3000 });
// app.use(GlobalProperties);
// app.use(GlobalComponent);
// app.use(Directive);
// app.use(store);
// app.use(router);
// app.mount("#app");

// 使用乾坤渲染
renderWithQiankun({
  // 挂载时
  mount(props) {
    // console.log("子应用完成挂载了mount");
    render(props);
  },
  bootstrap() {
    // console.log("bootstrap");
  },
  unmount(props) {
    // console.log("unmount", props);
  }
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
}

function render(props = {}) {
  const { container } = props;
  const app = createApp(App);
  app.use(ElementPlus, { size: "small", zIndex: 3000 });
  app.use(GlobalProperties);
  app.use(GlobalComponent);
  app.use(Directive);
  app.use(store);
  app.use(router);
  app.mount(container ? container.querySelector("#app") : "#app");
}
