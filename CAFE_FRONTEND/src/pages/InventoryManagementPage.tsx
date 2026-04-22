/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package, Boxes, Calendar } from 'lucide-react';
import { Card, PageHeader, DataTable, LoadingSpinner } from '../components/Common';
import { Modal, ConfirmDeleteModal, Toast } from '../components/Modals';
import { apiService } from '../services/api';
import { InventoryItem } from '../types';

export const InventoryManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error', visible: false });
  const [formData, setFormData] = useState<Omit<InventoryItem, 'id'>>({
    itemName: '',
    quantity: 0,
    unit: '',
    lastUpdated: new Date().toISOString().split('T')[0],
  });

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await apiService.inventory.getAll();
      setInventory(data);
    } catch (error) {
      showToast('Error fetching inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const handleAddEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await apiService.inventory.update(selectedItem.id, formData);
        showToast('Inventory item updated successfully');
      } else {
        await apiService.inventory.create(formData);
        showToast('Inventory item created successfully');
      }
      setIsModalOpen(false);
      fetchInventory();
    } catch (error) {
      showToast('Error saving inventory item', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await apiService.inventory.delete(selectedItem.id);
      showToast('Inventory item deleted successfully');
      setIsDeleteModalOpen(false);
      fetchInventory();
    } catch (error) {
      showToast('Error deleting inventory item', 'error');
    }
  };

  const openAddModal = () => {
    setSelectedItem(null);
    setFormData({
      itemName: '',
      quantity: 0,
      unit: '',
      lastUpdated: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      itemName: item.itemName,
      quantity: item.quantity,
      unit: item.unit,
      lastUpdated: item.lastUpdated?.split('T')[0]?.split(' ')[0] ?? '',
    });
    setIsModalOpen(true);
  };

  const filteredInventory = inventory.filter(
    (item) =>
      item.itemName.toLowerCase().includes(search.toLowerCase()) ||
      item.unit.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toString().includes(search)
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Inventory"
        subtitle="Manage stock levels, units, and update dates for ingredient tracking."
        action={
          <button onClick={openAddModal} className="app-btn-primary px-7 py-4">
            <Plus size={18} />
            <span>Add Inventory Item</span>
          </button>
        }
      />

      <div className="app-surface p-5 md:p-6">
        <div className="relative w-full lg:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/70" size={18} />
          <input
            type="text"
            placeholder="Search by item, unit, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="app-input pl-11"
          />
        </div>
      </div>

      <Card title="Inventory Records" subtitle="Monitor ingredients, quantities, and recent stock updates.">
        <DataTable
          columns={[
            { key: 'id', label: 'Item ID', render: (val) => <span className="font-semibold text-muted">#{val}</span> },
            {
              key: 'itemName',
              label: 'Item Name',
              render: (val) => (
                <div className="flex items-center gap-2 text-ink">
                  <Package size={14} className="text-forest" />
                  <span className="font-semibold">{val}</span>
                </div>
              ),
            },
            {
              key: 'quantity',
              label: 'Quantity',
              render: (val, row) => (
                <div className="flex items-center gap-2 text-muted">
                  <Boxes size={14} className="text-forest" />
                  <span>{val} {row.unit}</span>
                </div>
              ),
            },
            { key: 'unit', label: 'Unit' },
            {
              key: 'lastUpdated',
              label: 'Last Updated',
              render: (val) => (
                <div className="flex items-center gap-2 text-muted">
                  <Calendar size={14} className="text-forest" />
                  <span>{val}</span>
                </div>
              ),
            },
          ]}
          data={filteredInventory}
          actions={(row) => (
            <>
              <button onClick={() => openEditModal(row)} className="app-icon-btn">
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => {
                  setSelectedItem(row);
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedItem ? 'Edit Inventory Item' : 'Add Inventory Item'}>
        <form onSubmit={handleAddEdit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Item Name</label>
              <input
                required
                type="text"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                className="app-input"
              />
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Quantity</label>
                <input
                  required
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="app-input"
                />
              </div>
              <div>
                <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Unit</label>
                <input
                  required
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g. kg, pcs, liters"
                  className="app-input"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Last Updated</label>
              <input
                required
                type="date"
                value={formData.lastUpdated}
                onChange={(e) => setFormData({ ...formData, lastUpdated: e.target.value })}
                className="app-input"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="app-btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="app-btn-primary flex-1">
              {selectedItem ? 'Update Item' : 'Create Item'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Inventory Item"
        message={`Are you sure you want to delete ${selectedItem?.itemName}? This action cannot be undone.`}
      />

      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} />
    </div>
  );
};
