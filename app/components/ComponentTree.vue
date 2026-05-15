<script setup lang="ts">
import type { ComponentRef, DotaItem } from '~/types/item'

const props = defineProps<{
  components: ComponentRef[]
  depth?: number
}>()

const { getItemById } = useItemStore()

const currentDepth = computed(() => props.depth ?? 0)

const resolved = computed(() => {
  return props.components.map(comp => ({
    ...comp,
    resolved: comp.itemId ? getItemById(comp.itemId) : undefined,
  }))
})
</script>

<template>
  <div class="space-y-1">
    <div
      v-for="(comp, idx) in resolved"
      :key="idx"
    >
      <div
        class="flex items-center gap-2 rounded-md px-2 py-1.5"
        :class="currentDepth === 0 ? 'bg-dota-bg/60' : 'bg-dota-bg/30'"
      >
        <img
          v-if="comp.resolved"
          :src="comp.resolved.image"
          :alt="comp.resolved.name"
          class="shrink-0 rounded object-cover"
          :class="currentDepth === 0 ? 'size-7' : 'size-5'"
        />
        <div
          v-else
          class="flex shrink-0 items-center justify-center rounded bg-dota-border text-[10px] text-dota-muted"
          :class="currentDepth === 0 ? 'size-7' : 'size-5'"
        >
          ?
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1">
            <span v-if="comp.quantity > 1" class="text-[10px] font-bold text-dota-gold">
              {{ comp.quantity }}x
            </span>
            <span class="truncate text-xs text-dota-text" :class="currentDepth > 0 && 'text-dota-text/70'">
              {{ comp.resolved?.name ?? comp.name }}
            </span>
          </div>
          <div class="flex items-center gap-1.5">
            <span v-if="comp.resolved?.buyPrice" class="text-[10px] text-dota-gold/70">
              {{ comp.resolved.buyPrice.toLocaleString() }}g
            </span>
            <ShopBadge v-if="comp.resolved" :shop="comp.resolved.shop" />
          </div>
        </div>
      </div>

      <!-- Recursive: show sub-components if this component has its own recipe -->
      <div
        v-if="comp.resolved && comp.resolved.components.length > 0"
        class="ml-4 mt-1 border-l border-dota-border/40 pl-2"
      >
        <ComponentTree
          :components="comp.resolved.components"
          :depth="currentDepth + 1"
        />
      </div>
    </div>
  </div>
</template>
