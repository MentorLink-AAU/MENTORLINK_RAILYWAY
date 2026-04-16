/** Top nav: logo, role-based links, notifications, user menu. */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotificationContext } from '../context/NotificationProvider';
import { getProfile } from '../lib/api';
import {
  Menu,
  X,
  LogOut,
  Bell,
  GraduationCap,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';

export function Navbar() {
  const { user, logout, isStudent, isFaculty, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead } = useNotificationContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hasGroup, setHasGroup] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (!isStudent) return;
    getProfile()
      .then((res) => setHasGroup(!!res.data?.data?.group))
      .catch(() => setHasGroup(false));
  }, [isStudent, user?.id, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath = isStudent
    ? '/dashboard/student'
    : isFaculty
    ? '/dashboard/faculty'
    : isAdmin
    ? '/dashboard/admin'
    : '/';

  return (
    <nav className="bg-blue-800 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link
            to={dashboardPath}
            className="flex items-center gap-2 font-bold text-xl hover:text-blue-200 transition"
          >
            <GraduationCap className="w-8 h-8" />
            MentorLink
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to={dashboardPath}
              className="flex items-center gap-2 hover:text-blue-200 transition"
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            {isStudent && (
              <>
                <Link to="/projects" className="hover:text-blue-200 transition">
                  Projects
                </Link>
                <Link to="/groups/create" className="hover:text-blue-200 transition">
                  Create Group
                </Link>
                {!hasGroup && (
                  <Link to="/groups/join" className="hover:text-blue-200 transition">
                    Join Group
                  </Link>
                )}
              </>
            )}
            {isFaculty && (
              <Link to="/faculty/projects" className="hover:text-blue-200 transition">
                Supervised
              </Link>
            )}
            {isAdmin && (
              <>
                <Link to="/admin/users" className="hover:text-blue-200 transition">
                  Users
                </Link>
                <Link to="/admin/analytics" className="hover:text-blue-200 transition">
                  Analytics
                </Link>
              </>
            )}
            <Link to="/profile" className="hover:text-blue-200 transition">
              Profile
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setUserMenuOpen(false);
                }}
                className="p-2 rounded-lg hover:bg-blue-700 relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200 py-2 max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 border-b font-semibold">Notifications</div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-gray-500 text-sm">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          setNotifOpen(false);
                        }}
                        className={`px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 ${
                          !n.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <p className="text-sm">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-700"
              >
                <span className="hidden sm:inline truncate max-w-[120px]">
                  {user?.fullName || user?.email}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200 py-2">
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 hover:bg-blue-50"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 hover:bg-blue-50 text-left text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden py-4 border-t border-blue-700">
            <Link
              to={dashboardPath}
              onClick={() => setMenuOpen(false)}
              className="block py-2 hover:text-blue-200"
            >
              Dashboard
            </Link>
            {isStudent && (
              <>
                <Link to="/projects" onClick={() => setMenuOpen(false)} className="block py-2 hover:text-blue-200">
                  Projects
                </Link>
                <Link to="/groups/create" onClick={() => setMenuOpen(false)} className="block py-2 hover:text-blue-200">
                  Create Group
                </Link>
                {!hasGroup && (
                  <Link to="/groups/join" onClick={() => setMenuOpen(false)} className="block py-2 hover:text-blue-200">
                    Join Group
                  </Link>
                )}
              </>
            )}
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className="block py-2 hover:text-blue-200"
            >
              Profile
            </Link>
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-2 py-2 text-red-300"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
