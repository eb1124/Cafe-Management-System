/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const iconToneMap: Record<string, string> = {
  forest: 'bg-forest text-white',
  moss: 'bg-[#dbe6d7] text-forest',
  sage: 'bg-[#e6ecdf] text-[#5d705c]',
  gold: 'bg-[#efe0ca] text-[#8a6233]',
  soft: 'bg-[#edf1ea] text-[#556454]',
};

// Card Component
export const Card = ({
  children,
  className,
  title,
  subtitle,
  action,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}) => (
  <div
    className={cn(
      'app-surface p-7 md:p-8 transition-all duration-300',
      className
    )}
  >
    {(title || action) && (
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          {title && (
            <h3 className="text-[28px] font-semibold tracking-tight text-ink">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm font-medium text-muted">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex items-center gap-3">{action}</div>}
      </div>
    )}
    {children}
  </div>
);

// StatCard Component
export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  tone = 'moss',
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: { value: number; isUp: boolean };
  tone?: 'forest' | 'moss' | 'sage' | 'gold' | 'soft';
}) => (
  <div className="app-surface group p-6 transition-all duration-300 hover:-translate-y-[2px]">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
          {title}
        </p>
        <h3 className="mt-4 text-[40px] font-semibold leading-none tracking-tight text-ink">
          {value}
        </h3>

        {trend && (
          <div
            className={cn(
              'status-pill mt-5 gap-1.5',
              trend.isUp
                ? 'bg-[#e8f3e4] text-[#2f6a3e]'
                : 'bg-[#f8e7e4] text-[#9a5748]'
            )}
          >
            <span>{trend.isUp ? '↑' : '↓'}</span>
            <span>{trend.value}%</span>
            <span className="ml-1 text-muted">this month</span>
          </div>
        )}
      </div>

      <div
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm',
          iconToneMap[tone]
        )}
      >
        <Icon size={26} strokeWidth={2.1} />
      </div>
    </div>
  </div>
);

// PageHeader Component
export const PageHeader = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) => (
  <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <h1 className="text-[50px] font-semibold tracking-tight text-ink leading-none">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 text-lg font-medium text-muted">{subtitle}</p>
      )}
    </div>
    {action && <div className="flex items-center gap-3">{action}</div>}
  </div>
);

// LoadingSpinner Component
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-24">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="animate-spin text-forest" size={40} strokeWidth={2.4} />
      <p className="text-sm font-medium text-muted">Brewing your data...</p>
    </div>
  </div>
);

// DataTable Component
export const DataTable = ({
  columns,
  data,
  actions,
}: {
  columns: { key: string; label: string; render?: (val: any, row: any) => React.ReactNode }[];
  data: any[];
  actions?: (row: any) => React.ReactNode;
}) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[760px] border-separate border-spacing-0">
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className="border-b border-line px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-muted first:pl-2"
            >
              {col.label}
            </th>
          ))}
          {actions && (
            <th className="border-b border-line px-4 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
              Actions
            </th>
          )}
        </tr>
      </thead>

      <tbody>
        {data.map((row, idx) => (
          <tr
            key={idx}
            className="group transition-colors duration-200 hover:bg-[#f7f1e8]"
          >
            {columns.map((col) => (
              <td
                key={col.key}
                className="border-b border-line/70 px-4 py-5 text-sm font-medium text-ink first:pl-2"
              >
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}

            {actions && (
              <td className="border-b border-line/70 px-4 py-5 text-right">
                <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                  {actions(row)}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);