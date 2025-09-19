import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/about',
            name: 'about',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/AboutView.vue'),
        },
        {
            path: '/demos/2d/sat_demo_1',
            name: 'sat_demo_1',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/examples/2d/SatDemo1.vue'),
        },
        {
            path: '/demos/2d/gjk_demo_1',
            name: 'gjk_demo_1',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/examples/2d/GjkEpaDemo1.vue'),
        },
        {
            path: '/demos/2d/gjk_demo_2',
            name: 'gjk_demo_2',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/examples/2d/GjkEpaDemo2.vue'),
        },
        {
            path: '/demos/2d/gjk_demo_3',
            name: 'gjk_demo_3',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/examples/2d/GjkEpaDemo3.vue'),
        },
    ],
});

export default router;
