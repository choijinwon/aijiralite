// components/forms/ProjectForm.jsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema } from '../../lib/validations';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';

export default function ProjectForm({ 
  teams, 
  onSubmit, 
  onCancel, 
  initialData, 
  isLoading,
  defaultTeamId 
}) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      teamId: defaultTeamId || ''
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Project Name *
        </label>
        <Input
          {...register('name')}
          placeholder="Enter project name"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea
          {...register('description')}
          placeholder="Enter project description (optional)"
          rows={4}
          disabled={isLoading}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>
      
      {teams && teams.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team *
          </label>
          <Select
            {...register('teamId')}
            disabled={isLoading || !!defaultTeamId}
            required
          >
            <option value="">Select a team</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </Select>
          {errors.teamId && (
            <p className="text-red-500 text-sm mt-1">{errors.teamId.message}</p>
          )}
        </div>
      )}
      {defaultTeamId && <input type="hidden" {...register('teamId')} value={defaultTeamId} />}
      
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'} Project
        </Button>
      </div>
    </form>
  );
}

