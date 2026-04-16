/** Faculty: list supervised projects with meeting/schedule status. */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFacultyDashboard } from '../lib/api';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';

export function FacultyProjects() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFacultyDashboard()
      .then((res) => setData(res.data?.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 rounded-lg bg-blue-200/50 animate-pulse" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-white/80 border border-blue-100 animate-pulse" />
          ))}
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const projects = data?.supervisedProjects || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-900 animate-fade-in-up">Supervised Projects</h1>
      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-12 text-center text-gray-500 animate-fade-in-up">
          No projects assigned yet
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <Link
              key={p.projectId}
              to={`/projects/${p.projectId}`}
              className="block bg-white rounded-2xl shadow-lg border border-blue-100 p-6 hover:border-blue-300 hover:shadow-xl hover-lift animate-fade-in-up"
              style={{ animationDelay: `${0.05 + i * 0.06}s`, opacity: 0 }}
            >
              <h3 className="font-semibold text-blue-900">{p.title}</h3>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{p.description}</p>
              <p className="text-blue-600 text-sm mt-4">Progress: {p.progress}%</p>
              {p.lastMeetingDate && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Last meeting: {new Date(p.lastMeetingDate + 'T00:00:00').toLocaleDateString()}</span>
                  {p.lastMeetingVerified ? (
                    <span className="inline-flex items-center gap-0.5 text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-amber-600">
                      <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                  )}
                </div>
              )}
              {p.groupId && (
                <Link
                  to={`/groups/${p.groupId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-600 text-sm mt-2 inline-block hover:underline"
                >
                  View Group →
                </Link>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
