import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    name: "EditView",
    path: "/",
    component: () => import("@/layouts/EditView.vue"),
    children: [
      {
        path: "/",
        name: "modelEdit",
        meta: { keepAlive: true },
        component: () => import("@/views/modelEdit/index.vue")
      }
    ]
  }
];

const base = import.meta.env.VITE_APP_BASE_URL;

const router = createRouter({
  history: createWebHistory(base),
  base,
  model: "hash",
  routes
});

export default router;
