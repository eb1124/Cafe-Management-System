import { MenuItem, Order, Payment } from '../types';
import { apiService } from './api';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const CART_KEY = 'cafe_management_cart';

export const loadCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveCart = (cart: CartItem[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const getCartTotal = (cart: CartItem[]) => {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

export const addToCart = (item: MenuItem, quantity = 1): CartItem[] => {
  const cart = loadCart();
  const existing = cart.find((entry) => entry.id === item.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity,
    });
  }

  saveCart(cart);
  return cart;
};

export const updateCartItemQuantity = (id: string, quantity: number): CartItem[] => {
  const cart = loadCart();
  const updated = cart
    .map((entry) =>
      entry.id === id ? { ...entry, quantity: Math.max(1, quantity) } : entry
    )
    .filter((entry) => entry.quantity > 0);

  saveCart(updated);
  return updated;
};

export const removeCartItem = (id: string): CartItem[] => {
  const cart = loadCart().filter((entry) => entry.id !== id);
  saveCart(cart);
  return cart;
};

export const clearCart = (): CartItem[] => {
  saveCart([]);
  return [];
};

const extractEntityId = (payload: unknown): string => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Backend did not return a valid record.');
  }

  const record = payload as Record<string, unknown>;
  const possibleId = record.id ?? record._id;

  if (possibleId !== undefined && possibleId !== null) {
    return String(possibleId);
  }

  const firstPrimitiveValue = Object.values(record).find(
    (value) =>
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
  );

  if (firstPrimitiveValue !== undefined) {
    return String(firstPrimitiveValue);
  }

  throw new Error('Backend did not return a record ID.');
};

export const confirmOrderAndCreatePayment = async (
  customerId: string,
  branchId: string,
  cart: CartItem[],
  paymentMethod: 'Cash' | 'Card' | 'Online'
): Promise<{ order: Order; payment: Payment }> => {
  const total = getCartTotal(cart);
  const paymentDate = new Date().toISOString().split('T')[0];

  try {
    const response = await apiService.orders.confirm({
      customerId,
      branchId,
      totalAmount: total,
      status: 'Completed',
      paymentMethod,
      paymentDate,
      paymentStatus: 'Pending',
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const shouldFallback =
      message.includes('status 404') ||
      message.includes('route may be missing') ||
      message.includes('Cannot POST /orders/confirm');

    if (!shouldFallback) {
      throw error;
    }

    const createdOrder = await apiService.orders.create({
      customerId,
      branchId,
      orderDate: paymentDate,
      totalAmount: total,
      status: 'Completed',
    });

    const orderId = extractEntityId(createdOrder);

    const createdPayment = await apiService.payments.create({
      orderId,
      amount: total,
      paymentMethod,
      paymentDate,
      paymentStatus: 'Pending',
    });

    return {
      order: {
        id: orderId,
        customerId,
        branchId,
        orderDate: paymentDate,
        totalAmount: total,
        status: 'Pending',
      },
      payment: {
        id: extractEntityId(createdPayment),
        orderId,
        amount: total,
        paymentMethod,
        paymentDate,
        paymentStatus: 'Pending',
      },
    };
  }
};

// Backward-compatible alias for older imports during Vite reloads.
export const createConfirmedOrder = async (
  customerId: string,
  branchId: string,
  cart: CartItem[]
): Promise<string> => {
  const total = getCartTotal(cart);

  const createdOrder = await apiService.orders.create({
    customerId,
    branchId,
    totalAmount: total,
    status: 'Pending',
    orderDate: new Date().toISOString().split('T')[0],
  });

  return extractEntityId(createdOrder);
};

// Backward-compatible alias for older imports during Vite reloads.
export const createOrUpdateOrder = createConfirmedOrder;

export const createPaymentForOrder = async (
  orderId: string,
  amount: number,
  paymentMethod: 'Cash' | 'Card' | 'Online' = 'Cash'
): Promise<string> => {
  const createdPayment = await apiService.payments.create({
    orderId,
    amount,
    paymentMethod,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'Pending',
  });

  return extractEntityId(createdPayment);
};

// Backward-compatible alias for older imports during Vite reloads.
export const createOrUpdatePayment = createPaymentForOrder;

export const formatReceipt = (
  cart: CartItem[],
  customerName?: string,
  branchName?: string,
  paymentMethod?: 'Cash' | 'Card' | 'Online'
) => {
  const total = getCartTotal(cart);
  const now = new Date();
  const formattedDate = now.toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const lines = cart.map(
    (item, index) =>
      `${index + 1}. ${item.name} x${item.quantity}  Rs ${item.price.toFixed(2)}  Rs ${(item.price * item.quantity).toFixed(2)}`
  );

  return [
    'BILL RECEIPT',
    `Date: ${formattedDate}`,
    customerName ? `Customer: ${customerName}` : 'Customer: -',
    branchName ? `Branch: ${branchName}` : 'Branch: -',
    paymentMethod ? `Payment: ${paymentMethod}` : 'Payment: -',
    '------------------------------',
    ...lines,
    '------------------------------',
    `Total: Rs ${total.toFixed(2)}`,
    'Thank you for shopping at Brew Haven!',
  ].join('\n');
};
