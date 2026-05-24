import { useEffect, useMemo, useState } from 'react';
import { getAnalytics } from '../lib/api';

export function AdminMeetingLogs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then((res) => {
        const data = res.data?.data || {};
        setRows(Array.isArray(data.lastMeetingByGroup) ? data.lastMeetingByGroup : []);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) => {
        const aTime = a?.lastMeetingDate ? new Date(`${a.lastMeetingDate}T00:00:00`).getTime() : 0;
        const bTime = b?.lastMeetingDate ? new Date(`${b.lastMeetingDate}T00:00:00`).getTime() : 0;
        return bTime - aTime;
      }),
    [rows]
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-mentor-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-mentor-text">Meeting Logs</h1>
        <p className="mt-1 text-sm text-mentor-muted">Last meeting status for all groups.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-mentor-border bg-mentor-card shadow-lg">
        {sortedRows.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-mentor-muted">No meeting log data available.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mentor-border bg-mentor-surface/60">
                <th className="px-4 py-3 text-left font-medium text-mentor-text">Group</th>
                <th className="px-4 py-3 text-left font-medium text-mentor-text">Project</th>
                <th className="px-4 py-3 text-left font-medium text-mentor-text">Last Meeting</th>
                <th className="px-4 py-3 text-left font-medium text-mentor-text">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr key={row.groupId || row.projectId} className="border-b border-mentor-border last:border-b-0">
                  <td className="px-4 py-3 text-mentor-text">{row.groupName || '—'}</td>
                  <td className="px-4 py-3 text-mentor-muted">{row.projectTitle || '—'}</td>
                  <td className="px-4 py-3 text-mentor-muted">
                    {row.lastMeetingDate
                      ? new Date(`${row.lastMeetingDate}T00:00:00`).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {row.lastMeetingDate ? (
                      row.verified ? (
                        <span className="text-mentor-success">Verified</span>
                      ) : (
                        <span className="text-mentor-warning">Pending</span>
                      )
                    ) : (
                      <span className="text-mentor-muted">No meeting</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
