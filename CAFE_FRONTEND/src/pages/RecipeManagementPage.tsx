/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, BookOpen, Tag, IndianRupee } from 'lucide-react';
import { Card, PageHeader, DataTable, LoadingSpinner } from '../components/Common';
import { Modal, ConfirmDeleteModal, Toast } from '../components/Modals';
import { apiService } from '../services/api';
import { Recipe } from '../types';

export const RecipeManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error', visible: false });
  const [formData, setFormData] = useState<Omit<Recipe, 'id'>>({
    recipeName: '',
    category: '',
    price: 0,
  });

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const data = await apiService.recipe.getAll();
      setRecipes(data);
    } catch (error) {
      showToast('Error fetching recipes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const handleAddEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedRecipe) {
        await apiService.recipe.update(selectedRecipe.id, formData);
        showToast('Recipe updated successfully');
      } else {
        await apiService.recipe.create(formData);
        showToast('Recipe created successfully');
      }
      setIsModalOpen(false);
      fetchRecipes();
    } catch (error) {
      showToast('Error saving recipe', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedRecipe) return;
    try {
      await apiService.recipe.delete(selectedRecipe.id);
      showToast('Recipe deleted successfully');
      setIsDeleteModalOpen(false);
      fetchRecipes();
    } catch (error) {
      showToast('Error deleting recipe', 'error');
    }
  };

  const openAddModal = () => {
    setSelectedRecipe(null);
    setFormData({ recipeName: '', category: '', price: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setFormData({
      recipeName: recipe.recipeName,
      category: recipe.category,
      price: recipe.price,
    });
    setIsModalOpen(true);
  };

  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.recipeName.toLowerCase().includes(search.toLowerCase()) ||
      recipe.category.toLowerCase().includes(search.toLowerCase()) ||
      recipe.id.toString().includes(search)
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Recipe"
        subtitle="Manage recipe names, menu categories, and selling prices."
        action={
          <button onClick={openAddModal} className="app-btn-primary px-7 py-4">
            <Plus size={18} />
            <span>Add Recipe</span>
          </button>
        }
      />

      <div className="app-surface p-5 md:p-6">
        <div className="relative w-full lg:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/70" size={18} />
          <input
            type="text"
            placeholder="Search recipes by name, category, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="app-input pl-11"
          />
        </div>
      </div>

      <Card title="Recipe Records" subtitle="Keep recipe data organized for menu planning and pricing.">
        <DataTable
          columns={[
            { key: 'id', label: 'Recipe ID', render: (val) => <span className="font-semibold text-muted">#{val}</span> },
            {
              key: 'recipeName',
              label: 'Recipe Name',
              render: (val) => (
                <div className="flex items-center gap-2 text-ink">
                  <BookOpen size={14} className="text-forest" />
                  <span className="font-semibold">{val}</span>
                </div>
              ),
            },
            {
              key: 'category',
              label: 'Category',
              render: (val) => (
                <div className="flex items-center gap-2 text-muted">
                  <Tag size={14} className="text-forest" />
                  <span>{val}</span>
                </div>
              ),
            },
            {
              key: 'price',
              label: 'Price',
              render: (val) => (
                <div className="flex items-center gap-1 text-ink">
                  <IndianRupee size={14} className="text-forest" />
                  <span className="font-semibold">{Number(val).toFixed(2)}</span>
                </div>
              ),
            },
          ]}
          data={filteredRecipes}
          actions={(row) => (
            <>
              <button onClick={() => openEditModal(row)} className="app-icon-btn">
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => {
                  setSelectedRecipe(row);
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedRecipe ? 'Edit Recipe' : 'Add Recipe'}>
        <form onSubmit={handleAddEdit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Recipe Name</label>
              <input
                required
                type="text"
                value={formData.recipeName}
                onChange={(e) => setFormData({ ...formData, recipeName: e.target.value })}
                className="app-input"
              />
            </div>
            <div>
              <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Category</label>
              <input
                required
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="app-input"
              />
            </div>
            <div>
              <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Price</label>
              <input
                required
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="app-input"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="app-btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="app-btn-primary flex-1">
              {selectedRecipe ? 'Update Recipe' : 'Create Recipe'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Recipe"
        message={`Are you sure you want to delete ${selectedRecipe?.recipeName}? This action cannot be undone.`}
      />

      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} />
    </div>
  );
};
