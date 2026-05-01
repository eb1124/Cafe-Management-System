/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  User,
  Store,
  IndianRupee,
  Clock,
  Filter,
} from 'lucide-react';
import { Card, PageHeader, DataTable, LoadingSpinner } from '../components/Common';
import { Modal, ConfirmDeleteModal, Toast } from '../components/Modals';
import { apiService } from '../services/api';
import { Order, Customer, Branch } from '../types';
import { getCurrentDateForInput, formatDateForInput } from '../utils/timezone';

export const OrderManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState({
    message: '',
    type: 'success' as 'success' | 'error',
    visible: false,
  });

  const [formData, setFormData] = useState<Omit<Order, 'id'>>({
    customerId: '',
    branchId: '',
    orderDate: getCurrentDateForInput(),
    totalAmount: 0,
    status: 'Pending',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orderData, customerData, branchData] = await Promise.all([
        apiService.orders.getAll(),
        apiService.customers.getAll(),
        apiService.branches.getAll(),
      ]);
      console.log("ORDERS FROM API:", orderData);
      setOrders(
        orderData.map((order: Order) => {
          const rawDate = order.orderDate;
          return {
            ...order,
            orderDate: rawDate.split('T')[0]?.split(' ')[0] ?? '',
          };
        })
      );
      setCustomers(customerData);
      setBranches(branchData);
    } catch (error) {
      showToast('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const handleAddEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedOrder) {
        await apiService.orders.update(selectedOrder.id, formData);
        showToast('Order updated successfully');
      } else {
        await apiService.orders.create(formData);
        showToast('Order created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      showToast('Error saving order', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;
    try {
      await apiService.orders.delete(selectedOrder.id);
      showToast('Order deleted successfully');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      showToast('Error deleting order', 'error');
    }
  };

  const openAddModal = () => {
    setSelectedOrder(null);
    setFormData({
      customerId: customers[0]?.id || '',
      branchId: branches[0]?.id || '',
      orderDate: getCurrentDateForInput(),
      totalAmount: 0,
      status: 'Pending',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (order: Order) => {
    setSelectedOrder(order);
    setFormData({
      customerId: order.customerId,
      branchId: order.branchId,
      orderDate: formatDateForInput(order.orderDate),
      totalAmount: order.totalAmount,
      status: order.status,
    });
    setIsModalOpen(true);
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toString().includes(search) ||
      customers
        .find((c) => c.id === o.customerId)
        ?.name.toLowerCase()
        .includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Order Management"
        subtitle="Track and manage customer orders through a clear, simple operations view."
        action={
          <button onClick={openAddModal} className="app-btn-primary px-7 py-4">
            <Plus size={18} />
            <span>Create New Order</span>
          </button>
        }
      />

      <div className="app-surface p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xl">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/70"
              size={18}
            />
            <input
              type="text"
              placeholder="Search orders by ID or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="app-input pl-11"
            />
          </div>
        </div>
      </div>

      <Card
        title="Order Records"
        subtitle="Monitor order status, customer details, and transaction amounts."
      >
        <DataTable
          columns={[
            {
              key: 'id',
              label: 'Order ID',
              render: (val) => <span className="font-semibold text-ink">#{val}</span>,
            },
            {
              key: 'customerId',
              label: 'Customer',
              render: (val) => {
                const customer = customers.find((c) => c.id === val);
                return (
                  <div className="flex items-center gap-2 text-muted">
                    <User size={14} className="text-forest" />
                    <span className="font-medium">{customer?.name || 'Unknown'}</span>
                  </div>
                );
              },
            },
            {
              key: 'branchId',
              label: 'Branch',
              render: (val) => {
                const branch = branches.find((b) => b.id === val);
                return (
                  <div className="flex items-center gap-2 text-muted">
                    <Store size={14} className="text-forest" />
                    <span className="font-medium">{branch?.name || 'Unknown'}</span>
                  </div>
                );
              },
            },
            {
              key: 'orderDate',
              label: 'Date',

             render: (val) => {
  console.log("VAL:", val);
  console.log("TYPE:", typeof val);

  return (
    <div className="flex items-center gap-2 text-muted">
      <Calendar size={14} className="text-muted" />
      <span>{formatDateForInput(val)}</span>
    </div>
  );
}
} ,
            {
              key: 'status',
              label: 'Status',
              render: (val) => (
                <span
                  className={
                    val === 'Completed'
                      ? 'status-pill bg-[#e8f3e4] text-[#2f6a3e]'
                      : val === 'Pending'
                      ? 'status-pill bg-[#f7edd8] text-[#af7a1d]'
                      : 'status-pill bg-[#f4e1de] text-[#9a5748]'
                  }
                >
                  {val}
                </span>
              ),
            },
          ]}
          data={filteredOrders}
          actions={(row) => (
            <>
              <button
                onClick={() => openEditModal(row)}
                className="inline-flex items-center justify-center rounded-xl border border-line bg-card p-2.5 text-forest transition hover:bg-card-strong"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => {
                  setSelectedOrder(row);
                  setIsDeleteModalOpen(true);
                }}
                className="inline-flex items-center justify-center rounded-xl border border-[#ecd4cf] bg-[#fbefec] p-2.5 text-[#9a5748] transition hover:bg-[#f7e6e3]"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedOrder ? 'Edit Order Status' : 'Create New Order'}
      >
        <form onSubmit={handleAddEdit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Customer</label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="app-input"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Branch</label>
                <select
                  required
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="app-input"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Order Date</label>
                <input
                  required
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                  className="app-input"
                />
              </div>

              <div>
                <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Total Amount (Rs )</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                  className="app-input"
                />
              </div>
            </div>

            <div>
              <label className="mb-3 ml-1 block text-sm font-semibold text-ink">Order Status</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {['Pending', 'Completed', 'Cancelled'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: status as any })}
                    className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                      formData.status === status
                        ? 'bg-forest text-white'
                        : 'border border-line bg-card text-muted hover:bg-card-strong'
                    }`}
                  >
                    <Clock size={15} />
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="app-btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" className="app-btn-primary flex-1">
              {selectedOrder ? 'Update Order' : 'Create Order'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Order"
        message={`Are you sure you want to delete order #Rs {selectedOrder?.id}? This action cannot be undone.`}
      />

      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} />
    </div>
  );
};
