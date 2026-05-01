/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Users,
  UserRound,
  Coffee,
  ShoppingCart,
  CreditCard,
  MessageSquareText,
  Boxes,
  LogOut,
  CupSoda,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { clearStoredUser, getStoredUser } from '../services/auth';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Branches', path: '/branches', icon: Store },
  { name: 'Customers', path: '/customers', icon: UserRound },
  { name: 'Employees', path: '/employees', icon: Users },
  { name: 'Menu', path: '/menu', icon: Coffee },
  { name: 'Orders', path: '/orders', icon: ShoppingCart },
  { name: 'Payments', path: '/payments', icon: CreditCard },
  { name: 'Feedback', path: '/feedback', icon: MessageSquareText },
  { name: 'Inventory', path: '/inventory', icon: Boxes },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    clearStoredUser();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[270px] flex-col bg-forest text-white shadow-[8px_0_30px_rgba(27,53,40,0.18)]">
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/10 backdrop-blur">
            <CupSoda size={24} className="text-[#f6e9d2]" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">CENTRAL PERK</p>
            <p className="text-xs text-white/60">Cafe management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
          Main Menu
        </p>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/12 text-white ring-1 ring-white/10'
                  : 'text-white/68 hover:bg-white/6 hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-[#f1e5d2] text-forest'
                      : 'bg-white/6 text-white/70 group-hover:bg-white/10 group-hover:text-white'
                  )}
                >
                  <item.icon size={18} />
                </div>
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 rounded-2xl bg-white/6 p-4 ring-1 ring-white/8">
          <p className="text-sm font-semibold text-white">{user?.email || 'Signed In User'}</p>
          <p className="mt-1 text-xs text-white/55">Database-authenticated session</p>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/70 transition-all duration-200 hover:bg-white/6 hover:text-white"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/6">
            <LogOut size={18} />
          </div>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
