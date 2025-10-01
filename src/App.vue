<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
    <header class="mb-8">
        <div class="container mx-auto flex px-4 py-2 justify-between">
            <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="32" height="32" />

            <div><a href="https://www.devdiegomatos.com.br">Autor: Diego V. S. de Matos</a></div>
        </div>
    </header>

    <div class="grid grid-cols-4">
        <aside class="col-span-1">
            <li>
                <RouterLink to="/">Home</RouterLink>
            </li>
            <li>
                <RouterLink to="/demos/polygon-chaos">Polygon Chaos</RouterLink>
            </li>
        </aside>
        <main class="col-span-3 p-4">
            <RouterView />
        </main>
    </div>
</template>
