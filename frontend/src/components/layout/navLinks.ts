import { Home, Package, ShoppingBag, Trophy, Users } from 'lucide-react';

export interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
  authOnly: boolean;
}

export const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Inicio', icon: Home, authOnly: false },
  { href: '/products', label: 'Marketplace', icon: ShoppingBag, authOnly: false },
  { href: '/products/my', label: 'Mis items', icon: Package, authOnly: true },
  { href: '/friends', label: 'Amigos', icon: Users, authOnly: true },
  { href: '/communities', label: 'Comunidades', icon: Trophy, authOnly: true },
];
