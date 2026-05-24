/** Admin: analytics charts with admin/users/groups data. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getAdminGroupsWithProgress, getAnalytics, getUsers } from '../lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const BAR_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#a855f7', '#ef4444'];
const EXPERTISE_SPLIT_REGEX = /[,;/|]/;

function getFacultySkillTokens(mentor) {
  const explicitSkills = (mentor.skills || [])
    .map((s) => s?.trim())
    .filter(Boolean);
  if (explicitSkills.length > 0) return explicitSkills;

  // Fallback: parse legacy expertise text entered by admin.
  return String(mentor.expertise || '')
    .split(EXPERTISE_SPLIT_REGEX)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLimitOption, setShowLimitOption] = useState('12');
  const [customTopNInput, setCustomTopNInput] = useState('12');
  const [searchTerm, setSearchTerm] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('ALL');
  const [expandedOthers, setExpandedOthers] = useState({});
  const chartsContainerRef = useRef(null);

  useEffect(() => {
    Promise.all([getAnalytics(), getUsers(), getAdminGroupsWithProgress()])
      .then(([analyticsRes, usersRes, groupsRes]) => {
        setAnalyticsData(analyticsRes.data?.data || {});
        setUsers(usersRes.data?.data || []);
        setGroups(groupsRes.data?.data || []);
      })
      .catch(() => {
        setAnalyticsData({});
        setUsers([]);
        setGroups([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const d = analyticsData || {};
  const statsForCards = { ...d };
  delete statsForCards.lastMeetingByGroup;

  const students = useMemo(
    () => users.filter((u) => (u.role || '').toUpperCase() === 'STUDENT'),
    [users]
  );
  const faculty = useMemo(
    () => users.filter((u) => (u.role || '').toUpperCase() === 'FACULTY'),
    [users]
  );
  const facultyOptions = useMemo(
    () =>
      faculty
        .map((f) => ({ label: f.fullName || f.email, value: (f.email || '').toLowerCase() }))
        .filter((f) => f.value)
        .sort((a, b) => a.label.localeCompare(b.label)),
    [faculty]
  );
  const filteredFaculty = useMemo(
    () =>
      facultyFilter === 'ALL'
        ? faculty
        : faculty.filter((f) => (f.email || '').toLowerCase() === facultyFilter),
    [faculty, facultyFilter]
  );

  const studentById = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);
  const facultyByEmail = useMemo(
    () =>
      new Map(
        filteredFaculty
          .filter((f) => f.email)
          .map((f) => [f.email.toLowerCase(), f])
      ),
    [filteredFaculty]
  );

  const studentSkillData = useMemo(() => {
    const counts = new Map();
    students.forEach((student) => {
      (student.skills || []).forEach((skill) => {
        const normalized = skill?.trim();
        if (!normalized) return;
        counts.set(normalized, (counts.get(normalized) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  }, [students]);

  const facultySkillData = useMemo(() => {
    const counts = new Map();
    filteredFaculty.forEach((mentor) => {
      getFacultySkillTokens(mentor).forEach((skill) => {
        const normalized = skill?.trim();
        if (!normalized) return;
        counts.set(normalized, (counts.get(normalized) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  }, [filteredFaculty]);

  const groupProgressData = useMemo(
    () =>
      groups
        .map((g) => ({ name: g.groupName || `Group ${g.groupId}`, value: g.progress || 0 }))
        .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name)),
    [groups]
  );

  const mentorLoadData = useMemo(() => {
    const counts = new Map();
    groups.forEach((g) => {
      const mentor = g.mentorName || g.mentorEmail;
      if (!mentor) return;
      if (
        facultyFilter !== 'ALL' &&
        (g.mentorEmail || '').toLowerCase() !== facultyFilter
      ) {
        return;
      }
      counts.set(mentor, (counts.get(mentor) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  }, [groups, facultyFilter]);

  const departmentFormationData = useMemo(() => {
    const departmentToGroups = new Map();
    groups.forEach((g) => {
      const groupKey = g.groupId ?? g.groupName;
      (g.members || []).forEach((member) => {
        const student = studentById.get(member.userId);
        const dept = student?.department?.trim();
        if (!dept) return;
        if (!departmentToGroups.has(dept)) departmentToGroups.set(dept, new Set());
        departmentToGroups.get(dept).add(groupKey);
      });
    });
    return Array.from(departmentToGroups.entries())
      .map(([name, groupSet]) => ({ name, value: groupSet.size }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  }, [groups, studentById]);

  const alignmentByGroupData = useMemo(() => {
    return groups
      .map((g) => {
        const mentor = facultyByEmail.get((g.mentorEmail || '').toLowerCase());
        if (!mentor) return null;
        const mentorSkills = new Set(
          getFacultySkillTokens(mentor)
            .map((s) => s?.trim()?.toLowerCase())
            .filter(Boolean)
        );
        const studentSkills = new Set();
        (g.members || []).forEach((member) => {
          const student = studentById.get(member.userId);
          if (!student) return;
          (student.skills || []).forEach((skill) => {
            const normalized = skill?.trim()?.toLowerCase();
            if (!normalized) return;
            studentSkills.add(normalized);
          });
        });
        const union = new Set([...mentorSkills, ...studentSkills]);
        if (union.size === 0) return null;
        const intersection = [...studentSkills].filter((s) => mentorSkills.has(s)).length;
        return {
          name: g.groupName || `Group ${g.groupId}`,
          value: Number(((intersection / union.size) * 100).toFixed(2)),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  }, [groups, facultyByEmail, studentById]);

  const activeTopN = useMemo(() => {
    if (showLimitOption === 'all') return -1;
    if (showLimitOption === 'custom') {
      const customParsed = Number.parseInt(customTopNInput, 10);
      return Number.isFinite(customParsed) && customParsed > 0 ? customParsed : 12;
    }
    const parsed = Number.parseInt(showLimitOption, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 12;
  }, [showLimitOption, customTopNInput]);

  const applyTopAndSearch = useCallback((items, includeOthers = true) => {
    const query = searchTerm.trim().toLowerCase();
    const filtered = query
      ? items.filter((item) => item.name.toLowerCase().includes(query))
      : items;
    if (activeTopN === -1 || filtered.length <= activeTopN) {
      return { visible: filtered, hidden: [], total: filtered.length };
    }
    const visible = filtered.slice(0, activeTopN);
    const hidden = filtered.slice(activeTopN);
    if (!includeOthers) {
      return { visible, hidden, total: filtered.length };
    }
    const othersTotal = hidden.reduce((sum, item) => sum + Number(item.value || 0), 0);
    return {
      visible: [...visible, { name: 'Others', value: Number(othersTotal.toFixed(2)) }],
      hidden,
      total: filtered.length,
    };
  }, [searchTerm, activeTopN]);

  const studentSkillDisplay = useMemo(
    () => applyTopAndSearch(studentSkillData, false),
    [studentSkillData, applyTopAndSearch]
  );
  const facultySkillDisplay = useMemo(
    () => applyTopAndSearch(facultySkillData),
    [facultySkillData, applyTopAndSearch]
  );
  const groupProgressDisplay = useMemo(
    () => applyTopAndSearch(groupProgressData, false),
    [groupProgressData, applyTopAndSearch]
  );
  const mentorLoadDisplay = useMemo(
    () => applyTopAndSearch(mentorLoadData, false),
    [mentorLoadData, applyTopAndSearch]
  );
  const departmentFormationDisplay = useMemo(
    () => applyTopAndSearch(departmentFormationData),
    [departmentFormationData, applyTopAndSearch]
  );
  const alignmentByGroupDisplay = useMemo(
    () => applyTopAndSearch(alignmentByGroupData, false),
    [alignmentByGroupData, applyTopAndSearch]
  );

  const renderBarCard = (key, title, dataPack, color, ySuffix = '') => (
    <div
      className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6"
      data-bar-chart-title={title}
      data-bar-chart-key={key}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-blue-900">{title}</h2>
        <span className="text-xs text-gray-500">Items: {dataPack.total}</span>
      </div>
      <div className="h-72">
        {dataPack.visible.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataPack.visible} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tickFormatter={(v) => `${v}${ySuffix}`} />
              <YAxis type="category" dataKey="name" width={140} />
              <Tooltip formatter={(value) => [`${value}${ySuffix}`, 'Value']} />
              <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {dataPack.hidden.length > 0 && (
        <div className="mt-4 border-t border-blue-100 pt-3">
          <button
            type="button"
            className="text-sm font-medium text-blue-700 hover:text-blue-900"
            onClick={() => setExpandedOthers((prev) => ({ ...prev, [key]: !prev[key] }))}
          >
            {expandedOthers[key] ? 'Hide' : 'Show'} hidden items inside "Others" ({dataPack.hidden.length})
          </button>
          {expandedOthers[key] && (
            <div className="mt-3 max-h-40 overflow-y-auto rounded-lg border border-blue-100">
              <table className="w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="text-left px-3 py-2">Name</th>
                    <th className="text-right px-3 py-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {dataPack.hidden.map((row) => (
                    <tr key={row.name} className="border-t border-blue-50">
                      <td className="px-3 py-2">{row.name}</td>
                      <td className="px-3 py-2 text-right">{row.value}{ySuffix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const downloadAllBarCharts = useCallback(() => {
    const container = chartsContainerRef.current;
    if (!container) return;

    const chartCards = Array.from(container.querySelectorAll('[data-bar-chart-title]'));
    chartCards.forEach((card, idx) => {
      const svg = card.querySelector('svg');
      if (!svg) return;

      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svg);
      if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(
          /^<svg/,
          '<svg xmlns="http://www.w3.org/2000/svg"'
        );
      }
      if (!source.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(
          /^<svg/,
          '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
        );
      }

      const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const title = String(card.getAttribute('data-bar-chart-title') || `chart-${idx + 1}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || `chart-${idx + 1}`}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-blue-900">Analytics</h1>

      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-4 flex flex-col gap-3 md:flex-row md:items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Show</label>
          <select
            value={showLimitOption}
            onChange={(e) => setShowLimitOption(e.target.value)}
            className="rounded-lg border border-blue-200 px-3 py-2 text-sm"
          >
            <option value="8">Top 8</option>
            <option value="12">Top 12</option>
            <option value="20">Top 20</option>
            <option value="all">All</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        {showLimitOption === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom top</label>
            <input
              type="number"
              min="1"
              step="1"
              value={customTopNInput}
              onChange={(e) => setCustomTopNInput(e.target.value)}
              placeholder="Enter a number"
              className="w-32 rounded-lg border border-blue-200 px-3 py-2 text-sm"
            />
          </div>
        )}
        <div className="md:min-w-[260px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search in chart labels</label>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type skill, group, mentor, department..."
            className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
            className="rounded-lg border border-blue-200 px-3 py-2 text-sm max-w-[260px]"
          >
            <option value="ALL">All faculties</option>
            {facultyOptions.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <div className="md:ml-auto">
          <button
            type="button"
            onClick={downloadAllBarCharts}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Download All Bar Graphs
          </button>
        </div>
      </div>

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

      <div ref={chartsContainerRef} className="grid lg:grid-cols-2 gap-8">
        {renderBarCard('student-skills', 'Student Skills Distribution', studentSkillDisplay, BAR_COLORS[0])}
        {renderBarCard('faculty-skills', 'Faculty Skills Distribution', facultySkillDisplay, BAR_COLORS[1])}
        {renderBarCard('group-progress', 'Group Progress by Group', groupProgressDisplay, BAR_COLORS[2], '%')}
        {renderBarCard('mentor-load', 'Mentor Load', mentorLoadDisplay, BAR_COLORS[3])}
        {renderBarCard('department-formation', 'Department-wise Group Formation', departmentFormationDisplay, BAR_COLORS[4])}
        {renderBarCard('alignment', 'Alignment Score by Group', alignmentByGroupDisplay, BAR_COLORS[5], '%')}

      </div>
    </div>
  );
}
