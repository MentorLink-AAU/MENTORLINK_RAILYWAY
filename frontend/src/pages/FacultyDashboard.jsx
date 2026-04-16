/** Faculty dashboard: supervised projects, pending mentorship requests. */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFacultyDashboard, getPendingMentorshipRequests, approveMentorshipRequest, rejectMentorshipRequest } from '../lib/api';
import { FolderKanban, Users, Bell, ChevronRight, UserPlus, Check, X } from 'lucide-react';

export function FacultyDashboard() {
  const [data, setData] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getFacultyDashboard()
      .then((res) => setData(res.data?.data))
      .catch((e) => setError(e.response?.data?.error?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getPendingMentorshipRequests()
      .then((res) => setPendingRequests(res.data?.data || []))
      .catch(() => setPendingRequests([]));
  }, []);

  const handleApprove = async (requestId) => {
    try {
      await approveMentorshipRequest(requestId);
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch {}
  };

  const handleReject = async (requestId) => {
    try {
      await rejectMentorshipRequest(requestId);
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch {}
  };

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
  const projects = data?.supervisedProjects || [];
  const groups = data?.assignedGroups || [];
  const unread = data?.unreadNotificationCount || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-blue-900">
          Welcome, Prof. {profile?.fullName || 'Faculty'}
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

      {pendingRequests.length > 0 && (
        <div className="bg-amber-50 rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
          <div className="p-4 bg-amber-100 border-b border-amber-200 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-700" />
            <span className="font-semibold text-amber-900">Mentorship requests ({pendingRequests.length})</span>
          </div>
          <div className="p-6 space-y-4">
            {pendingRequests.map((r) => (
              <div
                key={r.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-white border border-amber-200"
              >
                <div>
                  <h3 className="font-medium text-blue-900">{r.groupName}</h3>
                  <p className="text-sm text-gray-600">{r.projectTopic}</p>
                  {r.projectDescription && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{r.projectDescription}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/groups/${r.groupId}`}
                    className="px-3 py-2 text-sm text-blue-600 hover:underline"
                  >
                    View group
                  </Link>
                  <button
                    onClick={() => handleApprove(r.id)}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(r.id)}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-blue-600 font-medium">
              Load: {profile?.currentLoad ?? 0} / {profile?.maxGroups ?? 3} groups
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Expertise: {profile?.expertise || '—'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
          <span className="font-semibold text-blue-900 flex items-center gap-2">
            <FolderKanban className="w-5 h-5" />
            Supervised Projects
          </span>
          <Link to="/faculty/projects" className="text-blue-600 text-sm font-medium hover:underline">
            View all
          </Link>
        </div>
        <div className="p-6">
          {projects.length === 0 ? (
            <p className="text-gray-500">No projects assigned yet</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => (
                <Link
                  key={p.projectId}
                  to={`/projects/${p.projectId}`}
                  className="block p-4 rounded-xl border border-blue-100 hover:border-blue-300 hover:bg-blue-50/50 transition"
                >
                  <h3 className="font-medium text-blue-900">{p.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">Progress: {p.progress}%</p>
                  {p.groupId && (
                    <Link
                      to={`/groups/${p.groupId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-600 text-sm mt-2 inline-block"
                    >
                      View Group <ChevronRight className="w-3 h-3 inline" />
                    </Link>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-blue-900">Assigned Groups</span>
        </div>
        <div className="p-6">
          {groups.length === 0 ? (
            <p className="text-gray-500">No groups assigned</p>
          ) : (
            <div className="space-y-3">
              {groups.map((g) => (
                <Link
                  key={g.groupId}
                  to={`/groups/${g.groupId}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-blue-100 hover:border-blue-300 hover:bg-blue-50/50 transition"
                >
                  <div>
                    <h3 className="font-medium text-blue-900">{g.name}</h3>
                    <p className="text-sm text-gray-600">{g.projectTitle} • {g.memberCount} members</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-600" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
