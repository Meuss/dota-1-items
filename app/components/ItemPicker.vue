<script setup lang="ts">
import { SHOP_NAMES } from '~/types/item'

const {
  isPickerOpen,
  searchQuery,
  shopFilter,
  filteredItems,
  closePicker,
  selectItem,
} = useItemStore()

const searchInput = ref<HTMLInputElement | null>(null)

// Auto-focus search when picker opens
watch(isPickerOpen, (open) => {
  if (open) {
    nextTick(() => searchInput.value?.focus())
  }
})

// Close on Escape
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closePicker()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isPickerOpen"
        class="fixed inset-0 z-50 flex items-start justify-center bg-black/70 pt-[5vh] backdrop-blur-sm"
        @click.self="closePicker"
      >
        <div class="mx-4 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-dota-border bg-dota-bg shadow-2xl">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-dota-border px-5 py-4">
            <h2 class="text-lg font-bold text-white">Choose an Item</h2>
            <button
              class="flex size-8 items-center justify-center rounded-lg text-dota-muted transition-colors hover:bg-dota-surface hover:text-white"
              @click="closePicker"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Search -->
          <div class="border-b border-dota-border px-5 py-3">
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Search items..."
              class="w-full rounded-lg border border-dota-border bg-dota-surface px-3 py-2 text-sm text-dota-text placeholder-dota-muted outline-none transition-colors focus:border-dota-gold-dim"
            />
          </div>

          <!-- Shop filter chips -->
          <div class="flex flex-wrap gap-1.5 border-b border-dota-border px-5 py-3">
            <button
              class="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
              :class="
                shopFilter === 'all'
                  ? 'bg-dota-gold text-dota-bg'
                  : 'bg-dota-surface text-dota-muted hover:text-dota-text'
              "
              @click="shopFilter = 'all'"
            >
              All
            </button>
            <button
              v-for="shop in SHOP_NAMES"
              :key="shop"
              class="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
              :class="
                shopFilter === shop
                  ? 'bg-dota-gold text-dota-bg'
                  : 'bg-dota-surface text-dota-muted hover:text-dota-text'
              "
              @click="shopFilter = shop"
            >
              {{ shop }}
            </button>
          </div>

          <!-- Item grid -->
          <div class="picker-scroll flex-1 overflow-y-auto p-4">
            <div
              v-if="filteredItems.length > 0"
              class="grid grid-cols-1 gap-2 sm:grid-cols-2"
            >
              <ItemCard
                v-for="item in filteredItems"
                :key="item.id"
                :item="item"
                @select="selectItem"
              />
            </div>
            <div v-else class="py-12 text-center text-sm text-dota-muted">
              No items found
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
