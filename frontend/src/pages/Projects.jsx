/** Student projects: assigned project and available projects list. */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudentDashboard } from '../lib/api';

export function Projects() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentDashboard()
      .then((res) => setData(res.data?.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="h-8 w-48 rounded-lg bg-blue-200/50 animate-pulse" />
        <div className="space-y-4">
          <div className="h-4 w-32 rounded bg-blue-200/50 animate-pulse" />
          <div className="h-32 rounded-2xl bg-white/80 border border-blue-100 animate-pulse" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/80 border border-blue-100 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const project = data?.assignedProject;
  const available = data?.availableProjects || [];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-blue-900 animate-fade-in-up">Projects</h1>

      {project && (
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 animate-fade-in-up hover-lift" style={{ animationDelay: '0.05s', opacity: 0 }}>
          <h2 className="font-semibold text-blue-900 mb-4">My Assigned Project</h2>
          <Link
            to={`/projects/${project.projectId}`}
            className="block p-4 rounded-xl border border-blue-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 hover:scale-[1.01]"
          >
            <h3 className="font-medium text-blue-900">{project.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{project.domain}</p>
            <p className="text-blue-600 text-sm mt-2">Progress: {project.progress}%</p>
          </Link>
        </div>
      )}

      {available.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 animate-fade-in-up hover-lift" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <h2 className="font-semibold text-blue-900 mb-4">Available Projects</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {available.map((p, i) => (
              <Link
                key={p.projectId}
                to={`/projects/${p.projectId}`}
                className="block p-4 rounded-xl border border-blue-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 hover-lift animate-fade-in-up"
                style={{ animationDelay: `${0.15 + i * 0.05}s`, opacity: 0 }}
              >
                <h3 className="font-medium text-blue-900">{p.title}</h3>
                <p className="text-sm text-gray-600">{p.domain}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!project && available.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8 animate-fade-in-up hover-lift" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <h2 className="font-semibold text-blue-900 mb-4">Get started</h2>
          <p className="text-gray-600 text-sm mb-6">
            Create your own project and group, or join an existing group with an invite token.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/groups/create"
              className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-transform hover:scale-105 active:scale-95"
            >
              Create your own group
            </Link>
            <Link
              to="/groups/join"
              className="inline-flex items-center gap-2 px-4 py-3 border border-blue-600 text-blue-700 rounded-lg hover:bg-blue-50 font-medium transition-transform hover:scale-105 active:scale-95"
            >
              Join with invite token
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
