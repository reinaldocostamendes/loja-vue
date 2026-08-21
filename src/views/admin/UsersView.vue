<script setup>
import { ref, reactive, onMounted } from 'vue'
import { adminApi } from '@/api/admin'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useApiError } from '@/composables/useApiError'
import { initials, formatDate } from '@/composables/format'
import PageHeader from '@/components/admin/PageHeader.vue'
import UserFormModal from '@/components/admin/UserFormModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import Pagination from '@/components/ui/Pagination.vue'
import Spinner from '@/components/ui/Spinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const auth = useAuthStore()
const toast = useToastStore()
const { handle } = useApiError()

const users = ref([])
const loading = ref(true)
const roleFilter = ref('')
const state = reactive({ page: 1, totalPages: 1 })

const modalOpen = ref(false)
const editingUser = ref(null)
const deletingId = ref(null)

async function load() {
  loading.value = true
  try {
    const res = await adminApi.listUsers({ role: roleFilter.value || undefined, page: state.page, per_page: 12 })
    users.value = res.items || []
    state.totalPages = res.total_pages || 1
  } catch (error) {
    handle(error, 'Não foi possível carregar os utilizadores.')
  } finally {
    loading.value = false
  }
}

function onFilterChange() {
  state.page = 1
  load()
}
function changePage(page) {
  state.page = page
  load()
}

function openCreate() {
  editingUser.value = null
  modalOpen.value = true
}
function openEdit(user) {
  editingUser.value = user
  modalOpen.value = true
}

async function remove(user) {
  if (user.id === auth.user?.id) {
    toast.error('Não podes remover a tua própria conta.')
    return
  }
  if (!confirm(`Remover o utilizador "${user.name}"?`)) return
  deletingId.value = user.id
  try {
    await adminApi.deleteUser(user.id)
    toast.success('Utilizador removido.')
    await load()
  } catch (error) {
    handle(error, 'Não foi possível remover o utilizador.')
  } finally {
    deletingId.value = null
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader title="Utilizadores" subtitle="Gere administradores e clientes.">
      <template #actions>
        <BaseButton @click="openCreate">
          <template #icon>
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          </template>
          Novo utilizador
        </BaseButton>
      </template>
    </PageHeader>

    <div class="mb-4">
      <select
        v-model="roleFilter"
        class="rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
        @change="onFilterChange"
      >
        <option value="">Todos os papéis</option>
        <option value="client">Clientes</option>
        <option value="admin">Administradores</option>
      </select>
    </div>

    <div v-if="loading" class="flex justify-center py-20"><Spinner size="lg" /></div>

    <EmptyState v-else-if="users.length === 0" title="Nenhum utilizador encontrado" />

    <template v-else>
      <div class="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th class="px-4 py-3">Utilizador</th>
              <th class="px-4 py-3">Papel</th>
              <th class="px-4 py-3">Estado</th>
              <th class="px-4 py-3">2FA</th>
              <th class="px-4 py-3">Desde</th>
              <th class="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="user in users" :key="user.id">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <span class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                    {{ initials(user.name) }}
                  </span>
                  <div>
                    <p class="font-semibold text-slate-800">{{ user.name }}</p>
                    <p class="text-xs text-slate-400">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset" :class="user.role === 'admin' ? 'bg-brand-50 text-brand-700 ring-brand-600/20' : 'bg-slate-100 text-slate-600 ring-slate-500/20'">
                  {{ user.role === 'admin' ? 'Administrador' : 'Cliente' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset" :class="user.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-rose-50 text-rose-600 ring-rose-600/20'">
                  {{ user.status === 'active' ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-500">{{ Number(user.two_factor_enabled) === 1 ? 'Sim' : 'Não' }}</td>
              <td class="px-4 py-3 text-slate-500">{{ formatDate(user.created_at) }}</td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-1">
                  <button class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" @click="openEdit(user)">
                    <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                  </button>
                  <button
                    class="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                    :disabled="deletingId === user.id || user.id === auth.user?.id"
                    @click="remove(user)"
                  >
                    <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79" /></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination :page="state.page" :total-pages="state.totalPages" @change="changePage" />
    </template>

    <UserFormModal v-model="modalOpen" :user="editingUser" @saved="load" />
  </div>
</template>
