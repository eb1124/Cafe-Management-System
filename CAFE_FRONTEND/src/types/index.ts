/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Branch {
  id: string;
  name: string;
  location: string;
  contact: string;
  manager: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  salary: number;
  branchId: string;
  phone: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  availability: boolean;
  image?: string;
}

export interface Order {
  id: string;
  customerId: string;
  branchId: string;
  orderDate: string;
  totalAmount: number;
  status: 'Pending' | 'Completed' | 'Cancelled';
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: 'Cash' | 'Card' | 'Online';
  paymentDate: string;
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
}

export interface Feedback {
  id: string;
  rating: number;
  comments: string;
  feedbackDate: string;
}

export interface InventoryItem {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  lastUpdated: string;
}

export interface Recipe {
  id: string;
  recipeName: string;
  category: string;
  price: number;
}

export interface AuthUser {
  id: string;
  email: string;
}
