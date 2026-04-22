/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Filter, MapPin, Phone, User2 } from 'lucide-react';
import { Card, PageHeader, DataTable, LoadingSpinner } from '../components/Common';
import { Modal, ConfirmDeleteModal, Toast } from '../components/Modals';
import { apiService } from '../services/api';
import { Branch } from '../types';

export const BranchManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error', visible: false });

  const [formData, setFormData] = useState<Omit<Branch, 'id'>>({
    name: '',
    location: '',
    contact: '',
    manager: '',
  });

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const data = await apiService.branches.getAll();
      setBranches(
        data.map((branch: Branch) => ({
          ...branch,
          contact: branch.contact ?? '',
          manager: branch.manager ?? '',
        }))
      );
    } catch (error) {
      showToast('Error fetching branches', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const handleAddEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedBranch) {
        await apiService.branches.update(selectedBranch.id, formData);
        showToast('Branch updated successfully');
      } else {
        await apiService.branches.create(formData);
        showToast('Branch created successfully');
      }
      setIsModalOpen(false);
      fetchBranches();
    } catch (error) {
      showToast('Error saving branch', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedBranch) return;
    try {
      await apiService.branches.delete(selectedBranch.id);
      showToast('Branch deleted successfully');
      setIsDeleteModalOpen(false);
      fetchBranches();
    } catch (error) {
      showToast('Error deleting branch', 'error');
    }
  };

  const openAddModal = () => {
    setSelectedBranch(null);
    setFormData({ name: '', location: '', contact: '', manager: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      name: branch.name,
      location: branch.location,
      contact: branch.contact ?? '',
      manager: branch.manager ?? '',
    });
    setIsModalOpen(true);
  };

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.location.toLowerCase().includes(search.toLowerCase()) ||
      b.manager.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Branch Management"
        subtitle="Manage your cafe locations, contacts, and branch managers."
        action={
          <button onClick={openAddModal} className="app-btn-primary px-7 py-4">
            <Plus size={18} />
            <span>Add New Branch</span>
          </button>
        }
      />

      <div className="app-surface p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/70" size={18} />
            <input
              type="text"
              placeholder="Search branches by name, location, or manager..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="app-input pl-11"
            />
          </div>

          <button className="app-btn-secondary">
            <Filter size={16} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <Card title="Branch Records" subtitle="A quick overview of all cafe locations and who runs them.">
        <DataTable
          columns={[
            { key: 'id', label: 'Branch ID', render: (val) => <span className="font-semibold text-muted">#{val}</span> },
            { key: 'name', label: 'Branch Name', render: (val) => <span className="font-semibold text-ink">{val}</span> },
            {
              key: 'location',
              label: 'Location',
              render: (val) => (
                <div className="flex items-center gap-2 text-muted">
                  <MapPin size={14} className="text-forest" />
                  <span>{val}</span>
                </div>
              ),
            },
            {
              key: 'contact',
              label: 'Contact',
              render: (val) => (
                <div className="flex items-center gap-2 text-muted">
                  <Phone size={14} className="text-forest" />
                  <span>{val}</span>
                </div>
              ),
            },
            {
              key: 'manager',
              label: 'Manager',
              render: (val) => (
                <div className="flex items-center gap-2 text-muted">
                  <User2 size={14} className="text-forest" />
                  <span className="font-medium">{val}</span>
                </div>
              ),
            },
          ]}
          data={filteredBranches}
          actions={(row) => (
            <>
              <button onClick={() => openEditModal(row)} className="app-icon-btn">
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => {
                  setSelectedBranch(row);
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedBranch ? 'Edit Branch' : 'Add New Branch'}>
        <form onSubmit={handleAddEdit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Branch Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Downtown Cafe"
                className="app-input"
              />
            </div>

            <div>
              <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Location</label>
              <input
                required
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. 123 Main Street"
                className="app-input"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Contact Number</label>
                <input
                  required
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="e.g. 555-0123"
                  className="app-input"
                />
              </div>

              <div>
                <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Manager Name</label>
                <input
                  required
                  type="text"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="app-input"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="app-btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="app-btn-primary flex-1">
              {selectedBranch ? 'Update Branch' : 'Create Branch'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Branch"
        message={`Are you sure you want to delete Rs {selectedBranch?.name}? This action cannot be undone.`}
      />

      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} />
    </div>
  );
};