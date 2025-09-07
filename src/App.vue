<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
    <header>
        <div class="container mx-auto flex px-4 py-2 gap-4">
            <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="32" height="32" />

            <nav class="flex gap-2">
                <RouterLink to="/">Home</RouterLink>
                <RouterLink to="/about">About</RouterLink>
                <RouterLink to="/demos/2d/sat_demo_1">Sat Demo 1</RouterLink>
                <RouterLink to="/demos/2d/gjk_demo_1">Gjk Epa Demo 1</RouterLink>
            </nav>
        </div>
    </header>

    <RouterView />
</template>

<style scoped></style>
