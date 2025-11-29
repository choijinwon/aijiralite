// pages/issues/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { api } from '../../utils/api';
import AIFeatures from '../../components/issue/AIFeatures';
import Modal from '../../components/ui/Modal';
import IssueForm from '../../components/issue/IssueForm';
import Button from '../../components/ui/Button';
import { PRIORITY_COLORS } from '../../utils/constants';
import { formatDate, getInitials } from '../../lib/utils';
import toast from 'react-hot-toast';
import { MessageSquare, Edit, Trash2 } from 'lucide-react';

export default function IssueDetail() {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = router.query;
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [labels, setLabels] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || !id) return;

    fetchIssue();
  }, [session, id]);

  const fetchIssue = async () => {
    try {
      const [issueData, commentsResponse] = await Promise.all([
        api.getIssue(id),
        api.getComments(id)
      ]);
      
      setIssue(issueData);
      setComments(Array.isArray(commentsResponse) ? commentsResponse : []);

      // Fetch labels and users for the project
      if (issueData.project) {
        const [labelsData, projectData] = await Promise.all([
          api.getLabels(issueData.project.id),
          api.getProject(issueData.project.id)
        ]);
        setLabels(labelsData);
        
        // Get team members for user list
        if (projectData.team) {
          const members = await api.getTeamMembers(projectData.team.id);
          setUsers(members.map(m => m.user));
        }
      }
    } catch (error) {
      toast.error('Failed to load issue');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const comment = await api.addComment(id, newComment);
      setComments([...comments, comment]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error(error.message || 'Failed to add comment');
    }
  };

  const handleUpdateIssue = async (data) => {
    try {
      const updated = await api.updateIssue(id, data);
      setIssue(updated);
      setIsEditOpen(false);
      toast.success('Issue updated');
    } catch (error) {
      toast.error('Failed to update issue');
    }
  };

  const handleDeleteIssue = async () => {
    if (!confirm('Are you sure you want to delete this issue?')) return;

    try {
      await api.deleteIssue(id);
      toast.success('Issue deleted');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to delete issue');
    }
  };

  if (loading || !issue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{issue.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>#{issue.id.slice(0, 8)}</span>
                    <span>Created {formatDate(issue.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setIsEditOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="danger" onClick={handleDeleteIssue}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className={`px-3 py-1 rounded text-sm ${PRIORITY_COLORS[issue.priority] || PRIORITY_COLORS.MEDIUM}`}>
                  {issue.priority}
                </span>
                <span className="px-3 py-1 rounded text-sm bg-gray-100">
                  {issue.status}
                </span>
              </div>

              {issue.description && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">{issue.description}</p>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comments ({comments.length})
                </h3>

                <div className="space-y-4 mb-4">
                  {Array.isArray(comments) && comments.length > 0 ? (
                    comments.map(comment => {
                      const author = comment.author || { name: 'Unknown', avatar: null };
                      return (
                        <div key={comment.id} className="border rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            {author.avatar ? (
                              <img
                                src={author.avatar}
                                alt={author.name}
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const fallback = e.target.nextElementSibling;
                                  if (fallback) {
                                    fallback.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div 
                              className={`w-8 h-8 rounded-full bg-primary-500 text-white text-sm flex items-center justify-center ${
                                author.avatar ? 'hidden' : ''
                              }`}
                            >
                              {getInitials(author.name || 'U')}
                            </div>
                            <div>
                              <p className="font-medium">{author.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                            </div>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-sm">No comments yet.</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="input flex-1 min-h-[100px]"
                  />
                  <Button onClick={handleAddComment}>
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Assignee</p>
                  {issue.assignee ? (
                    <div className="flex items-center gap-2">
                      {issue.assignee.avatar ? (
                        <img
                          src={issue.assignee.avatar}
                          alt={issue.assignee.name}
                          className="w-6 h-6 rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.nextElementSibling;
                            if (fallback) {
                              fallback.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center ${
                          issue.assignee.avatar ? 'hidden' : ''
                        }`}
                      >
                        {getInitials(issue.assignee.name || 'U')}
                      </div>
                      <span>{issue.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">Unassigned</span>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Creator</p>
                  <div className="flex items-center gap-2">
                    {issue.creator.avatar ? (
                      <img
                        src={issue.creator.avatar}
                        alt={issue.creator.name}
                        className="w-6 h-6 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.nextElementSibling;
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center ${
                        issue.creator.avatar ? 'hidden' : ''
                      }`}
                    >
                      {getInitials(issue.creator.name || 'U')}
                    </div>
                    <span>{issue.creator.name}</span>
                  </div>
                </div>

                {issue.dueDate && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Due Date</p>
                    <p>{formatDate(issue.dueDate)}</p>
                  </div>
                )}

                {issue.labelIssues && issue.labelIssues.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Labels</p>
                    <div className="flex flex-wrap gap-2">
                      {issue.labelIssues.map(li => (
                        <span
                          key={li.label.id}
                          className="px-2 py-1 rounded text-sm"
                          style={{ backgroundColor: `${li.label.color}20`, color: li.label.color }}
                        >
                          {li.label.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

                <AIFeatures issueId={id} projectId={issue.project?.id} />
          </div>
        </div>
      </div>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Issue"
      >
        <IssueForm
          project={issue.project}
          users={users}
          labels={labels}
          onSubmit={handleUpdateIssue}
          onCancel={() => setIsEditOpen(false)}
          initialData={issue}
        />
      </Modal>
    </div>
  );
}

