<script setup lang="ts">
import type { DotaItem } from '~/types/item'

defineProps<{
  item: DotaItem
}>()

defineEmits<{
  select: [item: DotaItem]
}>()
</script>

<template>
  <button
    class="flex items-center gap-3 rounded-lg border border-dota-border bg-dota-surface p-2 text-left transition-colors hover:border-dota-gold-dim hover:bg-dota-surface-hover"
    @click="$emit('select', item)"
  >
    <img
      :src="item.image"
      :alt="item.name"
      class="size-10 shrink-0 rounded object-cover"
      loading="lazy"
    />
    <div class="min-w-0 flex-1">
      <div class="truncate text-sm font-medium text-dota-text">{{ item.name }}</div>
      <div class="mt-0.5 flex items-center gap-2">
        <span v-if="item.buyPrice" class="text-xs font-semibold text-dota-gold">
          {{ item.buyPrice.toLocaleString() }}g
        </span>
        <ShopBadge :shop="item.shop" />
      </div>
    </div>
  </button>
</template>
