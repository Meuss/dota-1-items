export interface ComponentRef {
  name: string
  quantity: number
  itemId?: string
}

export interface DotaItem {
  id: string
  name: string
  image: string
  description: string
  buyPrice: number | null
  sellPrice: number | null
  shop: ShopName
  usedToMake: string[]
  components: ComponentRef[]
}

export const SHOP_NAMES = [
  'Cache of Quel-thelan',
  'Ancient of Wonders',
  'Sena The Accessorizer',
  'Weapons Dealer',
  'Leragas the Vile',
  'Protectorate',
  'Arcane Sanctum',
  'Supportive Vestment',
  'Ancient Weaponry',
  'Enchanted Artifacts',
  'Gateway Relics',
] as const

export type ShopName = (typeof SHOP_NAMES)[number]

export const SHOP_COLORS: Record<ShopName, string> = {
  'Cache of Quel-thelan': 'bg-amber-700 text-amber-100',
  'Ancient of Wonders': 'bg-cyan-700 text-cyan-100',
  'Sena The Accessorizer': 'bg-pink-700 text-pink-100',
  'Weapons Dealer': 'bg-red-700 text-red-100',
  'Leragas the Vile': 'bg-purple-700 text-purple-100',
  'Protectorate': 'bg-blue-700 text-blue-100',
  'Arcane Sanctum': 'bg-indigo-700 text-indigo-100',
  'Supportive Vestment': 'bg-green-700 text-green-100',
  'Ancient Weaponry': 'bg-orange-700 text-orange-100',
  'Enchanted Artifacts': 'bg-teal-700 text-teal-100',
  'Gateway Relics': 'bg-yellow-700 text-yellow-100',
}

export interface SlotState {
  index: number
  item: DotaItem | null
}
