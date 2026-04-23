import React, { useEffect, useState } from 'react';
import {
  Store,
  Users,
  UserRound,
  Coffee,
  ShoppingCart,
  CreditCard,
  Plus,
  ArrowRight,
  Clock3,
  Leaf,
  AlertCircle,
  CheckCircle2,
  Info,
  Receipt,
  Printer,
  Download,
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { StatCard, Card, PageHeader, DataTable, LoadingSpinner } from '../components/Common';
import { Modal } from '../components/Modals';
import { apiService } from '../services/api';
import {
  loadCart,
  clearCart,
  getCartTotal,
  formatReceipt,
  CartItem,
  updateCartItemQuantity,
  removeCartItem,
  confirmOrderAndCreatePayment,
} from '../services/cart';
import { Order, MenuItem, Customer, Branch } from '../types';
import { fallbackImages } from '../utils/fallbackImages';
import { downloadReceiptPdf } from '../utils/receiptPdf';
import { getCurrentDateIST } from '../utils/timezone';

export const DashboardPage = () => {
  const navigate = useNavigate(); // ✅ added

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    branches: 0,
    customers: 0,
    employees: 0,
    menuItems: 0,
    orders: 0,
    payments: 0,
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Online'>('Cash');
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error', visible: false });

  // Sample notifications
  const sampleNotifications = [
    {
      id: 1,
      type: 'success',
      title: 'Order Completed',
      message: 'Order #1024 has been successfully prepared and is ready for pickup.',
      timestamp: '5 minutes ago',
      icon: CheckCircle2,
    },
    {
      id: 2,
      type: 'warning',
      title: 'Low Inventory',
      message: 'Espresso beans inventory is running low. Reorder recommended.',
      timestamp: '15 minutes ago',
      icon: AlertCircle,
    },
    {
      id: 3,
      type: 'info',
      title: 'New Customer',
      message: 'Sarah Johnson created a new account and placed her first order.',
      timestamp: '1 hour ago',
      icon: Info,
    },
    {
      id: 4,
      type: 'success',
      title: 'Payment Received',
      message: 'Payment of Rs 450 received from John Doe for Order #1023.',
      timestamp: '2 hours ago',
      icon: CheckCircle2,
    },
  ];

  useEffect(() => {
    setCartItems(loadCart());
    const fetchData = async () => {
      try {
        const [branches, customers, employees, menu, orders, payments] =
          await Promise.all([
            apiService.branches.getAll(),
            apiService.customers.getAll(),
            apiService.employees.getAll(),
            apiService.menu.getAll(),
            apiService.orders.getAll(),
            apiService.payments.getAll(),
          ]);

        setStats({
          branches: branches.length,
          customers: customers.length,
          employees: employees.length,
          menuItems: menu.length,
          orders: orders.length,
          payments: payments.length,
        });

        setCustomers(customers);
        setBranches(branches);
        setSelectedCustomerId((prev) => prev || customers[0]?.id || '');
        setSelectedBranchId((prev) => prev || branches[0]?.id || '');

        setRecentOrders(orders.slice(0, 5));
        setPopularItems(menu.slice(0, 4));
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleClearCart = () => {
    setCartItems(clearCart());
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems(removeCartItem(id));
  };

  const handleQuantityChange = (id: string, delta: number) => {
    const item = cartItems.find((entry) => entry.id === id);
    if (!item) return;
    setCartItems(updateCartItemQuantity(id, item.quantity + delta));
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      showToast('Cart is empty. Add items before confirming.', 'error');
      return;
    }

    if (!selectedCustomerId || !selectedBranchId) {
      showToast('Please select a customer and branch', 'error');
      return;
    }

    setIsConfirmingOrder(true);
    try {
      const { order, payment } = await confirmOrderAndCreatePayment(
        selectedCustomerId,
        selectedBranchId,
        cartItems,
        paymentMethod
      );

      setCartItems(clearCart());
      setStats((prev) => ({
        ...prev,
        orders: prev.orders + 1,
        payments: prev.payments + 1,
      }));
      setRecentOrders((prev) => [
        {
          ...order,
          orderDate: order.orderDate || getCurrentDateIST(),
        },
        ...prev,
      ].slice(0, 5));
      showToast(
        `Order confirmed successfully! Order ID: ${order.id}, Payment ID: ${payment.id}`,
        'success'
      );
    } catch (error) {
      console.error('Error confirming order:', error);
      showToast(
        error instanceof Error ? error.message : 'Error confirming order. Please try again.',
        'error'
      );
    } finally {
      setIsConfirmingOrder(false);
    }
  };

  const selectedCustomer = customers.find(
    (c) => String(c.id) === String(selectedCustomerId)
  );
  const selectedBranch = branches.find(
    (b) => String(b.id) === String(selectedBranchId)
  );
  const receiptContent = formatReceipt(
    cartItems,
    selectedCustomer?.name,
    selectedBranch?.name,
    paymentMethod
  );

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank', 'width=480,height=720');
    if (!printWindow) {
      showToast('Please allow popups to print the receipt.', 'error');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body {
              font-family: "Courier New", monospace;
              background: #f6f1e8;
              margin: 0;
              padding: 24px;
            }
            .receipt {
              max-width: 360px;
              margin: 0 auto;
              background: #fffdf9;
              border: 1px dashed #bda98a;
              padding: 24px;
              color: #213029;
              box-shadow: 0 12px 30px rgba(33, 48, 41, 0.08);
            }
            .brand {
              text-align: center;
              margin-bottom: 16px;
              font-size: 18px;
              font-weight: bold;
              letter-spacing: 0.08em;
            }
            pre {
              white-space: pre-wrap;
              margin: 0;
              font-size: 13px;
              line-height: 1.7;
            }
            @media print {
              body {
                background: white;
                padding: 0;
              }
              .receipt {
                box-shadow: none;
                border: none;
                max-width: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="brand">BREW HAVEN</div>
            <pre>${receiptContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleDownloadReceiptPdf = () => {
    downloadReceiptPdf(`receipt-${getCurrentDateIST()}.pdf`, receiptContent);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <PageHeader
        title="Dashboard Overview"
        subtitle="A calm look at today’s cafe activity, orders, and best-selling items."
        action={
          <button
            onClick={() => navigate("/orders")} // ✅ FIXED
            className="app-btn-primary px-7 py-4"
          >
            <Plus size={18} />
            <span>Create New Order</span>
          </button>
        }
      />

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_1fr]">

        {/* LEFT SECTION */}
        <div className="app-surface p-6 md:p-7">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                Daily Operations
              </p>
              <h2 className="text-2xl font-semibold">
                Steady day at Brew Haven
              </h2>
              <p className="text-sm text-muted">
                Keep an eye on customer flow, menu performance, and completed orders across branches.
              </p>
            </div>

            <div className="flex items-center gap-2 text-muted">
              <Clock3 size={18} />
              Refreshed just now
            </div>
          </div>

          {/* STATS */}
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <StatCard title="Total Branches" value={stats.branches} icon={Store} />
            <StatCard title="Total Customers" value={stats.customers} icon={UserRound} />
            <StatCard title="Total Employees" value={stats.employees} icon={Users} />
            <StatCard title="Menu Items" value={stats.menuItems} icon={Coffee} />
            <StatCard title="Total Orders" value={stats.orders} icon={ShoppingCart} />
            <StatCard title="Payments" value={stats.payments} icon={CreditCard} />
          </div>
        </div>

        {/* RIGHT SECTION - POPULAR ITEMS */}
        <div className="app-surface p-6 md:p-7">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Popular Items</h3>
            <Leaf size={18} />
          </div>

          <p className="text-sm text-muted mt-1">
            Featured menu picks customers are ordering most often.
          </p>

          <div className="mt-5 space-y-4">
            {popularItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={fallbackImages[item.name] || fallbackImages["Espresso"]}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted">{item.category}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold">₹{item.price.toFixed(2)}</p>
                  <p className="text-xs text-green-600">
                    {item.availability ? "In stock" : "Out of stock"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/menu")} // ✅ FIXED
            className="app-btn-secondary mt-6 w-full justify-center"
          >
            View Full Menu
          </button>
        </div>
      </div>

      {/* NOTIFICATIONS SECTION */}
      <Card
        title="Notifications"
        subtitle="Recent alerts and updates from your cafe operations."
        action={
          <span className="text-sm font-semibold text-forest">{sampleNotifications.length}</span>
        }
      >
        <div className="space-y-3">
          {sampleNotifications.map((notification) => {
            const Icon = notification.icon;
            const bgColorMap: Record<string, string> = {
              success: 'bg-[#edf5e9] border-[#d4e8cc]',
              warning: 'bg-[#fef7f0] border-[#fce4d6]',
              info: 'bg-[#f0f4f8] border-[#dce5f0]',
            };
            const iconColorMap: Record<string, string> = {
              success: 'text-[#2f6a3e]',
              warning: 'text-[#9a5748]',
              info: 'text-[#3b5998]',
            };

            return (
              <div
                key={notification.id}
                className={`flex gap-4 rounded-2xl border p-4 transition-all duration-200 hover:shadow-md ${bgColorMap[notification.type]}`}
              >
                <Icon
                  size={20}
                  className={`mt-0.5 flex-shrink-0 ${iconColorMap[notification.type]}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink">{notification.title}</p>
                  <p className="text-sm text-muted mt-1">{notification.message}</p>
                  <p className="text-xs text-muted mt-2">{notification.timestamp}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card
        title="Cart"
        subtitle="Track selected menu items and generate a bill receipt from the dashboard."
        action={
          <button
            type="button"
            onClick={handleClearCart}
            className="inline-flex items-center gap-2 text-sm font-semibold text-forest transition hover:text-forest-deep"
          >
            Clear Cart
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 mb-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Customer</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="app-input w-full"
            >
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Branch</label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="app-input w-full"
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {cartItems.length === 0 ? (
          <div className="rounded-3xl border border-line bg-card p-6 text-sm text-muted">
            Your cart is empty. Add items from the menu page to build a bill.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
              <div className="rounded-3xl border border-line bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Cart Items</h3>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted">Rs {item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="app-icon-btn"
                        >
                          -
                        </button>
                        <span className="min-w-[32px] text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="app-icon-btn"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">Rs {(item.price * item.quantity).toFixed(2)}</p>
                        <button
                          type="button"
                          onClick={() => handleRemoveCartItem(item.id)}
                          className="text-xs text-[#9a5748] underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-line bg-card p-6">
                <h3 className="mb-3 text-lg font-semibold">Bill Receipt</h3>
                <p className="text-sm text-muted">
                  Open a receipt-style popup, then print it or download it as PDF.
                </p>
                <div className="mt-5 rounded-[28px] border border-dashed border-[#d9ccb8] bg-[#faf8f4] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                        Receipt Preview
                      </p>
                      <p className="mt-2 text-sm text-ink">
                        {selectedCustomer?.name || 'Customer'} · {selectedBranch?.name || 'Branch'}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        Total Rs {getCartTotal(cartItems).toFixed(2)} · {paymentMethod}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-3 text-forest shadow-sm">
                      <Receipt size={22} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReceiptModalOpen(true)}
                    className="app-btn-secondary mt-5 w-full justify-center"
                  >
                    <Receipt size={16} />
                    <span>Open Receipt Popup</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-3xl border border-line bg-card p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-muted">Total items</p>
                <p className="text-2xl font-semibold">{cartItems.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Bill total</p>
                <p className="text-2xl font-semibold">Rs {getCartTotal(cartItems).toFixed(2)}</p>
              </div>
            </div>

            {/* Payment Method and Confirm Order */}
            <div className="rounded-3xl border border-line bg-card p-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'Cash' | 'Card' | 'Online')}
                  className="app-input w-full"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Online">Online</option>
                </select>
              </div>
              <button
                onClick={handleConfirmOrder}
                disabled={isConfirmingOrder || cartItems.length === 0}
                className="app-btn-primary w-full py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConfirmingOrder ? 'Confirming...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Toast Notification */}
      {toast.visible && (
        <div className={`fixed bottom-6 right-6 rounded-2xl p-4 text-sm font-medium ${toast.type === 'success' ? 'bg-[#edf5e9] text-[#2f6a3e]' : 'bg-[#f7e6e3] text-[#9a5748]'}`}>
          {toast.message}
        </div>
      )}

      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Bill Receipt"
        size="lg"
      >
        <div className="space-y-5">
          <div className="rounded-[30px] border border-dashed border-[#d8c9b2] bg-[#fcfaf5] p-6 shadow-inner">
            <div className="border-b border-dashed border-[#d8c9b2] pb-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Brew Haven</p>
              <h4 className="mt-2 text-2xl font-semibold text-ink">Customer Receipt</h4>
              <p className="mt-1 text-sm text-muted">Prepared for printing or PDF download</p>
            </div>
            <pre className="mt-5 whitespace-pre-wrap bg-white px-5 py-5 font-mono text-sm leading-7 text-ink">
              {receiptContent}
            </pre>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handlePrintReceipt}
              className="app-btn-secondary flex-1 justify-center"
            >
              <Printer size={16} />
              <span>Print Receipt</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadReceiptPdf}
              className="app-btn-primary flex-1 justify-center"
            >
              <Download size={16} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* RECENT ORDERS */}
      <Card
        title="Recent Orders"
        subtitle="Latest transactions across all branches"
        action={
          <button
            onClick={() => navigate("/orders")} // ✅ FIXED
            className="inline-flex items-center gap-2 text-sm font-semibold text-forest transition hover:text-forest-deep"
          >
            View All <ArrowRight size={16} />
          </button>
        }
      >
        <DataTable
          columns={[
            { key: "id", label: "Order ID" },
            { key: "orderDate", label: "Date" },
            { key: "totalAmount", label: "Amount" },
            { key: "status", label: "Status" },
          ]}
          data={recentOrders}
        />
      </Card>
    </div>
  );
};
