export const PRODUCT_CATEGORIES = [
  { id: 'monitors', name: 'Monitors' },
  { id: 'graphics-cards', name: 'Graphics Cards' },
  { id: 'memory', name: 'Memory' },
  { id: 'processors', name: 'Processors' },
  { id: 'storage', name: 'Storage' },
  { id: 'motherboards', name: 'Motherboards' },
  { id: 'cases', name: 'Cases' },
  { id: 'power-supply', name: 'Power Supply' },
  { id: 'pre-built', name: 'PRE-BUILT' },
  { id: 'cpu-cooling', name: 'CPU Cooling' },
  { id: 'oem', name: 'OEM' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'laptops', name: 'Laptops' },
] as const

export type ProductCategoryId = (typeof PRODUCT_CATEGORIES)[number]['id']

export const CATEGORY_SPECS: Record<ProductCategoryId, string[]> = {
  monitors: ['Size in Inches', 'Resolution', 'Refresh Rate', 'Ports', 'Special Features'],
  'graphics-cards': ['Vram in GB', 'No. of fans', 'Video output ports', 'Power consumption', 'Memory type'],
  memory: ['Cas latency', 'Memory Speed', 'No. of modules'],
  processors: ['CPU Model', 'CPU Speed', 'CPU Cores', 'CPU Threads', 'CPU Socket'],
  storage: ['Model', 'Capacity', 'Type', 'Interface', 'Connectivity', 'Special Features'],
  motherboards: ['Model', 'Form Factor', 'Cpu socket', 'Ram type', 'Ram slots', 'Nvme slots', 'Sata ports', 'Special Features'],
  'power-supply': ['Model', 'Form Factor', 'Connectors', 'Watts', 'Power Rating', 'Special Features'],
  cases: ['Motherboard Compatibility', 'No. of fans', 'Fan size', 'Fans Connectivity', 'Graphics card allowance', 'Hard drive bays', 'Special Features'],
  'pre-built': ['Cpu socket', 'Ram slots', 'Nvme slots', 'Psu rating', 'Sata ports', 'Warranty Period in Months', 'No. Of fans included', 'Accessories included'],
  'cpu-cooling': ['Model', 'Color', 'Cooling method', 'Radiator size', 'No. of fans', 'Fans size', 'Special Features'],
  oem: ['Model', 'Cpu socket', 'Ram slots', 'Nvme slots', 'Power supply wattage', 'Sata ports', 'Warranty period in months', 'Accessories included'],
  laptops: ['Model', 'Screen Size (inches)', 'Resolution', 'Processor', 'RAM (GB)', 'Storage (GB/TB)', 'Graphics Card', 'Battery Life (hours)', 'Special Features'],
}

export function categoryName(categoryId: string) {
  return PRODUCT_CATEGORIES.find((category) => category.id === categoryId)?.name || categoryId
}

export function categoryId(categoryNameValue?: string | null): ProductCategoryId | undefined {
  if (!categoryNameValue) return undefined
  const normalized = categoryNameValue.toLowerCase().trim().replace(/[\s_]+/g, '-')
  return PRODUCT_CATEGORIES.find((category) =>
    category.id === normalized || category.name.toLowerCase().replace(/[\s_]+/g, '-') === normalized,
  )?.id
}

export function specificationKeys(category: string) {
  return CATEGORY_SPECS[categoryId(category) || 'accessories'] || []
}

export function formatCategory(category: string) {
  return categoryName(categoryId(category) || category)
}
