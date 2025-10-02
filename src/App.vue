<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
    <header class="relative w-full bg-white shadow-sm z-10">
        <div class="container mx-auto flex items-center px-6 py-4 justify-between">
            <RouterLink to="/"><img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="32" height="32" /> </RouterLink>

            <div><a href="https://www.devdiegomatos.com.br" class="font-semibold hover:text-blue-600">Autor: Diego V. S. de Matos</a></div>
        </div>
    </header>

    <div class="flex items-center justify-center">
        <div class="w-full flex flex-col md:flex-row">
            <aside class="w-full md:w-1/4 bg-white border-b p-8 md:border-b-0 md:border-r border-slate-200">
                <div class="sticky top-0">
                    <h2 class="font-display font-bold text-xl text-slate-800 mb-4">Demos</h2>
                    <nav>
                        <ul class="space-y-2">
                            <RouterLink
                                to="/demos/polygon-chaos"
                                class="block py-2 px-4 rounded-md hover:bg-slate-100 transition-colors"
                                active-class="block py-2 px-4 rounded-md font-semibold bg-blue-50 text-blue-600 border-l-4 border-blue-500"
                            >
                                Polygon Chaos
                            </RouterLink>

                            <RouterLink
                                to="/demos/cloth-tellis"
                                class="block py-2 px-4 rounded-md hover:bg-slate-100 transition-colors"
                                active-class="block py-2 px-4 rounded-md font-semibold bg-blue-50 text-blue-600 border-l-4 border-blue-500"
                            >
                                Tecidos e Treliça
                            </RouterLink>
                        </ul>
                    </nav>
                </div>
            </aside>
            <main class="w-full md:w-3/4 text-gray-800 p-4">
                <RouterView />
            </main>
        </div>
    </div>

    <!-- Footer -->
    <footer id="sobre" class="bg-gray-100 py-8 h-full">
        <div class="max-w-6xl mx-auto px-6 text-center text-gray-600 text-sm">
            <p>Autor: Diego Vasconcelos Schardosim de Matos</p>
            <p>Orientador: Cláudio Esperança</p>
            <p class="mt-2">
                <a href="https://github.com/diegomatos321" class="text-blue-600 hover:underline">GitHub</a> •
                <a href="https://linkedin.com" class="text-blue-600 hover:underline">Linkedin</a> •
                <a href="https://www.devdiegomatos.com.br" class="text-blue-600 hover:underline">Site pessoal</a> •
                <a href="https://ic.ufrj.br" class="text-blue-600 hover:underline">Instituto de Computação UFRJ</a>
            </p>
        </div>
    </footer>
</template>
