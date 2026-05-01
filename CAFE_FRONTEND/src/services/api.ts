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

// API Base URL - from environment or default to localhost
const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined;

const API_BASE_URL = (() => {
  const fallback = 'http://localhost:5000';
  if (!rawApiUrl || !rawApiUrl.trim()) {
    return fallback;
  }

  const trimmed = rawApiUrl.trim().replace(/\/$/, '');

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (trimmed.startsWith(':')) {
    return `http://localhost${trimmed}`;
  }

  return `http://${trimmed}`;
})();

// Mock Data (kept for documentation/reference purposes)
// These can be used for development/testing if needed


export const apiService = {
  auth: {
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/login`, {
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
    const res = await fetch(`${API_BASE_URL}/branches`);
    return res.json();
  },

  getById: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/branches/${id}`);
    return res.json();
  },

  create: async (data: Omit<Branch, 'id'>) => {
    const res = await fetch(`${API_BASE_URL}/branches`, {
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
    const res = await fetch(`${API_BASE_URL}/branches/${id}`, {
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
    const res = await fetch(`${API_BASE_URL}/branches/${id}`, {
      method: "DELETE"
    });
    return res.json();
  },
},
  customers: {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/customers`);
    return parseResponse<Customer[]>(res);
  },

  create: async (data: Omit<Customer, 'id'>) => {
    const res = await fetch(`${API_BASE_URL}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return parseResponse(res);
  },

  update: async (id: string, data: Partial<Omit<Customer, 'id'>>) => {
    const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return parseResponse(res);
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: "DELETE"
    });
    return parseResponse(res);
  }
},
  employees: {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/employees`);
    return res.json() as Promise<Employee[]>;
  },

  create: async (data: Omit<Employee, 'id'>) => {
    const res = await fetch(`${API_BASE_URL}/employees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  update: async (id: string, data: Partial<Omit<Employee, 'id'>>) => {
    const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: "DELETE"
    });
    return res.json();
  }
},
  menu: {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/menu`);
    return res.json() as Promise<MenuItem[]>;
  },

  create: async (data: Omit<MenuItem, 'id'>) => {
    const res = await fetch(`${API_BASE_URL}/menu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: data.name,
        category: data.category,
        price: data.price,
        availability: data.availability ? 1 : 0
      })
    });
    return res.json();
  },

  update: async (id: string, data: Partial<Omit<MenuItem, 'id'>>) => {
    const res = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: data.name,
        category: data.category,
        price: data.price,
        availability: data.availability ? 1 : 0
      })
    });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: "DELETE"
    });
    return res.json();
  }
},
  orders: {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/orders`);
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
    const res = await fetch(`${API_BASE_URL}/orders/confirm`, {
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
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return parseResponse(res);
  },

  update: async (id: string, data: Partial<Omit<Order, 'id'>>) => {
    const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: "DELETE"
    });
    return res.json();
  }
},
  payments: {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/payments`);
    return parseResponse<Payment[]>(res);
  },

  create: async (data: Omit<Payment, 'id'>) => {
    const res = await fetch(`${API_BASE_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return parseResponse(res);
  },

  update: async (id: string, data: Partial<Omit<Payment, 'id'>>) => {
    const res = await fetch(`${API_BASE_URL}/payments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/payments/${id}`, {
      method: "DELETE"
    });
    return res.json();
  }
},
  feedback: {
  getAll: async (rating?: number) => {
    const url = rating ? `${API_BASE_URL}/feedback?rating=${rating}` : `${API_BASE_URL}/feedback`;
    const res = await fetch(url);
    return parseResponse<Feedback[]>(res);
  },

  create: async (data: Omit<Feedback, 'id'>) => {
    const res = await fetch(`${API_BASE_URL}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return parseResponse(res);
  },

  update: async (id: string, data: Partial<Omit<Feedback, 'id'>>) => {
    const res = await fetch(`${API_BASE_URL}/feedback/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return parseResponse(res);
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/feedback/${id}`, {
      method: "DELETE"
    });
    return parseResponse(res);
  }
},
  inventory: {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/inventory`);
    return parseResponse<InventoryItem[]>(res);
  },

  create: async (data: Omit<InventoryItem, 'id'>) => {
    const res = await fetch(`${API_BASE_URL}/inventory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return parseResponse(res);
  },

  update: async (id: string, data: Partial<Omit<InventoryItem, 'id'>>) => {
    const res = await fetch(`${API_BASE_URL}/inventory/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return parseResponse(res);
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/inventory/${id}`, {
      method: "DELETE"
    });
    return parseResponse(res);
  }
},
};
