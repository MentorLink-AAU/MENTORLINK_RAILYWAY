/** Profile page: view/edit profile, upload photo; role-specific fields. */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProfile, updateProfile, uploadProfilePhoto } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Camera,
  Loader2,
  Users,
  GraduationCap,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { AuthImage } from '../components/AuthImage';

export function Profile() {
  const { user, refreshUser, isStudent, isFaculty, isAdmin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState({ type: null, text: '' });
  const [form, setForm] = useState({
    fullName: '',
    contactNumber: '',
    bio: '',
    skills: '',
    interests: '',
    rollNumber: '',
    department: '',
    yearOfStudy: '',
    expertise: '',
    phoneNumber: '',
  });

  useEffect(() => {
    getProfile()
      .then((res) => {
        const p = res.data?.data;
        setProfile(p);
        setForm({
          fullName: p?.fullName || user?.fullName || '',
          contactNumber: p?.contactNumber || user?.contactNumber || '',
          bio: p?.bio || '',
          skills: (p?.skills || []).join(', '),
          interests: (p?.interests || []).join(', '),
          rollNumber: p?.rollNumber || '',
          department: p?.department || '',
          yearOfStudy: p?.yearOfStudy != null ? String(p.yearOfStudy) : '',
          expertise: p?.expertise || '',
          phoneNumber: p?.phoneNumber || '',
        });
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const clearMessage = () => setMessage({ type: null, text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    clearMessage();
    try {
      const payload = {
        fullName: form.fullName?.trim() || undefined,
        contactNumber: form.contactNumber?.trim() || undefined,
        bio: form.bio?.trim() || undefined,
        skills: form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        interests: form.interests ? form.interests.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        rollNumber: form.rollNumber?.trim() || undefined,
        department: form.department?.trim() || undefined,
        yearOfStudy: form.yearOfStudy ? parseInt(form.yearOfStudy, 10) : undefined,
        expertise: form.expertise?.trim() || undefined,
        phoneNumber: form.phoneNumber?.trim() || undefined,
      };
      await updateProfile(payload);
      await refreshUser();
      const res = await getProfile();
      setProfile(res.data?.data);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setTimeout(clearMessage, 3000);
    } catch (e) {
      setMessage({
        type: 'error',
        text: e.response?.data?.error?.message || 'Failed to update profile',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    clearMessage();
    try {
      await uploadProfilePhoto(file);
      await refreshUser();
      const res = await getProfile();
      setProfile(res.data?.data);
      setMessage({ type: 'success', text: 'Photo updated' });
      setTimeout(clearMessage, 3000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to upload photo' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const photoUrl = profile?.profilePictureUrl;
  const baseUrl = import.meta.env.VITE_API_URL || '';

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-blue-900">Profile</h1>

      {message.text && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
              {photoUrl ? (
                <AuthImage
                  src={baseUrl + photoUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-14 h-14 text-blue-600" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 disabled:opacity-50">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
              />
              {uploadingPhoto ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </label>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl font-semibold text-blue-900">
              {profile?.fullName || user?.fullName || '—'}
            </h2>
            <p className="text-gray-600">{profile?.email || user?.email}</p>
            <p className="text-sm text-blue-600 mt-1">
              {profile?.department || user?.department || '—'}
            </p>
            {isFaculty && profile?.maxGroups != null && (
              <p className="text-sm text-gray-600 mt-2">
                Load: {profile.currentLoad ?? 0} / {profile.maxGroups} groups
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Student: Assigned group & mentor */}
      {isStudent && (profile?.group || profile?.assignedMentor) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {profile?.group && (
            <Link
              to={`/groups/${profile.group.groupId}`}
              className="block bg-white rounded-xl border border-blue-100 p-4 hover:border-blue-300 transition"
            >
              <div className="flex items-center gap-2 text-blue-900 font-medium mb-1">
                <Users className="w-5 h-5" />
                My Group
              </div>
              <p className="text-sm text-gray-600">{profile.group.name}</p>
              <p className="text-xs text-blue-600 mt-1">
                {profile.group.projectTitle} • {profile.group.memberCount} members
              </p>
            </Link>
          )}
          {profile?.assignedMentor && (
            <div className="bg-white rounded-xl border border-blue-100 p-4">
              <div className="flex items-center gap-2 text-blue-900 font-medium mb-1">
                <GraduationCap className="w-5 h-5" />
                Assigned Mentor
              </div>
              <p className="text-sm font-medium">{profile.assignedMentor.name}</p>
              <p className="text-xs text-gray-600">{profile.assignedMentor.department}</p>
              <p className="text-xs text-blue-600 mt-1">{profile.assignedMentor.expertise}</p>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 space-y-4">
        <h2 className="font-semibold text-blue-900">Edit Profile</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={form.fullName || ''}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
          <input
            type="text"
            value={form.contactNumber || ''}
            onChange={(e) => setForm((f) => ({ ...f, contactNumber: e.target.value }))}
            placeholder="+1 234 567 8900"
            className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {(isStudent || isFaculty) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              type="text"
              value={form.department || ''}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              placeholder="Computer Science"
              className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {isStudent && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
              <input
                type="text"
                value={form.rollNumber || ''}
                onChange={(e) => setForm((f) => ({ ...f, rollNumber: e.target.value }))}
                placeholder="e.g. 21BCS001"
                className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
              <input
                type="text"
                value={form.yearOfStudy || ''}
                onChange={(e) => setForm((f) => ({ ...f, yearOfStudy: e.target.value }))}
                placeholder="1, 2, 3, or 4"
                className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {isFaculty && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expertise</label>
              <input
                type="text"
                value={form.expertise || ''}
                onChange={(e) => setForm((f) => ({ ...f, expertise: e.target.value }))}
                placeholder="Machine Learning, Web Dev"
                className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={form.phoneNumber || ''}
                onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                placeholder="Faculty contact"
                className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={form.bio || ''}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            rows={3}
            placeholder="Brief introduction..."
            className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isStudent && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills (comma separated)
            </label>
            <input
              type="text"
              value={form.skills || ''}
              onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
              placeholder="React, Python, NLP"
              className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {isStudent && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interests (comma separated)
            </label>
            <input
              type="text"
              value={form.interests || ''}
              onChange={(e) => setForm((f) => ({ ...f, interests: e.target.value }))}
              placeholder="AI, Web development"
              className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-medium"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Save Changes
        </button>
      </form>
    </div>
  );
}
