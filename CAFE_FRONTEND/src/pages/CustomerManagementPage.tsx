/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Mail, Phone, MapPin, User2 } from 'lucide-react';
import { Card, PageHeader, DataTable, LoadingSpinner } from '../components/Common';
import { Modal, ConfirmDeleteModal, Toast } from '../components/Modals';
import { apiService } from '../services/api';
import { Customer } from '../types';

export const CustomerManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error', visible: false });

  const [formData, setFormData] = useState<Omit<Customer, 'id'>>({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await apiService.customers.getAll();
      setCustomers(data);
    } catch (error) {
      showToast('Error fetching customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const handleAddEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedCustomer) {
        await apiService.customers.update(selectedCustomer.id, formData);
        showToast('Customer updated successfully');
      } else {
        await apiService.customers.create(formData);
        showToast('Customer created successfully');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (error) {
      showToast('Error saving customer', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer) return;
    try {
      await apiService.customers.delete(selectedCustomer.id);
      showToast('Customer deleted successfully');
      setIsDeleteModalOpen(false);
      fetchCustomers();
    } catch (error) {
      showToast('Error deleting customer', 'error');
    }
  };

  const openAddModal = () => {
    setSelectedCustomer(null);
    setFormData({ name: '', phone: '', email: '', address: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
    });
    setIsModalOpen(true);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Customer Management"
        subtitle="Keep customer records organized and easy to access."
        action={
          <button onClick={openAddModal} className="app-btn-primary px-7 py-4">
            <Plus size={18} />
            <span>Add New Customer</span>
          </button>
        }
      />

      <div className="app-surface p-5 md:p-6">
        <div className="relative w-full lg:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/70" size={18} />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="app-input pl-11"
          />
        </div>
      </div>

      <Card title="Customer Records" subtitle="Review names, contact details, and addresses in one place.">
        <DataTable
          columns={[
            { key: 'id', label: 'Customer ID', render: (val) => <span className="font-semibold text-muted">#{val}</span> },
            {
              key: 'name',
              label: 'Customer Name',
              render: (val) => (
                <div className="flex items-center gap-2 text-ink">
                  <User2 size={14} className="text-forest" />
                  <span className="font-semibold">{val}</span>
                </div>
              ),
            },
            {
              key: 'email',
              label: 'Email',
              render: (val) => (
                <div className="flex items-center gap-2 text-muted">
                  <Mail size={14} className="text-forest" />
                  <span>{val}</span>
                </div>
              ),
            },
            {
              key: 'phone',
              label: 'Phone',
              render: (val) => (
                <div className="flex items-center gap-2 text-muted">
                  <Phone size={14} className="text-forest" />
                  <span>{val}</span>
                </div>
              ),
            },
            {
              key: 'address',
              label: 'Address',
              render: (val) => (
                <div className="flex items-center gap-2 text-muted">
                  <MapPin size={14} className="text-forest" />
                  <span className="truncate max-w-[240px]">{val}</span>
                </div>
              ),
            },
          ]}
          data={filteredCustomers}
          actions={(row) => (
            <>
              <button onClick={() => openEditModal(row)} className="app-icon-btn">
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => {
                  setSelectedCustomer(row);
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedCustomer ? 'Edit Customer' : 'Add New Customer'}>
        <form onSubmit={handleAddEdit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Full Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Alice Johnson"
                className="app-input"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Email Address</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. alice@example.com"
                  className="app-input"
                />
              </div>

              <div>
                <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Phone Number</label>
                <input
                  required
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 555-0101"
                  className="app-input"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Address</label>
              <textarea
                required
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. 123 Oak Street"
                className="app-input resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="app-btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="app-btn-primary flex-1">
              {selectedCustomer ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete Rs {selectedCustomer?.name}? This action cannot be undone.`}
      />

      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} />
    </div>
  );
};