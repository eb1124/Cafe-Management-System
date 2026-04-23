/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Coffee,
  LayoutGrid,
  List,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card, PageHeader, DataTable, LoadingSpinner } from '../components/Common';
import { Modal, ConfirmDeleteModal, Toast } from '../components/Modals';
import { apiService } from '../services/api';
import { addToCart } from '../services/cart';
import { MenuItem } from '../types';
import { fallbackImages } from '../utils/fallbackImages';

export const MenuManagementPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error', visible: false });
  const [activeCategory, setActiveCategory] = useState('All');
  const [formData, setFormData] = useState<Omit<MenuItem, 'id'>>({
    name: '',
    category: '',
    price: 0,
    availability: true,
  });

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const menu = await apiService.menu.getAll();
      setMenuItems(menu);
    } catch (error) {
      showToast('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const handleAddEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Submitting form data:', formData);
      if (selectedItem) {
        await apiService.menu.update(selectedItem.id, formData);
        showToast('Menu item updated successfully');
      } else {
        console.log('Creating new menu item with:', formData);
        const response = await apiService.menu.create(formData);
        console.log('Create response:', response);
        showToast('Menu item created successfully');
      }
      setIsModalOpen(false);
      await fetchMenu();
      console.log('Menu refreshed after create/update');
    } catch (error) {
      console.error('Error saving menu item:', error);
      showToast('Error saving menu item', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await apiService.menu.delete(selectedItem.id);
      showToast('Menu item deleted successfully');
      setIsDeleteModalOpen(false);
      fetchMenu();
    } catch (error) {
      showToast('Error deleting menu item', 'error');
    }
  };

  const openAddModal = () => {
    setSelectedItem(null);
    setFormData({ name: '', category: '', price: 0, availability: true });
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      availability: item.availability,
    });
    setIsModalOpen(true);
  };

  const handleAddToCart = (item: MenuItem) => {
    if (!item.availability) {
      showToast('This item is currently unavailable.', 'error');
      return;
    }

    try {
      const updatedCart = addToCart(item);
      const addedItem = updatedCart.find((entry) => entry.id === item.id);
      showToast(
        `${item.name} added to cart ${addedItem ? `(${addedItem.quantity})` : ''}`
      );
    } catch (error) {
      showToast('Error adding item to cart.', 'error');
    }
  };

  const categories = useMemo(() => {
    const unique = Array.from(new Set(menuItems.map((item) => item.category)));
    return ['All', ...unique];
  }, [menuItems]);

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      activeCategory === 'All' || item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Menu Management"
        subtitle="Curate your cafe offerings with a cleaner, more visual catalog experience."
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-2xl border border-line bg-card p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-xl p-3 transition-all duration-200 Rs {
                  viewMode === 'grid'
                    ? 'bg-forest text-white'
                    : 'text-muted hover:bg-card-strong'
                }`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`rounded-xl p-3 transition-all duration-200 Rs {
                  viewMode === 'table'
                    ? 'bg-forest text-white'
                    : 'text-muted hover:bg-card-strong'
                }`}
              >
                <List size={18} />
              </button>
            </div>

            <button onClick={() => navigate('/dashboard')} className="app-btn-secondary px-7 py-4">
              <span>View Cart</span>
            </button>
            <button onClick={openAddModal} className="app-btn-primary px-7 py-4">
              <Plus size={18} />
              <span>Add Menu Item</span>
            </button>
          </div>
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
              placeholder="Search menu by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="app-input pl-11"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 Rs {
                  activeCategory === category
                    ? 'bg-forest text-white'
                    : 'border border-line bg-card text-muted hover:bg-card-strong'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => {
            const imageSrc =
              item.image ||
              fallbackImages[item.name] ||
              fallbackImages[item.category];

            return (
              <div
                key={item.id}
                className="app-surface overflow-hidden p-0 transition-all duration-300 hover:-translate-y-[3px]"
              >
                <div className="relative">
                  <div className="h-64 w-full bg-[#e8e0d4]">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted">
                        <Coffee size={46} />
                      </div>
                    )}
                  </div>

                  <div className="absolute left-4 top-4">
                    <span
                      className={
                        item.availability
                          ? 'status-pill bg-[#edf5e9] text-[#2f6a3e]'
                          : 'status-pill bg-[#f7e6e3] text-[#9a5748]'
                      }
                    >
                      {item.availability ? (
                        <>
                          <CheckCircle2 size={12} className="mr-1" />
                          Available
                        </>
                      ) : (
                        <>
                          <XCircle size={12} className="mr-1" />
                          Sold Out
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                        {item.category}
                      </p>
                      <h3 className="mt-2 text-[28px] font-semibold tracking-tight text-ink">
                        {item.name}
                      </h3>
                    </div>
                    <span className="rounded-full bg-[#edf1ea] px-3 py-1 text-xs font-semibold text-forest">
                      Rs {item.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-forest text-white transition hover:bg-forest-deep"
                    >
                      <Plus size={18} />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="inline-flex items-center justify-center rounded-xl border border-[#d4e6e2] bg-[#ecf5f3] p-2.5 text-[#254736] transition hover:bg-[#dceee9]"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setIsDeleteModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center rounded-xl border border-[#ecd4cf] bg-[#fbefec] p-2.5 text-[#9a5748] transition hover:bg-[#f7e6e3]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card title="Menu Table View" subtitle="A simple tabular view for editing and maintaining menu records.">
          <DataTable
            columns={[
              { key: 'id', label: 'Item ID', render: (val) => <span className="font-semibold text-muted">#{val}</span> },
              { key: 'name', label: 'Item Name', render: (val) => <span className="font-semibold text-ink">{val}</span> },
              { key: 'category', label: 'Category', render: (val) => <span className="text-sm font-semibold text-forest">{val}</span> },
              { key: 'price', label: 'Price', render: (val) => <span className="font-semibold text-ink">Rs {val.toFixed(2)}</span> },
              {
                key: 'availability',
                label: 'Status',
                render: (val) => (
                  <span
                    className={
                      val
                        ? 'status-pill bg-[#edf5e9] text-[#2f6a3e]'
                        : 'status-pill bg-[#f7e6e3] text-[#9a5748]'
                    }
                  >
                    {val ? 'Available' : 'Sold Out'}
                  </span>
                ),
              },
            ]}
            data={filteredItems}
            actions={(row) => (
              <>
                <button
                  onClick={() => openEditModal(row)}
                  className="inline-flex items-center justify-center rounded-xl border border-[#d4e6e2] bg-[#ecf5f3] p-2.5 text-[#254736] transition hover:bg-[#dceee9]"
                >
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
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? 'Edit Menu Item' : 'Add Menu Item'}
      >
        <form onSubmit={handleAddEdit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Item Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Caramel Latte"
                className="app-input"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Category</label>
                <input
                  required
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Coffee"
                  className="app-input"
                />
              </div>

              <div>
                <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Price (Rs )</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="e.g. 4.50"
                  className="app-input"
                />
              </div>
            </div>

            <label className="app-surface-soft flex cursor-pointer items-center gap-3 px-4 py-4">
              <input
                type="checkbox"
                checked={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                className="h-4 w-4 accent-[#254736]"
              />
              <span className="text-sm font-medium text-ink">
                Item is currently available for ordering
              </span>
            </label>
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
              {selectedItem ? 'Update Item' : 'Create Item'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Menu Item"
        message={`Are you sure you want to delete Rs {selectedItem?.name}? This action cannot be undone.`}
      />

      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} />
    </div>
  );
};
