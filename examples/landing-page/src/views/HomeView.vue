<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
    <!-- Hero Section -->
    <section id="intro" class="pt-32 pb-20">
        <div class="container mx-auto text-center px-6">
            <h1 class="text-4xl font-bold text-blue-600 mb-4">Simulação Física Simplificada na Web</h1>
            <p class="text-lg text-gray-600 mb-8">Trabalho de conclusão de curso Ciência da Computação</p>
            <RouterLink to="/demos/polygon-chaos" class="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">Ver Demos</RouterLink>
        </div>
    </section>

    <!-- Metodologia -->
    <section id="metodologia" class="py-20">
        <div class="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 px-6 items-center">
            <div>
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">Metodologia</h2>
                <p class="text-gray-600 mb-4">
                    Explicação sobre os conceitos aplicados, técnicas de simplificação de física para simulações web e ferramentas utilizadas.
                </p>
                <pre class="bg-gray-900 text-green-400 text-sm p-4 rounded-lg overflow-x-auto">
x' = x + vt
v' = v + at
</pre
                >
            </div>
            <div class="rounded-lg shadow p-6 flex items-center justify-center">
                <span class="text-gray-400">[Diagrama ilustrativo aqui]</span>
            </div>
        </div>
    </section>

    <!-- Demos -->
    <section id="demos" class="py-20">
        <div class="container mx-auto px-6">
            <h2 class="text-2xl font-semibold text-gray-900 mb-10 text-center">Demos de Simulação</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="p-6 rounded-lg shadow hover:shadow-lg transition">
                    <div class="h-24 flex items-center justify-center text-4xl text-blue-600">⚪</div>
                    <h4 class="text-lg font-semibold mb-2">Queda Livre</h4>
                    <a href="#" class="text-blue-600 hover:underline">Executar</a>
                </div>
                <div class="p-6 rounded-lg shadow hover:shadow-lg transition">
                    <div class="h-24 flex items-center justify-center text-4xl text-blue-600">⬤⬤</div>
                    <h4 class="text-lg font-semibold mb-2">Colisões Elásticas</h4>
                    <a href="#" class="text-blue-600 hover:underline">Executar</a>
                </div>
                <div class="p-6 rounded-lg shadow hover:shadow-lg transition">
                    <div class="h-24 flex items-center justify-center text-4xl text-blue-600">✦</div>
                    <h4 class="text-lg font-semibold mb-2">Partículas em Campo</h4>
                    <a href="#" class="text-blue-600 hover:underline">Executar</a>
                </div>
            </div>
        </div>
    </section>

    <!-- Resultados -->
    <section id="resultados" class="py-20">
        <div class="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 px-6 items-center">
            <div class="rounded-lg shadow p-6 flex items-center justify-center">
                <span class="text-gray-400">[Gráfico comparativo aqui]</span>
            </div>
            <div>
                <h3 class="text-2xl font-semibold text-gray-900 mb-4">Resultados</h3>
                <p class="text-gray-600">Discussão sobre desempenho, limitações e precisão das simulações implementadas no ambiente web.</p>
            </div>
        </div>
    </section>

    <!-- Conclusão -->
    <section id="conclusao" class="py-20">
        <div class="max-w-4xl mx-auto px-6 text-center">
            <h3 class="text-2xl font-semibold text-gray-900 mb-6">Conclusão</h3>
            <p class="text-gray-600 mb-4">
                Este trabalho demonstrou a viabilidade de implementar simulações físicas simplificadas diretamente no navegador, com resultados satisfatórios
                para fins didáticos e acadêmicos.
            </p>
            <h4 class="font-semibold text-gray-800 mt-6 mb-2">Referências</h4>
            <ul class="text-gray-600 text-sm space-y-1">
                <li>[1] Autor, Título, Ano.</li>
                <li>[2] Autor, Título, Ano.</li>
                <li>[3] Autor, Título, Ano.</li>
            </ul>
        </div>
    </section>
</template>
