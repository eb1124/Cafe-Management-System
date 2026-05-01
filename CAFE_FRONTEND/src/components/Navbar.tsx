/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ShoppingCart, Users, Coffee } from 'lucide-react';
import { Order, Customer, MenuItem } from '../types';

interface NavbarProps {
  orders?: Order[];
  customers?: Customer[];
  menuItems?: MenuItem[];
}

export const Navbar = ({ orders = [], customers = [], menuItems = [] }: NavbarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Search results logic
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: any[] = [];

    // Search orders
    orders.forEach((order) => {
      if (
        String(order.id).toLowerCase().includes(query) ||
        String(order.status || '').toLowerCase().includes(query)
      ) {
        results.push({ type: 'order', data: order });
      }
    });

    // Search customers
    customers.forEach((customer) => {
      if (
        String(customer.name || '').toLowerCase().includes(query) ||
        String(customer.email || '').toLowerCase().includes(query) ||
        String(customer.phone || '').toLowerCase().includes(query)
      ) {
        results.push({ type: 'customer', data: customer });
      }
    });

    // Search menu items
    menuItems.forEach((item) => {
      if (
        String(item.name || '').toLowerCase().includes(query) ||
        String(item.category || '').toLowerCase().includes(query)
      ) {
        results.push({ type: 'menu', data: item });
      }
    });

    return results.slice(0, 8); // Limit to 8 results
  }, [searchQuery, orders, customers, menuItems]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  return (
    <header className="fixed left-[270px] right-0 top-0 z-40 h-[92px] border-b border-line/80 bg-cream/90 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-8 lg:px-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Daily Operations
          </p>
          <h1 className="mt-1 text-[24px] font-semibold tracking-tight text-ink">
            Cafe Management Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden w-[360px] md:block">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/70"
            />
            <input
              type="text"
              placeholder="Search orders, customers, menu..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="app-input pl-11 pr-4"
            />

            {/* Search Results Dropdown */}
            {isSearchOpen && (searchQuery || searchResults.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-line bg-white shadow-lg z-50 max-h-[400px] overflow-y-auto">
                {searchQuery && searchResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted">
                    No results found for "{searchQuery}"
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#f7f1e8] transition-colors cursor-pointer"
                      >
                        {result.type === 'order' && (
                          <>
                            <ShoppingCart size={16} className="text-forest flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-ink">Order #{result.data.id}</p>
                              <p className="text-xs text-muted">Status: {result.data.status}</p>
                            </div>
                          </>
                        )}
                        {result.type === 'customer' && (
                          <>
                            <Users size={16} className="text-blue-600 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-ink">{result.data.name}</p>
                              <p className="text-xs text-muted truncate">{result.data.email || result.data.phone}</p>
                            </div>
                          </>
                        )}
                        {result.type === 'menu' && (
                          <>
                            <Coffee size={16} className="text-amber-600 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-ink">{result.data.name}</p>
                              <p className="text-xs text-muted">{result.data.category} • Rs {result.data.price.toFixed(2)}</p>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            {/* Close dropdown when clicking outside */}
            {isSearchOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsSearchOpen(false)}
              />
            )}
          </div>

          <button className="flex items-center gap-3 rounded-2xl border border-line bg-card px-3 py-2.5 transition-all duration-200 hover:bg-card-strong">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest text-sm font-semibold text-white">
              K
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-ink">RACHEL GREEN</p>
              <p className="text-xs text-muted">Super Admin</p>
            </div>
            <ChevronDown size={16} className="text-muted" />
          </button>
        </div>
      </div>
    </header>
  );
};