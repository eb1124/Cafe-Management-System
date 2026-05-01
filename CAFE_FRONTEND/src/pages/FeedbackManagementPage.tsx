/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, MessageSquareText, Star, Calendar } from 'lucide-react';
import { Card, PageHeader, DataTable, LoadingSpinner } from '../components/Common';
import { Modal, ConfirmDeleteModal, Toast } from '../components/Modals';
import { apiService } from '../services/api';
import { Feedback } from '../types';
import { getCurrentDateForInput, convertToIST } from '../utils/timezone';

export const FeedbackManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error', visible: false });
  const [formData, setFormData] = useState<Omit<Feedback, 'id'>>({
    rating: 5,
    comments: '',
    feedbackDate: getCurrentDateForInput(),
  });

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const data = await apiService.feedback.getAll(ratingFilter ? Number(ratingFilter) : undefined);
      setFeedback(data);
    } catch (error) {
      showToast('Error fetching feedback', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [ratingFilter]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const handleAddEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedFeedback) {
        await apiService.feedback.update(selectedFeedback.id, formData);
        showToast('Feedback updated successfully');
      } else {
        await apiService.feedback.create(formData);
        showToast('Feedback created successfully');
      }
      setIsModalOpen(false);
      fetchFeedback();
    } catch (error) {
      showToast('Error saving feedback', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedFeedback) return;
    try {
      await apiService.feedback.delete(selectedFeedback.id);
      showToast('Feedback deleted successfully');
      setIsDeleteModalOpen(false);
      fetchFeedback();
    } catch (error) {
      showToast('Error deleting feedback', 'error');
    }
  };

  const openAddModal = () => {
    setSelectedFeedback(null);
    setFormData({
      rating: 5,
      comments: '',
      feedbackDate: getCurrentDateForInput(),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (entry: Feedback) => {
    setSelectedFeedback(entry);
    setFormData({
      rating: entry.rating,
      comments: entry.comments,
      feedbackDate: entry.feedbackDate?.split('T')[0]?.split(' ')[0] ?? '',
    });
    setIsModalOpen(true);
  };

  const filteredFeedback = feedback.filter(
    (entry) =>
      entry.comments.toLowerCase().includes(search.toLowerCase()) ||
      entry.id.toString().includes(search)
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Feedback"
        subtitle="Track customer ratings, comments, and feedback dates."
      />

      <div className="app-surface p-5 md:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full lg:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/70" size={18} />
            <input
              type="text"
              placeholder="Search by ID or comment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="app-input pl-11"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/70" size={18} />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : '')}
              className="app-input pl-11 pr-4"
            >
              <option value="">All Ratings</option>
              <option value="1">1 Star</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>
        </div>
      </div>

      <Card title="Feedback Records" subtitle="Review ratings and comments from customer experiences.">
        <DataTable
          columns={[
            { key: 'id', label: 'Feedback ID', render: (val) => <span className="font-semibold text-muted">#{val}</span> },
            {
              key: 'rating',
              label: 'Rating',
              render: (val) => (
                <div className="flex items-center gap-2 text-ink">
                  <Star size={14} className="text-[#af7a1d]" />
                  <span className="font-semibold">{val}/5</span>
                </div>
              ),
            },
            {
              key: 'comments',
              label: 'Comments',
              render: (val) => (
                <div className="flex items-center gap-2 text-muted">
                  <MessageSquareText size={14} className="text-forest" />
                  <span>{val}</span>
                </div>
              ),
            },
            {
              key: 'feedbackDate',
              label: 'Date',
              render: (val) => (
                <div className="flex items-center gap-2 text-muted">
                  <Calendar size={14} className="text-forest" />
                  <span>{convertToIST(val)}</span>
                </div>
              ),
            },
          ]}
          data={filteredFeedback}
          actions={(row) => (
            <>
              <button onClick={() => openEditModal(row)} className="app-icon-btn">
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => {
                  setSelectedFeedback(row);
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedFeedback ? 'Edit Feedback' : 'Add Feedback'}>
        <form onSubmit={handleAddEdit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Rating</label>
              <input
                required
                min={1}
                max={5}
                type="number"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                className="app-input"
              />
            </div>

            <div>
              <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Comments</label>
              <textarea
                required
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                rows={4}
                className="app-input min-h-[120px]"
              />
            </div>

            <div>
              <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Feedback Date</label>
              <input
                required
                type="date"
                value={formData.feedbackDate}
                onChange={(e) => setFormData({ ...formData, feedbackDate: e.target.value })}
                className="app-input"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="app-btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="app-btn-primary flex-1">
              {selectedFeedback ? 'Update Feedback' : 'Create Feedback'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Feedback"
        message={`Are you sure you want to delete feedback #${selectedFeedback?.id}? This action cannot be undone.`}
      />

      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} />
    </div>
  );
};
