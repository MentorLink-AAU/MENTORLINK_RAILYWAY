/** Admin: bulk upload students or faculty via Excel. */
import { useState } from 'react';
import { uploadStudents, uploadFaculty } from '../lib/api';

export function AdminUpload() {
  const [type, setType] = useState('students');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const res = type === 'students'
        ? await uploadStudents(file)
        : await uploadFaculty(file);
      setResult(res.data?.data);
    } catch (err) {
      setResult({ error: err.response?.data?.error?.message || 'Upload failed' });
    } finally {
      setLoading(false);
    }
  };

  const studentCols = 'Email | FullName | RollNumber | Department | YearOfStudy | Skills | Password';
  const facultyCols = 'Email | FullName | Department | Expertise | MaxGroups | Password';

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-blue-900">Bulk Upload</h1>
      <p className="text-gray-600 text-sm">
        Upload Excel to create users. Include <strong>Password</strong> so users can log in immediately.
        Students not in the list can still <strong>register manually</strong> via the Register page.
      </p>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-blue-200"
          >
            <option value="students">Students</option>
            <option value="faculty">Faculty</option>
          </select>
        </div>
        <div className="p-4 rounded-lg bg-blue-50 text-sm text-blue-800">
          <p className="font-medium mb-2">
            {type === 'students' ? 'Students format:' : 'Faculty format:'}
          </p>
          <code className="block text-xs break-all">
            {type === 'students' ? studentCols : facultyCols}
          </code>
          <p className="mt-2 text-blue-600">
            Password is optional. If empty, a random password is set (user must reset via Profile).
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Excel File</label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0])}
            className="w-full"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !file}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {result && !result.error && (
        <div className="bg-blue-50 rounded-xl p-4 text-blue-800">
          <p>Created: {result.created ?? result.createdCount ?? 0}</p>
          <p>Skipped: {result.skipped ?? result.skippedCount ?? 0}</p>
          {result.errors?.length > 0 && (
            <div className="mt-2 text-sm text-red-600">
              {result.errors.slice(0, 5).map((e, i) => (
                <p key={i}>{e}</p>
              ))}
            </div>
          )}
        </div>
      )}
      {result?.error && (
        <div className="bg-red-50 rounded-xl p-4 text-red-700">{result.error}</div>
      )}
    </div>
  );
}
