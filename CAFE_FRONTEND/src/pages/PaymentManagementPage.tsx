/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, CreditCard, IndianRupee, Calendar, Hash, CheckCircle2 } from 'lucide-react';
import { Card, PageHeader, DataTable, LoadingSpinner } from '../components/Common';
import { Modal, ConfirmDeleteModal, Toast } from '../components/Modals';
import { apiService } from '../services/api';
import { Payment, Order } from '../types';
import { getCurrentDateForInput, convertToIST } from '../utils/timezone';

export const PaymentManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error', visible: false });

  const [formData, setFormData] = useState<Omit<Payment, 'id'>>({
    orderId: '',
    amount: 0,
    paymentMethod: 'Card',
    paymentDate: getCurrentDateForInput(),
    paymentStatus: 'Paid',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payData, orderData] = await Promise.all([
        apiService.payments.getAll(),
        apiService.orders.getAll(),
      ]);
      setPayments(payData);
      setOrders(orderData);
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
      if (selectedPayment) {
        await apiService.payments.update(selectedPayment.id, formData);
        showToast('Payment updated successfully');
      } else {
        await apiService.payments.create(formData);
        showToast('Payment recorded successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      showToast('Error saving payment', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedPayment) return;
    try {
      await apiService.payments.delete(selectedPayment.id);
      showToast('Payment deleted successfully');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      showToast('Error deleting payment', 'error');
    }
  };

  const openAddModal = () => {
    setSelectedPayment(null);
    setFormData({
      orderId: orders[0]?.id || '',
      amount: 0,
      paymentMethod: 'Card',
      paymentDate: getCurrentDateForInput(),
      paymentStatus: 'Paid',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pay: Payment) => {
    setSelectedPayment(pay);
    setFormData({
      orderId: String(pay.orderId),
      amount: pay.amount,
      paymentMethod: pay.paymentMethod,
      paymentDate: pay.paymentDate?.split('T')[0]?.split(' ')[0] ?? '',
      paymentStatus: pay.paymentStatus,
    });
    setIsModalOpen(true);
  };

  const filteredPayments = payments.filter((p) => p.id.toString().includes(search) || p.orderId.toString().includes(search));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Payment Records"
        subtitle="Track payment history, methods, and financial status in one place."
        action={
          <button onClick={openAddModal} className="app-btn-primary px-7 py-4">
            <Plus size={18} />
            <span>Record New Payment</span>
          </button>
        }
      />

      <div className="app-surface p-5 md:p-6">
        <div className="relative w-full lg:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/70" size={18} />
          <input
            type="text"
            placeholder="Search payments by ID or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="app-input pl-11"
          />
        </div>
      </div>

      <Card title="Payment Records" subtitle="Review amounts, payment methods, dates, and status updates.">
        <DataTable
          columns={[
            { key: 'id', label: 'Payment ID', render: (val) => <span className="font-semibold text-muted">#{val}</span> },
            {
              key: 'orderId',
              label: 'Order ID',
              render: (val) => (
                <div className="flex items-center gap-2 text-ink">
                  <Hash size={14} className="text-forest" />
                  <span className="font-semibold">{val}</span>
                </div>
              ),
            },
            {
              key: 'amount',
              label: 'Amount',
              render: (val) => (
                <div className="flex items-center gap-1 text-ink">
                  <IndianRupee size={14} className="text-forest" />
                  <span className="font-semibold">{val.toFixed(2)}</span>
                </div>
              ),
            },
            {
              key: 'paymentMethod',
              label: 'Method',
              render: (val) => (
                <div className="flex items-center gap-2 text-muted">
                  <CreditCard size={14} className="text-forest" />
                  <span className="font-medium">{val}</span>
                </div>
              ),
            },
            {
              key: 'paymentDate',
              label: 'Date',
              render: (val) => (
                <div className="flex items-center gap-2 text-muted">
                  <Calendar size={14} className="text-forest" />
                  <span>{convertToIST(val)}</span>
                </div>
              ),
            },
            {
              key: 'paymentStatus',
              label: 'Status',
              render: (val) => (
                <span
                  className={
                    val === 'Paid'
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
          data={filteredPayments}
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
                  setSelectedPayment(row);
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedPayment ? 'Edit Payment Record' : 'Record New Payment'}>
        <form onSubmit={handleAddEdit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Order ID</label>
                <select
                  required
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  className="app-input"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      Order #{o.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Amount (Rs)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="app-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Payment Method</label>
                <select
                  required
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                  className="app-input"
                >
                  <option value="Card">Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              <div>
                <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Payment Date</label>
                <input
                  required
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="app-input"
                />
              </div>
            </div>

            <div>
              <label className="mb-3 ml-1 block text-sm font-semibold text-ink">Payment Status</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {['Paid', 'Pending', 'Failed'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentStatus: status as any })}
                    className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                      formData.paymentStatus === status
                        ? 'bg-forest text-white'
                        : 'border border-line bg-card text-muted hover:bg-card-strong'
                    }`}
                  >
                    <CheckCircle2 size={15} />
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="app-btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="app-btn-primary flex-1">
              {selectedPayment ? 'Update Payment' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Payment Record"
        message={`Are you sure you want to delete payment record #Rs 
          
          
          
          {selectedPayment?.id}? This action cannot be undone.`}
      />

      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} />
    </div>
  );
};
