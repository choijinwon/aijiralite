// pages/projects/[id]/settings.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';
import { api } from '../../../utils/api';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import { Settings, Tag, Workflow, Plus, Edit2, Trash2, GripVertical, Archive, ArchiveRestore, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const labelSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
});

const stateSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  wipLimit: z.number().int().positive().nullable().optional()
});

export default function ProjectSettingsPage() {
  const { data: session, status } = useSession();
  const { user: supabaseUser, loading: supabaseLoading } = useSupabaseAuth();
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState(null);
  const [labels, setLabels] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);
  const [editingState, setEditingState] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [isUpdatingLabel, setIsUpdatingLabel] = useState(false);
  const [isCreatingState, setIsCreatingState] = useState(false);
  const [isUpdatingState, setIsUpdatingState] = useState(false);

  const labelForm = useForm({
    resolver: zodResolver(labelSchema),
    defaultValues: { name: '', color: '#3B82F6' }
  });

  // Watch color value to sync between color picker and text input
  const watchedColor = labelForm.watch('color');

  const stateForm = useForm({
    resolver: zodResolver(stateSchema),
    defaultValues: { name: '', color: '#6B7280', wipLimit: null }
  });

  useEffect(() => {
    // Wait for router to be ready
    if (!router.isReady) return;

    // Check both NextAuth and Supabase auth
    const isAuthenticated = (status === 'authenticated' && session) || supabaseUser;
    const isLoading = status === 'loading' || supabaseLoading;

    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/signin');
      return;
    }

    if (isAuthenticated && !isLoading && id) {
      fetchData();
    }
  }, [router.isReady, status, session, supabaseUser, supabaseLoading, id, router]);

  const fetchData = async () => {
    try {
      const [projectData, labelsData, statesData] = await Promise.all([
        api.getProject(id),
        api.getLabels(id),
        api.getCustomStates(id)
      ]);

      setProject(projectData);
      setLabels(labelsData);
      setStates(statesData);
    } catch (error) {
      toast.error('Failed to load project settings');
      router.push(`/projects/${id}/kanban`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (data) => {
    try {
      const updated = await api.updateProject(id, data);
      setProject(updated);
      toast.success('Project updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update project');
    }
  };

  const handleArchiveToggle = async () => {
    try {
      const updated = await api.updateProject(id, { isArchived: !project.isArchived });
      setProject(updated);
      toast.success(updated.isArchived ? 'Project archived' : 'Project restored');
    } catch (error) {
      toast.error(error.message || 'Failed to update project');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deleteProject(id);
      toast.success('Project deleted successfully');
      router.push('/projects');
    } catch (error) {
      toast.error(error.message || 'Failed to delete project');
      setIsDeleting(false);
    }
  };

  const handleCreateLabel = async (data) => {
    setIsCreatingLabel(true);
    try {
      const label = await api.createLabel(id, data);
      setLabels([...labels, label]);
      setIsLabelModalOpen(false);
      labelForm.reset();
      toast.success('Label created successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to create label');
    } finally {
      setIsCreatingLabel(false);
    }
  };

  const handleUpdateLabel = async (data) => {
    setIsUpdatingLabel(true);
    try {
      // Always include color if it's provided and valid
      const updateData = {};
      if (data.name !== undefined && data.name !== '') {
        updateData.name = data.name;
      }
      if (data.color !== undefined && data.color !== null && data.color !== '' && data.color.match(/^#[0-9A-Fa-f]{6}$/)) {
        updateData.color = data.color;
      }
      
      const updated = await api.updateLabel(id, editingLabel.id, updateData);
      setLabels(labels.map(l => l.id === editingLabel.id ? updated : l));
      setIsLabelModalOpen(false);
      setEditingLabel(null);
      labelForm.reset();
      toast.success('Label updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update label');
    } finally {
      setIsUpdatingLabel(false);
    }
  };

  const handleDeleteLabel = async (labelId) => {
    if (!confirm('Are you sure you want to delete this label?')) return;

    try {
      await api.deleteLabel(id, labelId);
      setLabels(labels.filter(l => l.id !== labelId));
      toast.success('Label deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete label');
    }
  };

  const handleCreateState = async (data) => {
    setIsCreatingState(true);
    try {
      const state = await api.createCustomState(id, data);
      setStates([...states, state]);
      setIsStateModalOpen(false);
      stateForm.reset();
      toast.success('Custom state created successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to create state');
    } finally {
      setIsCreatingState(false);
    }
  };

  const handleUpdateState = async (data) => {
    setIsUpdatingState(true);
    try {
      const updated = await api.updateCustomState(id, editingState.id, data);
      setStates(states.map(s => s.id === editingState.id ? updated : s));
      setIsStateModalOpen(false);
      setEditingState(null);
      stateForm.reset();
      toast.success('State updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update state');
    } finally {
      setIsUpdatingState(false);
    }
  };

  const handleDeleteState = async (stateId) => {
    if (!confirm('Are you sure you want to delete this state? Issues using this state will need to be moved first.')) return;

    try {
      await api.deleteCustomState(id, stateId);
      setStates(states.filter(s => s.id !== stateId));
      toast.success('State deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete state');
    }
  };

  const openLabelEdit = (label) => {
    setEditingLabel(label);
    labelForm.reset({ name: label.name, color: label.color });
    setIsLabelModalOpen(true);
  };

  const openStateEdit = (state) => {
    setEditingState(state);
    stateForm.reset({ name: state.name, color: state.color, wipLimit: state.wipLimit });
    setIsStateModalOpen(true);
  };

  const closeLabelModal = () => {
    // Prevent closing modal while creating/updating
    if (isCreatingLabel || isUpdatingLabel) return;
    setIsLabelModalOpen(false);
    setEditingLabel(null);
    labelForm.reset();
  };

  const closeStateModal = () => {
    // Prevent closing modal while creating/updating
    if (isCreatingState || isUpdatingState) return;
    setIsStateModalOpen(false);
    setEditingState(null);
    stateForm.reset();
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold">{project.name} - Settings</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-2">
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'general'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                General
              </button>
              <button
                onClick={() => setActiveTab('labels')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'labels'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Tag className="w-4 h-4 inline mr-2" />
                Labels
              </button>
              <button
                onClick={() => setActiveTab('states')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'states'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Workflow className="w-4 h-4 inline mr-2" />
                Custom States
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'general' && (
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Project Information</h2>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    handleUpdateProject({
                      name: formData.get('name'),
                      description: formData.get('description')
                    });
                  }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Name *
                      </label>
                      <Input
                        name="name"
                        defaultValue={project.name}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        defaultValue={project.description || ''}
                        className="input"
                        rows={4}
                      />
                    </div>
                    <Button type="submit">Save Changes</Button>
                  </form>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Danger Zone</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {project.isArchived ? 'Restore Project' : 'Archive Project'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {project.isArchived 
                            ? 'Restore this project to make it active again'
                            : 'Archive this project to hide it from active projects'}
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={handleArchiveToggle}
                      >
                        {project.isArchived ? (
                          <>
                            <ArchiveRestore className="w-4 h-4 mr-2" />
                            Restore
                          </>
                        ) : (
                          <>
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'labels' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Labels</h2>
                  <Button onClick={() => setIsLabelModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Label
                  </Button>
                </div>

                <div className="space-y-2">
                  {labels.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No labels yet</p>
                  ) : (
                    labels.map(label => (
                      <div
                        key={label.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: label.color }}
                          />
                          <span className="font-medium">{label.name}</span>
                          <span className="text-sm text-gray-500">
                            ({label._count?.labelIssues || 0} issues)
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openLabelEdit(label)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLabel(label.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'states' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Custom States</h2>
                  <Button onClick={() => setIsStateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New State
                  </Button>
                </div>

                <div className="space-y-2">
                  {states.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No custom states yet</p>
                  ) : (
                    states.map(state => (
                      <div
                        key={state.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-5 h-5 text-gray-400" />
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: state.color }}
                          />
                          <span className="font-medium">{state.name}</span>
                          {state.wipLimit && (
                            <span className="text-sm text-gray-500">
                              (WIP Limit: {state.wipLimit})
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            ({state.issueCount || 0} issues)
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openStateEdit(state)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteState(state.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Label Modal */}
      <Modal
        isOpen={isLabelModalOpen}
        onClose={closeLabelModal}
        title={editingLabel ? 'Edit Label' : 'Create Label'}
        canClose={!isCreatingLabel && !isUpdatingLabel}
      >
        <form onSubmit={labelForm.handleSubmit(editingLabel ? handleUpdateLabel : handleCreateLabel)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label Name *
            </label>
            <Input
              {...labelForm.register('name')}
              placeholder="e.g., Bug, Feature, Enhancement"
              disabled={isCreatingLabel || isUpdatingLabel}
            />
            {labelForm.formState.errors.name && (
              <p className="text-red-500 text-sm mt-1">{labelForm.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color *
            </label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={watchedColor || '#3B82F6'}
                onChange={(e) => {
                  const newColor = e.target.value;
                  labelForm.setValue('color', newColor, { shouldValidate: true, shouldDirty: true });
                }}
                className="w-20 h-10"
                disabled={isCreatingLabel || isUpdatingLabel}
              />
              <Input
                value={watchedColor || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only update if valid hex color format
                  if (value === '' || value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                    labelForm.setValue('color', value, { shouldValidate: true, shouldDirty: true });
                  }
                }}
                placeholder="#3B82F6"
                pattern="^#[0-9A-Fa-f]{6}$"
                disabled={isCreatingLabel || isUpdatingLabel}
              />
            </div>
            {labelForm.formState.errors.color && (
              <p className="text-red-500 text-sm mt-1">{labelForm.formState.errors.color.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={closeLabelModal}
              disabled={isCreatingLabel || isUpdatingLabel}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isCreatingLabel || isUpdatingLabel}
            >
              {isCreatingLabel || isUpdatingLabel ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  {isCreatingLabel ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                `${editingLabel ? 'Update' : 'Create'} Label`
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* State Modal */}
      <Modal
        isOpen={isStateModalOpen}
        onClose={closeStateModal}
        title={editingState ? 'Edit Custom State' : 'Create Custom State'}
        canClose={!isCreatingState && !isUpdatingState}
      >
        <form onSubmit={stateForm.handleSubmit(editingState ? handleUpdateState : handleCreateState)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State Name *
            </label>
            <Input
              {...stateForm.register('name')}
              placeholder="e.g., In Review, Testing, Done"
              disabled={isCreatingState || isUpdatingState}
            />
            {stateForm.formState.errors.name && (
              <p className="text-red-500 text-sm mt-1">{stateForm.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex gap-2">
              <Input
                type="color"
                {...stateForm.register('color')}
                className="w-20 h-10"
                disabled={isCreatingState || isUpdatingState}
              />
              <Input
                {...stateForm.register('color')}
                placeholder="#6B7280"
                pattern="^#[0-9A-Fa-f]{6}$"
                disabled={isCreatingState || isUpdatingState}
              />
            </div>
            {stateForm.formState.errors.color && (
              <p className="text-red-500 text-sm mt-1">{stateForm.formState.errors.color.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WIP Limit (Optional)
            </label>
            <Input
              type="number"
              {...stateForm.register('wipLimit', { valueAsNumber: true })}
              placeholder="Leave empty for unlimited"
              min="1"
              disabled={isCreatingState || isUpdatingState}
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum number of issues allowed in this state
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={closeStateModal}
              disabled={isCreatingState || isUpdatingState}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isCreatingState || isUpdatingState}
            >
              {isCreatingState || isUpdatingState ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  {isCreatingState ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                `${editingState ? 'Update' : 'Create'} State`
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Project"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{project?.name}</strong>? 
            This action cannot be undone and will delete all associated issues, labels, and custom states.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

