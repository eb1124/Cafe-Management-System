/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { motion } from 'motion/react';
import { apiService } from '../services/api';
import { Order, Customer, MenuItem } from '../types';

export const DashboardLayout = () => {
  const [searchData, setSearchData] = useState({
    orders: [] as Order[],
    customers: [] as Customer[],
    menuItems: [] as MenuItem[],
  });

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const [orders, customers, menuItems] = await Promise.all([
          apiService.orders.getAll(),
          apiService.customers.getAll(),
          apiService.menu.getAll(),
        ]);

        setSearchData({
          orders,
          customers,
          menuItems,
        });
      } catch (error) {
        console.error('Error fetching search data:', error);
      }
    };

    fetchSearchData();
  }, []);

  return (
    <div className="min-h-screen app-shell-bg">
      <Sidebar />
      <Navbar
        orders={searchData.orders}
        customers={searchData.customers}
        menuItems={searchData.menuItems}
      />

      <main className="min-h-screen pl-[270px] pt-[92px] transition-all duration-300">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="mx-auto max-w-[1560px] px-8 py-8 lg:px-10"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};