// components/issue/IssueForm.jsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { issueSchema } from '../../lib/validations';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';

// Helper function to format date for HTML date input (YYYY-MM-DD)
function formatDateForInput(date) {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    return '';
  }
}

export default function IssueForm({ project, users, labels, onSubmit, onCancel, initialData }) {
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm({
    resolver: zodResolver(issueSchema),
    defaultValues: initialData ? {
      ...initialData,
      status: initialData.status || 'Backlog',
      assigneeId: initialData.assigneeId || '',
      dueDate: formatDateForInput(initialData.dueDate),
      labelIds: initialData.labelIssues?.map(li => li.label.id) || []
    } : {
      title: '',
      description: '',
      status: 'Backlog',
      priority: 'MEDIUM',
      projectId: project.id,
      assigneeId: '',
      dueDate: '',
      labelIds: []
    }
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        status: initialData.status || 'Backlog',
        assigneeId: initialData.assigneeId || '',
        dueDate: formatDateForInput(initialData.dueDate),
        labelIds: initialData.labelIssues?.map(li => li.label.id) || []
      });
    }
  }, [initialData, reset]);

  const selectedLabels = watch('labelIds') || [];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <Input
          {...register('title')}
          placeholder="Issue title"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea
          {...register('description')}
          placeholder="Issue description"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Select {...register('status')}>
            <option value="Backlog">Backlog</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <Select {...register('priority')}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assignee
        </label>
        <Select {...register('assigneeId')}>
          <option value="">Unassigned</option>
          {users?.map(user => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Due Date
        </label>
        <Input
          type="date"
          {...register('dueDate')}
        />
      </div>

      {labels && labels.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Labels
          </label>
          <div className="flex flex-wrap gap-2">
            {labels.map(label => {
              const isSelected = selectedLabels.includes(label.id);
              return (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => {
                    const newLabels = isSelected
                      ? selectedLabels.filter(id => id !== label.id)
                      : [...selectedLabels, label.id];
                    setValue('labelIds', newLabels, { shouldValidate: true });
                  }}
                  className={`px-2 py-1 rounded text-sm border transition-colors ${
                    isSelected
                      ? 'border-2'
                      : 'border border-gray-300 hover:border-gray-400'
                  }`}
                  style={{
                    backgroundColor: isSelected ? `${label.color}20` : 'transparent',
                    color: label.color,
                    borderColor: isSelected ? label.color : undefined
                  }}
                >
                  {label.name}
                </button>
              );
            })}
          </div>
          <input type="hidden" {...register('labelIds')} />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}

