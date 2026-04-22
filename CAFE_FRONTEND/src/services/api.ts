/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Branch,
  Customer,
  Employee,
  Feedback,
  InventoryItem,
  MenuItem,
  Order,
  Payment,
  Recipe,
  AuthUser,
} from '../types';

const parseResponse = async <T>(res: Response): Promise<T> => {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const rawBody = await res.text();
  const data = isJson && rawBody ? JSON.parse(rawBody) : rawBody;

  if (!res.ok) {
    const message =
      (typeof data === 'object' && data && 'sqlMessage' in data && String(data.sqlMessage)) ||
      (typeof data === 'object' && data && 'message' in data && String(data.message)) ||
      (typeof data === 'string' && data.trim().startsWith('<!DOCTYPE')
        ? `Request failed with status ${res.status}. Backend route may be missing or server may need restart.`
        : '') ||
      (typeof data === 'string' && data.trim()) ||
      `Request failed with status ${res.status}`;

    throw new Error(message);
  }

  return data as T;
};

// API Base URL - Update this when connecting to a real backend
const API_BASE_URL = 'http://localhost:5000';

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data
const mockBranches: Branch[] = [
  { id: '1', name: 'Main Street Cafe', location: 'Downtown', contact: '123-456-7890', manager: 'John Doe' },
  { id: '2', name: 'Uptown Bistro', location: 'Uptown', contact: '987-654-3210', manager: 'Jane Smith' },
];

const mockCustomers: Customer[] = [
  { id: '1', name: 'Alice Johnson', phone: '555-0101', email: 'alice@example.com', address: '123 Oak St' },
  { id: '2', name: 'Bob Wilson', phone: '555-0102', email: 'bob@example.com', address: '456 Pine St' },
];

const mockEmployees: Employee[] = [
  { id: '1', name: 'Charlie Brown', role: 'Barista', salary: 3000, branchId: '1', phone: '555-0201' },
  { id: '2', name: 'Diana Prince', role: 'Manager', salary: 5000, branchId: '2', phone: '555-0202' },
];

const mockMenu: MenuItem[] = [
  { id: '1', name: 'Espresso', category: 'Coffee', price: 3.5, availability: true },
  { id: '2', name: 'Croissant', category: 'Pastry', price: 4.0, availability: true },
  { id: '3', name: 'Latte', category: 'Coffee', price: 4.5, availability: false },
];

const mockOrders: Order[] = [
  { id: '1', customerId: '1', branchId: '1', orderDate: '2024-03-15', totalAmount: 15.5, status: 'Completed' },
  { id: '2', customerId: '2', branchId: '2', orderDate: '2024-03-16', totalAmount: 22.0, status: 'Pending' },
];

const mockPayments: Payment[] = [
  { id: '1', orderId: '1', amount: 15.5, paymentMethod: 'Card', paymentDate: '2024-03-15', paymentStatus: 'Paid' },
  { id: '2', orderId: '2', amount: 22.0, paymentMethod: 'Cash', paymentDate: '2024-03-16', paymentStatus: 'Pending' },
];

export const apiService = {
  auth: {
  login: async (email: string, password: string) => {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });
    return parseResponse<AuthUser>(res);
  },
},
  branches: {
  getAll: async () => {
    const res = await fetch("http://localhost:5000/branches");
    return res.json();
  },

  getById: async (id: string) => {
    const res = await fetch(`http://localhost:5000/branches/${id}`);
    return res.json();
  },

  create: async (data: Omit<Branch, 'id'>) => {
    const res = await fetch("http://localhost:5000/branches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: data.name,
        location: data.location,
        contact: data.contact,
        manager: data.manager
      })
    });
    return res.json();
  },

  update: async (id: string, data: Partial<Branch>) => {
    const res = await fetch(`http://localhost:5000/branches/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: data.name,
        location: data.location,
        contact: data.contact,
        manager: data.manager
      })
    });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`http://localhost:5000/branches/${id}`, {
      method: "DELETE"
    });
    return res.json();
  },
},
  customers: {
  getAll: async () => {
    const res = await fetch("http://localhost:5000/customers");
    return res.json() as Promise<Customer[]>;
  },

  create: async (data: Omit<Customer, 'id'>) => {
    const res = await fetch("http://localhost:5000/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  update: async (id: string, data: Partial<Omit<Customer, 'id'>>) => {
    const res = await fetch(`http://localhost:5000/customers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`http://localhost:5000/customers/${id}`, {
      method: "DELETE"
    });
    return res.json();
  }
},
  employees: {
  getAll: async () => {
    const res = await fetch("http://localhost:5000/employees");
    return res.json() as Promise<Employee[]>;
  },

  create: async (data: Omit<Employee, 'id'>) => {
    const res = await fetch("http://localhost:5000/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  update: async (id: string, data: Partial<Omit<Employee, 'id'>>) => {
    const res = await fetch(`http://localhost:5000/employees/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`http://localhost:5000/employees/${id}`, {
      method: "DELETE"
    });
    return res.json();
  }
},
  menu: {
  getAll: async () => {
    const res = await fetch("http://localhost:5000/menu");
    return res.json() as Promise<MenuItem[]>;
  },

  create: async (data: Omit<MenuItem, 'id'>) => {
    const res = await fetch("http://localhost:5000/menu", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  update: async (id: string, data: Partial<Omit<MenuItem, 'id'>>) => {
    const res = await fetch(`http://localhost:5000/menu/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`http://localhost:5000/menu/${id}`, {
      method: "DELETE"
    });
    return res.json();
  }
},
  orders: {
  getAll: async () => {
    const res = await fetch("http://localhost:5000/orders");
    return parseResponse<Order[]>(res);
  },

  confirm: async (data: {
    customerId: string;
    branchId: string;
    totalAmount: number;
    status: 'Pending' | 'Completed' | 'Cancelled';
    paymentMethod: 'Cash' | 'Card' | 'Online';
    paymentDate: string;
    paymentStatus: 'Paid' | 'Pending' | 'Failed';
  }) => {
    const res = await fetch("http://localhost:5000/orders/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return parseResponse<{
      order: Order;
      payment: Payment;
      message: string;
    }>(res);
  },

  create: async (data: Omit<Order, 'id'>) => {
    const res = await fetch("http://localhost:5000/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return parseResponse(res);
  },

  update: async (id: string, data: Partial<Omit<Order, 'id'>>) => {
    const res = await fetch(`http://localhost:5000/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`http://localhost:5000/orders/${id}`, {
      method: "DELETE"
    });
    return res.json();
  }
},
  payments: {
  getAll: async () => {
    const res = await fetch("http://localhost:5000/payments");
    return parseResponse<Payment[]>(res);
  },

  create: async (data: Omit<Payment, 'id'>) => {
    const res = await fetch("http://localhost:5000/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return parseResponse(res);
  },

  update: async (id: string, data: Partial<Omit<Payment, 'id'>>) => {
    const res = await fetch(`http://localhost:5000/payments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`http://localhost:5000/payments/${id}`, {
      method: "DELETE"
    });
    return res.json();
  }
},
  feedback: {
  getAll: async () => {
    const res = await fetch("http://localhost:5000/feedback");
    return parseResponse<Feedback[]>(res);
  },

  create: async (data: Omit<Feedback, 'id'>) => {
    const res = await fetch("http://localhost:5000/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return parseResponse(res);
  },

  update: async (id: string, data: Partial<Omit<Feedback, 'id'>>) => {
    const res = await fetch(`http://localhost:5000/feedback/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return parseResponse(res);
  },

  delete: async (id: string) => {
    const res = await fetch(`http://localhost:5000/feedback/${id}`, {
      method: "DELETE"
    });
    return parseResponse(res);
  }
},
  inventory: {
  getAll: async () => {
    const res = await fetch("http://localhost:5000/inventory");
    return parseResponse<InventoryItem[]>(res);
  },

  create: async (data: Omit<InventoryItem, 'id'>) => {
    const res = await fetch("http://localhost:5000/inventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return parseResponse(res);
  },

  update: async (id: string, data: Partial<Omit<InventoryItem, 'id'>>) => {
    const res = await fetch(`http://localhost:5000/inventory/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return parseResponse(res);
  },

  delete: async (id: string) => {
    const res = await fetch(`http://localhost:5000/inventory/${id}`, {
      method: "DELETE"
    });
    return parseResponse(res);
  }
},
  recipe: {
  getAll: async () => {
    const res = await fetch("http://localhost:5000/recipe");
    return parseResponse<Recipe[]>(res);
  },

  create: async (data: Omit<Recipe, 'id'>) => {
    const res = await fetch("http://localhost:5000/recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return parseResponse(res);
  },

  update: async (id: string, data: Partial<Omit<Recipe, 'id'>>) => {
    const res = await fetch(`http://localhost:5000/recipe/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return parseResponse(res);
  },

  delete: async (id: string) => {
    const res = await fetch(`http://localhost:5000/recipe/${id}`, {
      method: "DELETE"
    });
    return parseResponse(res);
  }
},
};
