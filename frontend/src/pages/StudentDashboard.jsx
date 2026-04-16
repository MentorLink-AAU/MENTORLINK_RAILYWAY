/** Student dashboard: project, group, submissions, available projects. */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudentDashboard } from '../lib/api';
import {
  FolderKanban,
  Users,
  FileText,
  Bell,
  ChevronRight,
  Plus,
} from 'lucide-react';

export function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getStudentDashboard()
      .then((res) => setData(res.data?.data))
      .catch((e) => setError(e.response?.data?.error?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        {error}
      </div>
    );
  }

  const profile = data?.profile;
  const project = data?.assignedProject;
  const group = data?.group;
  const submissions = data?.mySubmissions || [];
  const availableProjects = data?.availableProjects || [];
  const unread = data?.unreadNotificationCount || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-blue-900">
          Welcome, {profile?.fullName || 'Student'}
        </h1>
        {unread > 0 && (
          <Link
            to="/notifications"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
          >
            <Bell className="w-4 h-4" />
            {unread} unread
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Assigned Project */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">My Project</span>
          </div>
          <div className="p-6">
            {project ? (
              <>
                <h3 className="font-semibold text-blue-900 mb-2">{project.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600">Progress: {project.progress}%</span>
                  <Link
                    to={`/projects/${project.projectId}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                  >
                    View <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm">No project assigned yet</p>
            )}
          </div>
        </div>

        {/* Group */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">My Group</span>
          </div>
          <div className="p-6">
            {group ? (
              <>
                <h3 className="font-semibold text-blue-900 mb-2">{group.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{group.projectTitle}</p>
                <p className="text-sm text-blue-600 mb-4">{group.memberCount} members</p>
                <Link
                  to={`/groups/${group.groupId}`}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                >
                  View Group <ChevronRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-500 text-sm">Not in a group yet. Choose an option:</p>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/groups/create"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" /> Create your own group
                  </Link>
                  <Link
                    to="/groups/join"
                    className="inline-flex items-center gap-2 px-3 py-2 border border-blue-600 text-blue-700 rounded-lg hover:bg-blue-50 text-sm font-medium"
                  >
                    <Users className="w-4 h-4" /> Join with invite token
                  </Link>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Create: start a new project and get a token to invite peers. Join: use a token from your teammate.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submissions */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">My Submissions</span>
          </div>
          <div className="p-6">
            {submissions.length > 0 ? (
              <ul className="space-y-2">
                {submissions.slice(0, 3).map((s) => (
                  <li key={s.id} className="text-sm text-gray-700">
                    {s.originalFilename} ({s.category})
                  </li>
                ))}
                {submissions.length > 3 && (
                  <li className="text-blue-600 text-sm">+{submissions.length - 3} more</li>
                )}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No submissions yet</p>
            )}
            {project && (
              <Link
                to={`/projects/${project.projectId}/submissions`}
                className="mt-4 inline-flex items-center gap-1 text-blue-600 font-medium text-sm"
              >
                Manage Submissions <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Available Projects */}
      {availableProjects.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <span className="font-semibold text-blue-900">Available Projects</span>
          </div>
          <div className="p-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableProjects.map((p) => (
                <Link
                  key={p.projectId}
                  to={`/projects/${p.projectId}`}
                  className="block p-4 rounded-xl border border-blue-100 hover:border-blue-300 hover:bg-blue-50/50 transition"
                >
                  <h4 className="font-medium text-blue-900">{p.title}</h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">{p.domain}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Deadlines */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
        <h2 className="font-semibold text-blue-900 mb-4">Deadlines</h2>
        <Link
          to="/deadlines"
          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          View all deadlines →
        </Link>
      </div>
    </div>
  );
}
