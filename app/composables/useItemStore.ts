import itemsData from '~/data/items.json'
import type { DotaItem, ShopName, SlotState } from '~/types/item'

const allItems = itemsData as DotaItem[]

// Lookup map: item ID -> item
const itemById = new Map<string, DotaItem>()
for (const item of allItems) {
  itemById.set(item.id, item)
}

const slots = ref<SlotState[]>(
  Array.from({ length: 6 }, (_, i) => ({ index: i, item: null })),
)

const activeSlotIndex = ref<number | null>(null)
const searchQuery = ref('')
const shopFilter = ref<ShopName | 'all'>('all')
const isPickerOpen = ref(false)

export function useItemStore() {
  const filteredItems = computed(() => {
    let result = allItems

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(item => item.name.toLowerCase().includes(q))
    }

    if (shopFilter.value !== 'all') {
      result = result.filter(item => item.shop === shopFilter.value)
    }

    return result
  })

  const totalCost = computed(() => {
    return slots.value.reduce((sum, slot) => {
      return sum + (slot.item?.buyPrice ?? 0)
    }, 0)
  })

  function openPicker(slotIndex: number) {
    activeSlotIndex.value = slotIndex
    searchQuery.value = ''
    shopFilter.value = 'all'
    isPickerOpen.value = true
  }

  function closePicker() {
    isPickerOpen.value = false
    activeSlotIndex.value = null
  }

  function selectItem(item: DotaItem) {
    if (activeSlotIndex.value !== null) {
      slots.value[activeSlotIndex.value].item = item
    }
    closePicker()
  }

  function clearSlot(slotIndex: number) {
    slots.value[slotIndex].item = null
  }

  function clearAll() {
    slots.value.forEach(slot => (slot.item = null))
  }

  function getItemById(id: string): DotaItem | undefined {
    return itemById.get(id)
  }

  return {
    allItems,
    slots,
    activeSlotIndex,
    searchQuery,
    shopFilter,
    isPickerOpen,
    filteredItems,
    totalCost,
    openPicker,
    closePicker,
    selectItem,
    clearSlot,
    clearAll,
    getItemById,
  }
}
