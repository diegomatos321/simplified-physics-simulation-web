<script setup lang="ts">
import { RouterView } from 'vue-router';
import Footer from './layouts/Footer.vue';
import Header from './layouts/Header.vue';
import Aside from './layouts/Aside.vue';
</script>

<template>
    <Header />

    <div class="flex items-center justify-center">
        <div class="w-full flex flex-col md:flex-row">
            <Aside />
            <main class="w-full md:w-3/4 text-gray-800 p-4">
                <RouterView />
            </main>
        </div>
    </div>

    <Footer />
</template>
