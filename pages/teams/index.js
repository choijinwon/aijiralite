// pages/teams/index.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { api } from '../../utils/api';
import Link from 'next/link';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { Plus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import TeamForm from '../../components/forms/TeamForm';
import TeamCard from '../../components/lists/TeamCard';
import EmptyState from '../../components/ui/EmptyState';
import Loading from '../../components/ui/Loading';

export default function TeamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchTeams();
    }
  }, [status, session, router]);

  const fetchTeams = async () => {
    try {
      const teamsData = await api.getTeams();
      setTeams(teamsData);
    } catch (error) {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const newTeam = await api.createTeam(data);
      setTeams([newTeam, ...teams]);
      setIsFormOpen(false);
      toast.success('Team created successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Teams</h1>
              <p className="text-gray-600 mt-1">Manage your teams and members</p>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Team
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {teams.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No teams yet"
            description="Create your first team to get started"
            actionLabel={
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </>
            }
            onAction={() => setIsFormOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map(team => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Create New Team"
      >
        <TeamForm
          onSubmit={onSubmit}
          onCancel={() => setIsFormOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
}

