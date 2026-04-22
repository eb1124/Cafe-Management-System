/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Briefcase, IndianRupee, Smartphone, Store, User2 } from 'lucide-react';
import { Card, PageHeader, DataTable, LoadingSpinner } from '../components/Common';
import { Modal, ConfirmDeleteModal, Toast } from '../components/Modals';
import { apiService } from '../services/api';
import { Employee, Branch } from '../types';

export const EmployeeManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error', visible: false });

  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    name: '',
    role: '',
    salary: 0,
    branchId: '',
    phone: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empData, branchData] = await Promise.all([
        apiService.employees.getAll(),
        apiService.branches.getAll(),
      ]);
      setEmployees(empData);
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
      if (selectedEmployee) {
        await apiService.employees.update(selectedEmployee.id, formData);
        showToast('Employee updated successfully');
      } else {
        await apiService.employees.create(formData);
        showToast('Employee created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      showToast('Error saving employee', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;
    try {
      await apiService.employees.delete(selectedEmployee.id);
      showToast('Employee deleted successfully');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      showToast('Error deleting employee', 'error');
    }
  };

  const openAddModal = () => {
    setSelectedEmployee(null);
    setFormData({ name: '', role: '', salary: 0, branchId: branches[0]?.id || '', phone: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setFormData({
      name: emp.name,
      role: emp.role,
      salary: emp.salary,
      branchId: emp.branchId,
      phone: emp.phone,
    });
    setIsModalOpen(true);
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Employee Management"
        subtitle="Keep your cafe staff records clean, organized, and easy to update."
        action={
          <button onClick={openAddModal} className="app-btn-primary px-7 py-4">
            <Plus size={18} />
            <span>Add New Employee</span>
          </button>
        }
      />

      <div className="app-surface p-5 md:p-6">
        <div className="relative w-full lg:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/70" size={18} />
          <input
            type="text"
            placeholder="Search employees by name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="app-input pl-11"
          />
        </div>
      </div>

      <Card title="Employee Records" subtitle="Monitor staff roles, branch assignments, and contact details.">
        <DataTable
          columns={[
            { key: 'id', label: 'Employee ID', render: (val) => <span className="font-semibold text-muted">#{val}</span> },
            {
              key: 'name',
              label: 'Name',
              render: (val) => (
                <div className="flex items-center gap-2 text-ink">
                  <User2 size={14} className="text-forest" />
                  <span className="font-semibold">{val}</span>
                </div>
              ),
            },
            {
              key: 'role',
              label: 'Role',
              render: (val) => (
                <div className="flex items-center gap-2 text-muted">
                  <Briefcase size={14} className="text-forest" />
                  <span className="font-medium">{val}</span>
                </div>
              ),
            },
            {
              key: 'salary',
              label: 'Salary',
              render: (val) => (
                <div className="flex items-center gap-1 text-ink">
                  <IndianRupee size={14} className="text-forest" />
                  <span className="font-semibold">{val.toLocaleString()}</span>
                </div>
              ),
            },
            {
              key: 'branchId',
              label: 'Branch',
              render: (val) => {
                const branch = branches.find((b) => b.id === val);
                return (
                  <div className="flex items-center gap-2 text-muted">
                    <Store size={14} className="text-forest" />
                    <span>{branch?.name || 'Unknown'}</span>
                  </div>
                );
              },
            },
            {
              key: 'phone',
              label: 'Phone',
              render: (val) => (
                <div className="flex items-center gap-2 text-muted">
                  <Smartphone size={14} className="text-forest" />
                  <span>{val}</span>
                </div>
              ),
            },
          ]}
          data={filteredEmployees}
          actions={(row) => (
            <>
              <button onClick={() => openEditModal(row)} className="app-icon-btn">
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => {
                  setSelectedEmployee(row);
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedEmployee ? 'Edit Employee' : 'Add New Employee'}>
        <form onSubmit={handleAddEdit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Full Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Charlie Brown"
                className="app-input"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Role</label>
                <input
                  required
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Barista"
                  className="app-input"
                />
              </div>

              <div>
                <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Salary</label>
                <input
                  required
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                  placeholder="e.g. 3000"
                  className="app-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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

              <div>
                <label className="mb-2 ml-1 block text-sm font-semibold text-ink">Phone Number</label>
                <input
                  required
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 555-0201"
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
              {selectedEmployee ? 'Update Employee' : 'Create Employee'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete Rs {selectedEmployee?.name}? This action cannot be undone.`}
      />

      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} />
    </div>
  );
};