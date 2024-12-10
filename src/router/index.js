import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    name: "EditView",
    path: "/",
    redirect: "/edit",
    component: () => import("@/layouts/EditView.vue"),
    children: [
      {
        path: "/edit",
        name: "modelEdit",
        meta: { keepAlive: true },
        component: () => import("@/views/modelEdit/index.vue")
      },
      {
        path: "/modelBase",
        name: "modelBase",
        meta: { keepAlive: false },
        component: () => import("@/views/modelBase/index.vue")
      }
    ]
  },
  {
    name: "runTimeView",
    path: "/runTime",
    component: () => import("@/views/run-time/index.vue")
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
