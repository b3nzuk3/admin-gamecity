import type { LucideIcon } from 'lucide-react'
import { Boxes, FolderTree, Gauge, Image, LayoutTemplate, Package, Settings, ShoppingCart, Users } from 'lucide-react'

export type NavItem = { label: string; path: string; icon: LucideIcon; enabled?: boolean }
export type NavSection = { label?: string; items: NavItem[] }

export const navSections: NavSection[] = [
  { items: [{ label: 'Dashboard', path: '/', icon: Gauge, enabled: true }] },
  { label: 'Catalog', items: [
    { label: 'Products', path: '/products', icon: Package, enabled: true },
    { label: 'Inventory', path: '/inventory', icon: Boxes, enabled: true },
    { label: 'Categories', path: '/categories', icon: FolderTree },
  ] },
  { label: 'Sales', items: [
    { label: 'Orders', path: '/orders', icon: ShoppingCart, enabled: true },
    { label: 'Customers', path: '/customers', icon: Users, enabled: true },
  ] },
  { label: 'Content', items: [
    { label: 'Homepage', path: '/homepage', icon: LayoutTemplate },
    { label: 'Media', path: '/media', icon: Image },
  ] },
  { label: 'System', items: [{ label: 'Settings', path: '/settings', icon: Settings }] },
]
