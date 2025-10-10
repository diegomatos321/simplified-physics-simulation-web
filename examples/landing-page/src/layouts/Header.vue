<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
    <header class="relative w-full bg-white shadow-sm z-10">
        <div class="container mx-auto flex items-center px-6 py-4 justify-between">
            <RouterLink to="/"><img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="32" height="32" /> </RouterLink>

            <div><a href="https://www.devdiegomatos.com.br" class="font-semibold hover:text-blue-600">Autor: Diego V. S. de Matos</a></div>
        </div>
    </header>
</template>
