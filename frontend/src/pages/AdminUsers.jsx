/** Admin: list users, delete user. */
import { useState, useEffect } from 'react';
import { getUsers, deleteUser } from '../lib/api';

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    getUsers()
      .then((res) => {
        const raw = res.data;
        const list = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
        setUsers(list);
      })
      .catch((err) => {
        setUsers([]);
        const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message;
        setError(msg || (err.response?.status === 403 ? 'Access denied. Admin role required.' : 'Failed to load users.'));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-900">Users</h1>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="overflow-x-auto">
          {users.length === 0 && !error && (
            <div className="p-8 text-center text-gray-500">No users found.</div>
          )}
          {users.length > 0 && (
          <table className="w-full">
            <thead className="bg-blue-50">
              <tr>
                <th className="text-left px-4 py-3 text-blue-900 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-blue-900 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-blue-900 font-medium">Role</th>
                <th className="text-right px-4 py-3 text-blue-900 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-blue-100 hover:bg-blue-50/50">
                  <td className="px-4 py-3">{u.fullName}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                      {u.role?.replace('ROLE_', '')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
}
