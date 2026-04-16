/** Admin dashboard: stats, groups list, search, expandable group details. */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboard, getAdminGroupsWithProgress, resetYearlyData } from '../lib/api';
import {
  BarChart3,
  Users,
  Calendar,
  Bell,
  ChevronRight,
  Search,
  ChevronDown,
  ChevronUp,
  TriangleAlert,
} from 'lucide-react';

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  useEffect(() => {
    getAdminDashboard()
      .then((res) => setData(res.data?.data))
      .catch((e) => setError(e.response?.data?.error?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setGroupsLoading(true);
      getAdminGroupsWithProgress(searchQuery.trim() || undefined)
        .then((res) => setGroups(res.data?.data || []))
        .catch(() => setGroups([]))
        .finally(() => setGroupsLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
  const analytics = data?.analytics || {};
  const unread = data?.unreadNotificationCount || 0;

  const handleYearlyReset = async () => {
    const confirmed = window.confirm(
      'This will delete yearly academic data, uploaded users, groups, projects, deadlines, recommender outputs, and related records. Admin accounts will be kept. Do you want to continue?'
    );
    if (!confirmed) return;

    const secondConfirm = window.prompt('Type RESET to confirm yearly data reset.');
    if (secondConfirm !== 'RESET') return;

    try {
      setResetting(true);
      setResetMessage('');
      const res = await resetYearlyData();
      setResetMessage(res.data?.data || 'Yearly data reset successfully.');
      setGroups([]);
      const dashboardRes = await getAdminDashboard();
      setData(dashboardRes.data?.data);
    } catch (e) {
      setResetMessage(e.response?.data?.error?.message || 'Failed to reset yearly data.');
    } finally {
      setResetting(false);
    }
  };

  const stats = [
    { label: 'Total Users', value: analytics.totalUsers ?? 0, icon: Users },
    { label: 'Projects', value: analytics.totalProjects ?? 0, icon: BarChart3 },
    { label: 'Groups', value: analytics.totalGroups ?? 0, icon: Users },
    { label: 'Faculty', value: analytics.totalFaculty ?? 0, icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-blue-900">
          Admin Dashboard
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 flex items-center gap-4"
          >
            <div className="p-3 bg-blue-100 rounded-xl">
              <Icon className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{value}</p>
              <p className="text-sm text-gray-600">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search Groups & Progress */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="p-4 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center gap-4">
          <h2 className="font-semibold text-blue-900">All Groups & Progress</h2>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by group name, project, mentor, or member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-blue-200 text-blue-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {groupsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : groups.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No groups found</p>
          ) : (
            <div className="divide-y divide-blue-50">
              {groups.map((g) => (
                <div key={g.groupId} className="hover:bg-blue-50/50">
                  <button
                    type="button"
                    onClick={() => setExpandedGroupId(expandedGroupId === g.groupId ? null : g.groupId)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-blue-900">{g.groupName}</span>
                      <Link
                        to={`/admin/groups/${g.groupId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-blue-600 hover:underline font-medium"
                      >
                        {g.projectTitle || '—'}
                      </Link>
                      <span className="text-sm font-medium text-blue-600">Progress: {g.progress}%</span>
                    </div>
                    {expandedGroupId === g.groupId ? (
                      <ChevronUp className="w-5 h-5 text-blue-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-blue-600 shrink-0" />
                    )}
                  </button>
                  {expandedGroupId === g.groupId && (
                    <div className="px-6 pb-4 pt-0 space-y-3 bg-blue-50/30">
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-blue-900 mb-1">Members ({g.memberCount})</p>
                          <ul className="space-y-1">
                            {(g.members || []).map((m) => (
                              <li key={m.userId} className="text-gray-700">
                                {m.fullName || m.email} {m.isLeader && '(Leader)'}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-blue-900 mb-1">Mentor</p>
                          <p className="text-gray-700">{g.mentorName || g.mentorEmail || '—'}</p>
                          {g.lastMeetingDate && (
                            <>
                              <p className="font-medium text-blue-900 mt-3 mb-1">Last Meeting</p>
                              <p className="text-gray-700">
                                {new Date(g.lastMeetingDate + 'T00:00:00').toLocaleDateString()}
                                {g.lastMeetingVerified ? ' ✓ Verified' : ' (Pending)'}
                              </p>
                              {g.lastMeetingDetails && (
                                <p className="text-gray-600 text-xs mt-1 line-clamp-2">{g.lastMeetingDetails}</p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <Link
                        to={`/groups/${g.groupId}`}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                      >
                        View full details <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link
          to="/admin/users"
          className="block bg-white rounded-2xl shadow-lg border border-blue-100 p-6 hover:border-blue-300 transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Manage Users</h3>
                <p className="text-sm text-gray-600">View, add, remove users</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-600" />
          </div>
        </Link>
        <Link
          to="/admin/analytics"
          className="block bg-white rounded-2xl shadow-lg border border-blue-100 p-6 hover:border-blue-300 transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <BarChart3 className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Analytics</h3>
                <p className="text-sm text-gray-600">Platform analytics</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-600" />
          </div>
        </Link>
        <Link
          to="/admin/deadlines"
          className="block bg-white rounded-2xl shadow-lg border border-blue-100 p-6 hover:border-blue-300 transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Deadlines</h3>
                <p className="text-sm text-gray-600">Manage deadlines</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-600" />
          </div>
        </Link>
        <Link
          to="/admin/upload"
          className="block bg-white rounded-2xl shadow-lg border border-blue-100 p-6 hover:border-blue-300 transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Bulk Upload</h3>
                <p className="text-sm text-gray-600">Upload students/faculty Excel</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-600" />
          </div>
        </Link>
        <Link
          to="/admin/auto-group"
          className="block bg-white rounded-2xl shadow-lg border border-blue-100 p-6 hover:border-blue-300 transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Auto Group</h3>
                <p className="text-sm text-gray-600">Auto-group from Excel</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-600" />
          </div>
        </Link>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-xl">
            <TriangleAlert className="w-6 h-6 text-red-700" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-red-900">Yearly Database Reset</h2>
            <p className="mt-1 text-sm text-red-700">
              Use this at the end of the academic year to clear students, faculty, projects, groups,
              deadlines, recommender outputs, and uploaded files. Admin accounts are preserved.
            </p>
            {resetMessage && (
              <div className="mt-3 rounded-lg bg-white/70 px-4 py-3 text-sm text-red-800 border border-red-200">
                {resetMessage}
              </div>
            )}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleYearlyReset}
                disabled={resetting}
                className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {resetting ? 'Resetting...' : 'Reset Yearly Data'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
