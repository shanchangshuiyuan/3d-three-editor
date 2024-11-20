import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementPlus from "element-plus";
import "@/style/index.scss";

const app = createApp(App);
app.use(router);
app.use(store);
app.use(ElementPlus);
app.mount("#app");

let a = "111";
console.log(a);
