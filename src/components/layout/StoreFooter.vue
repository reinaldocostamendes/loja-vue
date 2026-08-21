<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-slate-200 bg-white">
    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p class="text-sm text-slate-500">© {{ year }} Loja. Todos os direitos reservados.</p>
        <div class="flex items-center gap-3 text-slate-400">
          <span class="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            Pagamentos seguros com
          </span>
          <span class="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">Cartão</span>
          <span class="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">MB WAY</span>
          <span class="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">Multibanco</span>
        </div>
      </div>
    </div>
  </footer>
</template>
