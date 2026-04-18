/** Admin: analytics charts (projects by status, groups by progress). */
import { useState, useEffect } from 'react';
import { getAnalytics } from '../lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const CHART_COLORS = ['#0d9488', '#14b8a6', '#5eead4', '#99f6e4', '#ccfbf1'];

export function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then((res) => setData(res.data?.data))
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const d = data || {};
  const lastMeetingByGroup = Array.isArray(d.lastMeetingByGroup) ? d.lastMeetingByGroup : [];
  const statsForCards = { ...d };
  delete statsForCards.lastMeetingByGroup;
  const studentData = [
    { name: 'With group', value: d.studentsWithGroups || 0, fill: CHART_COLORS[0] },
    { name: 'Without group', value: d.studentsWithoutGroups || 0, fill: CHART_COLORS[2] },
  ].filter((r) => r.value > 0);

  const projectMentorData = [
    { name: 'With mentor', value: d.projectsWithMentor || 0, fill: CHART_COLORS[0] },
    { name: 'Without mentor', value: d.projectsWithoutMentor || 0, fill: CHART_COLORS[3] },
  ].filter((r) => r.value > 0);

  const overviewData = [
    { name: 'Total users', value: d.totalUsers || 0 },
    { name: 'Groups', value: d.totalGroups || 0 },
    { name: 'Projects', value: d.totalProjects || 0 },
    { name: 'Faculty', value: d.totalFaculty || 0 },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-blue-900">Analytics</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(statsForCards).map(([key, value]) => (
          <div
            key={key}
            className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6"
          >
            <p className="text-sm text-gray-600 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{String(value)}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Overview</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {studentData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">Students distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={studentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {studentData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {projectMentorData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">Projects by mentor status</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectMentorData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {projectMentorData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {lastMeetingByGroup.length > 0 && (
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-blue-100 p-6 overflow-x-auto">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">Last Meeting by Group</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-100">
                  <th className="text-left py-2 font-medium text-blue-900">Group</th>
                  <th className="text-left py-2 font-medium text-blue-900">Project</th>
                  <th className="text-left py-2 font-medium text-blue-900">Last Meeting</th>
                  <th className="text-left py-2 font-medium text-blue-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {lastMeetingByGroup.map((row) => (
                  <tr key={row.groupId || row.projectId} className="border-b border-blue-50">
                    <td className="py-3 text-blue-900">{row.groupName || '—'}</td>
                    <td className="py-3 text-gray-600">{row.projectTitle || '—'}</td>
                    <td className="py-3">
                      {row.lastMeetingDate
                        ? new Date(row.lastMeetingDate + 'T00:00:00').toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="py-3">
                      {row.lastMeetingDate ? (
                        row.verified ? (
                          <span className="text-emerald-600">Verified</span>
                        ) : (
                          <span className="text-amber-600">Pending</span>
                        )
                      ) : (
                        <span className="text-gray-400">No meeting</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Students: with vs without group</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'With group', count: d.studentsWithGroups || 0 },
                  { name: 'Without group', count: d.studentsWithoutGroups || 0 },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
