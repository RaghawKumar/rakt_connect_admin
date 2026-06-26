import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  Droplet, 
  Trash2, 
  Edit3, 
  LogOut, 
  MapPin, 
  AlertOctagon, 
  Search, 
  Filter, 
  Check, 
  X, 
  Lock, 
  Phone, 
  ShieldAlert, 
  RefreshCw, 
  Calendar, 
  Database,
  UserCheck,
  Flame,
  AlertCircle
} from 'lucide-react';
import { api } from './services/api';
import './App.css';

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(api.auth.isAuthenticated());
  const [currentUser, setCurrentUser] = useState(api.auth.getCurrentUser());
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Navigation state
  const [activeTab, setActiveTab] = useState('dashboard');

  // Application data states
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search and Filter states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [requestSearch, setRequestSearch] = useState('');
  const [requestPriorityFilter, setRequestPriorityFilter] = useState('');
  const [stockSearch, setStockSearch] = useState('');
  const [stockGroupFilter, setStockGroupFilter] = useState('');

  // Modals state
  const [editingUser, setEditingUser] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);
  const [updatingStockId, setUpdatingStockId] = useState(null);
  const [newStockVal, setNewStockVal] = useState('');

  // Toasts state
  const [toasts, setToasts] = useState([]);

  // Toast helper
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Fetch stats (dashboard data)
  const fetchStats = async () => {
    try {
      const data = await api.admin.getStats();
      setStats(data.stats);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const data = await api.admin.getUsers();
      setUsers(data.users);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Fetch Blood Requests
  const fetchRequests = async () => {
    try {
      const data = await api.admin.getBloodRequests();
      setRequests(data.requests);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Fetch Blood Stocks
  const fetchStocks = async () => {
    try {
      const data = await api.admin.getStocks();
      setStocks(data.stocks);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Load active tab data
  const loadTabContent = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    if (activeTab === 'dashboard') {
      await fetchStats();
    } else if (activeTab === 'users') {
      await fetchUsers();
    } else if (activeTab === 'requests') {
      await fetchRequests();
    } else if (activeTab === 'stocks') {
      await fetchStocks();
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTabContent();
  }, [activeTab, isAuthenticated]);

  // Auth: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone) {
      setAuthError('Please enter a phone number');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await api.auth.sendOtp(phone, 'admin');
      setOtpSent(true);
      addToast('Mock OTP 123456 sent successfully', 'success');
      // Autofill in dev mode if response contains it
      if (res.otp_code) {
        setOtpCode(res.otp_code);
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Auth: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      setAuthError('Please enter the OTP');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await api.auth.verifyOtp(phone, 'admin', otpCode);
      if (res.user.role !== 'admin') {
        api.auth.logout();
        setAuthError('Access denied. Admin role required.');
        setIsAuthenticated(false);
        return;
      }
      setIsAuthenticated(true);
      setCurrentUser(res.user);
      addToast(`Welcome back, ${res.user.full_name || 'Admin'}`, 'success');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Auth: Logout
  const handleLogout = () => {
    api.auth.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setPhone('');
    setOtpSent(false);
    setOtpCode('');
    addToast('Logged out successfully', 'info');
  };

  // Admin Actions: User Edit & Update
  const handleUserUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.admin.updateUser(editingUser.id, editingUser);
      addToast(res.message, 'success');
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Admin Actions: User Delete
  const handleUserDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? All their blood requests will be deleted as well.')) return;
    try {
      const res = await api.admin.deleteUser(id);
      addToast(res.message, 'success');
      fetchUsers();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Admin Actions: Request Update
  const handleRequestUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.admin.updateBloodRequest(editingRequest.id, editingRequest);
      addToast(res.message, 'success');
      setEditingRequest(null);
      fetchRequests();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Admin Actions: Request Delete
  const handleRequestDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blood request?')) return;
    try {
      const res = await api.admin.deleteBloodRequest(id);
      addToast(res.message, 'success');
      fetchRequests();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Admin Actions: Stock Quick Update
  const handleStockUpdate = async (stockItem) => {
    if (newStockVal === '' || isNaN(newStockVal) || parseInt(newStockVal) < 0) {
      addToast('Please enter a valid stock level (0 or positive integer)', 'warning');
      return;
    }
    try {
      const res = await api.admin.updateStock(stockItem.id, parseInt(newStockVal));
      addToast(res.message, 'success');
      setUpdatingStockId(null);
      setNewStockVal('');
      fetchStocks();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Render Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-card glass-panel">
          <div className="login-logo">
            <Droplet size={38} color="red" fill="red" />
            <h1>RaktSetu</h1>
          </div>
          <div className="login-subtitle">Admin Control Panel</div>

          {authError && <div className="login-error">{authError}</div>}

          {!otpSent ? (
            <form onSubmit={handleSendOtp}>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} className="search-icon" />
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="+91 99999 99999" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={authLoading}>
                {authLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label className="form-label">Enter 6-Digit OTP</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} className="search-icon" />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="123456" 
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    style={{ paddingLeft: '2.5rem', letterSpacing: '0.2em', fontWeight: 'bold', textAlign: 'center' }}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setOtpSent(false)} disabled={authLoading}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={authLoading}>
                  {authLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Filter lists based on inputs
  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.full_name || '').toLowerCase().includes(userSearch.toLowerCase()) || 
                          u.phone_number.includes(userSearch) || 
                          (u.location_name || '').toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === '' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.patient_name.toLowerCase().includes(requestSearch.toLowerCase()) || 
                          r.hospital_name.toLowerCase().includes(requestSearch.toLowerCase()) || 
                          r.location_name.toLowerCase().includes(requestSearch.toLowerCase()) ||
                          r.requester_phone.includes(requestSearch) ||
                          (r.requester_name || '').toLowerCase().includes(requestSearch.toLowerCase());
    const matchesPriority = requestPriorityFilter === '' || r.priority === requestPriorityFilter;
    return matchesSearch && matchesPriority;
  });

  const filteredStocks = stocks.filter(s => {
    const matchesSearch = s.hospital_name.toLowerCase().includes(stockSearch.toLowerCase()) || 
                          s.location_name.toLowerCase().includes(stockSearch.toLowerCase());
    const matchesGroup = stockGroupFilter === '' || s.blood_group === stockGroupFilter;
    return matchesSearch && matchesGroup;
  });

  // Total stock representation helper
  const maxStockLimit = stats?.totalStock ? Math.max(...Object.values(stats.recentRequests || {}).map(() => 50), 100) : 100;

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'error' && <ShieldAlert size={18} color="#ef4444" />}
            {toast.type === 'success' && <Check size={18} color="#22c55e" />}
            {toast.type === 'info' && <AlertCircle size={18} color="#0ea5e9" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Sidebar navigation */}
      <nav className="sidebar">
        <div className="sidebar-brand">
          <Droplet size={28} color="red" fill="red" />
          <h2>RaktConnect</h2>
        </div>

        <ul className="sidebar-menu">
          <li 
            className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Activity size={20} />
            Dashboard
          </li>
          <li 
            className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} />
            User Database
          </li>
          <li 
            className={`sidebar-item ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <Droplet size={20} />
            Blood Requests
          </li>
          <li 
            className={`sidebar-item ${activeTab === 'stocks' ? 'active' : ''}`}
            onClick={() => setActiveTab('stocks')}
          >
            <Database size={20} />
            Blood Bank Stocks
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="user-profile-bar">
            <div className="avatar">A</div>
            <div className="profile-info">
              <span className="profile-name">{currentUser?.phone_number}</span>
              <span className="profile-role">Platform Admin</span>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', display: 'flex', gap: '0.5rem' }} onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>

      {/* Main dashboard page */}
      <main className="main-content">
        
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            <div className="page-header">
              <div className="page-title">
                <h1>Dashboard Overview</h1>
                <div className="page-subtitle">Real-time statistics and activity overview</div>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={fetchStats} title="Refresh dashboard data">
                <RefreshCw size={18} />
              </button>
            </div>

            {loading && !stats ? (
              <div className="loading-view"><div className="spinner"></div>Loading statistics...</div>
            ) : stats ? (
              <>
                {/* Stats Summary Cards */}
                <div className="stats-grid">
                  <div className="stat-card glass-panel glass-panel-hover">
                    <div className="stat-info">
                      <span className="stat-label">Total Users</span>
                      <span className="stat-value">{stats.users.total}</span>
                    </div>
                    <div className="stat-icon-box icon-secondary">
                      <Users size={24} />
                    </div>
                  </div>

                  <div className="stat-card glass-panel glass-panel-hover">
                    <div className="stat-info">
                      <span className="stat-label">Active Requests</span>
                      <span className="stat-value">{stats.requests.active}</span>
                    </div>
                    <div className="stat-icon-box icon-primary">
                      <Droplet size={24} />
                    </div>
                  </div>

                  <div className="stat-card glass-panel glass-panel-hover">
                    <div className="stat-info">
                      <span className="stat-label">Registered Donors</span>
                      <span className="stat-value">{stats.users.donor}</span>
                    </div>
                    <div className="stat-icon-box icon-success">
                      <UserCheck size={24} />
                    </div>
                  </div>

                  <div className="stat-card glass-panel glass-panel-hover">
                    <div className="stat-info">
                      <span className="stat-label">Critical Emergencies</span>
                      <span className="stat-value">{stats.priorities.critical}</span>
                    </div>
                    <div className="stat-icon-box icon-warning">
                      <Flame size={24} />
                    </div>
                  </div>
                </div>

                {/* Dashboard Split Sections */}
                <div className="dashboard-grid">
                  {/* Left Column: Blood stock distribution bar chart visual */}
                  <div className="glass-panel">
                    <div className="panel-header">
                      <h3>Global Stock Volume</h3>
                      <div className="badge badge-donor">
                        {stats.totalStock} units in stock
                      </div>
                    </div>
                    <div className="stock-bars-container" style={{ marginTop: '1.5rem' }}>
                      {/* Simple hardcoded blood group stats or placeholder representation */}
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((grp, idx) => {
                        // Mock counts if stats doesn't have breakdown
                        const countMap = { 'A+': 45, 'A-': 12, 'B+': 55, 'B-': 8, 'O+': 72, 'O-': 25, 'AB+': 18, 'AB-': 5 };
                        const count = countMap[grp] || 0;
                        const pct = Math.min((count / 80) * 100, 100);
                        return (
                          <div key={grp} className="stock-bar-item">
                            <div className="stock-bar-labels">
                              <span className="stock-group-name">{grp} Blood Group</span>
                              <span className="stock-group-val">{count} Units</span>
                            </div>
                            <div className="progress-track">
                              <div 
                                className="progress-bar" 
                                style={{ 
                                  width: `${pct}%`, 
                                  background: grp.includes('-') 
                                    ? 'linear-gradient(90deg, hsl(250 84% 67%) 0%, hsl(184 80% 50%) 100%)' 
                                    : 'linear-gradient(90deg, hsl(345 88% 52%) 0%, hsl(250 84% 67%) 100%)'
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Recent activity feed */}
                  <div className="glass-panel">
                    <div className="panel-header">
                      <h3>Recent Platform Activity</h3>
                    </div>
                    <div className="activity-list" style={{ marginTop: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.85rem', color: 'hsl(var(--primary))', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Recent Registrations</h4>
                      {stats.recentUsers?.map(user => (
                        <div key={user.id} className="activity-item">
                          <Users size={16} color="#7a63f2" className="activity-icon" />
                          <div className="activity-details">
                            <div className="activity-text">
                              <strong>{user.full_name || 'Anonymous'}</strong> ({user.role}) registered
                            </div>
                            <div className="activity-time">{new Date(user.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))}

                      <h4 style={{ fontSize: '0.85rem', color: 'hsl(var(--primary))', marginTop: '1rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Recent Blood Requests</h4>
                      {stats.recentRequests?.map(req => (
                        <div key={req.id} className="activity-item">
                          <Droplet size={16} color="#eb1e51" className="activity-icon" />
                          <div className="activity-details">
                            <div className="activity-text">
                              Request for <strong>{req.patient_name}</strong> ({req.blood_group}, {req.units_required}u) at {req.hospital_name}
                            </div>
                            <div className="activity-time">{new Date(req.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-view">No dashboard stats returned.</div>
            )}
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="animate-fade-in">
            <div className="page-header">
              <div className="page-title">
                <h1>User Database</h1>
                <div className="page-subtitle">Inspect, modify, and delete user profiles</div>
              </div>
            </div>

            {/* Filter controls */}
            <div className="filters-bar">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search by name, phone, or location..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <Filter size={18} style={{ alignSelf: 'center', color: 'hsl(var(--text-muted))' }} />
                <select 
                  className="filter-select"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="donor">Donors</option>
                  <option value="recipient">Recipients</option>
                  <option value="hospital_blood_bank">Hospitals/Blood Banks</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>

            {/* User Database Table */}
            {loading && users.length === 0 ? (
              <div className="loading-view"><div className="spinner"></div>Loading users...</div>
            ) : filteredUsers.length > 0 ? (
              <div className="table-container glass-panel" style={{ padding: 0 }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Phone Number</th>
                      <th>Role</th>
                      <th>Full Name</th>
                      <th>Blood Group</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td style={{ fontWeight: 'bold' }}>{user.phone_number}</td>
                        <td>
                          <span className={`badge badge-${user.role === 'hospital_blood_bank' ? 'hospital' : user.role}`}>
                            {user.role === 'hospital_blood_bank' ? 'Hospital' : user.role}
                          </span>
                        </td>
                        <td>{user.full_name || <em style={{ color: 'hsl(var(--text-muted))' }}>Not set</em>}</td>
                        <td style={{ fontWeight: '600', color: 'hsl(var(--primary))' }}>{user.blood_group || '-'}</td>
                        <td>{user.location_name || '-'}</td>
                        <td>
                          {user.role === 'donor' ? (
                            <span className={`badge ${user.is_available ? 'badge-donor' : 'badge-priority-low'}`}>
                              {user.is_available ? 'Available' : 'Unavailable'}
                            </span>
                          ) : '-'}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn btn-secondary btn-icon" onClick={() => setEditingUser({ ...user })} title="Edit profile">
                              <Edit3 size={16} />
                            </button>
                            <button className="btn btn-danger btn-icon" onClick={() => handleUserDelete(user.id)} title="Delete user" disabled={user.id === currentUser?.id}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-view">
                <span className="empty-title">No users found matching your search.</span>
                <span>Try clearing the filters or typing a different query.</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BLOOD REQUESTS */}
        {activeTab === 'requests' && (
          <div className="animate-fade-in">
            <div className="page-header">
              <div className="page-title">
                <h1>Blood Requests</h1>
                <div className="page-subtitle">Track and manage emergency and standard requests</div>
              </div>
            </div>

            {/* Filter controls */}
            <div className="filters-bar">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search patient, hospital, location, or phone..."
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <Filter size={18} style={{ alignSelf: 'center', color: 'hsl(var(--text-muted))' }} />
                <select 
                  className="filter-select"
                  value={requestPriorityFilter}
                  onChange={(e) => setRequestPriorityFilter(e.target.value)}
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Blood Requests Table */}
            {loading && requests.length === 0 ? (
              <div className="loading-view"><div className="spinner"></div>Loading requests...</div>
            ) : filteredRequests.length > 0 ? (
              <div className="table-container glass-panel" style={{ padding: 0 }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Group</th>
                      <th>Units</th>
                      <th>Hospital</th>
                      <th>Urgency</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Date Raised</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map(req => (
                      <tr key={req.id}>
                        <td style={{ fontWeight: 'bold' }}>{req.patient_name}</td>
                        <td style={{ fontWeight: '700', color: 'hsl(var(--primary))' }}>{req.blood_group}</td>
                        <td>{req.units_required}</td>
                        <td>{req.hospital_name}</td>
                        <td>
                          {req.is_emergency ? (
                            <span className="badge badge-emergency">Emergency</span>
                          ) : (
                            <span className="badge badge-priority-low">Routine</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge badge-priority-${req.priority}`}>
                            {req.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-status-${req.status}`}>
                            {req.status}
                          </span>
                        </td>
                        <td>{new Date(req.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn btn-secondary btn-icon" onClick={() => setEditingRequest({ ...req })} title="Edit request">
                              <Edit3 size={16} />
                            </button>
                            <button className="btn btn-danger btn-icon" onClick={() => handleRequestDelete(req.id)} title="Delete request">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-view">
                <span className="empty-title">No blood requests found matching filters.</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BLOOD BANK STOCKS */}
        {activeTab === 'stocks' && (
          <div className="animate-fade-in">
            <div className="page-header">
              <div className="page-title">
                <h1>Blood Bank Stocks</h1>
                <div className="page-subtitle">Monitor and update inventory across blood banks and hospitals</div>
              </div>
            </div>

            {/* Filter controls */}
            <div className="filters-bar">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search by hospital name or location..."
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <Filter size={18} style={{ alignSelf: 'center', color: 'hsl(var(--text-muted))' }} />
                <select 
                  className="filter-select"
                  value={stockGroupFilter}
                  onChange={(e) => setStockGroupFilter(e.target.value)}
                >
                  <option value="">All Blood Groups</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            {/* Stocks Cards Grid */}
            {loading && stocks.length === 0 ? (
              <div className="loading-view"><div className="spinner"></div>Loading stock inventory...</div>
            ) : filteredStocks.length > 0 ? (
              <div className="stock-grid">
                {filteredStocks.map(stock => {
                  const isCritical = stock.units_in_stock <= 2;
                  const hasStock = stock.units_in_stock > 5;
                  
                  return (
                    <div 
                      key={stock.id} 
                      className={`glass-panel stock-card ${isCritical ? 'critical-stock' : hasStock ? 'has-stock' : ''}`}
                    >
                      <div className="stock-card-header">
                        <div>
                          <div className="hospital-title">{stock.hospital_name}</div>
                          <div className="hospital-loc">
                            <MapPin size={12} />
                            {stock.location_name}
                          </div>
                        </div>
                        <div className="blood-type-glow">{stock.blood_group}</div>
                      </div>

                      <div className="stock-count-editor">
                        {updatingStockId === stock.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                            <input 
                              type="number" 
                              className="stock-input"
                              min={0}
                              value={newStockVal}
                              onChange={(e) => setNewStockVal(e.target.value)}
                              autoFocus
                            />
                            <button className="btn btn-primary btn-icon" onClick={() => handleStockUpdate(stock)}>
                              <Check size={14} />
                            </button>
                            <button className="btn btn-secondary btn-icon" onClick={() => setUpdatingStockId(null)}>
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div>
                              <span className="stock-val-display">{stock.units_in_stock}</span>
                              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginLeft: '0.25rem' }}>Units</span>
                            </div>
                            <button className="btn btn-secondary btn-icon" onClick={() => {
                              setUpdatingStockId(stock.id);
                              setNewStockVal(stock.units_in_stock.toString());
                            }}>
                              <Edit3 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-view">
                <span className="empty-title">No stock inventory matching filters.</span>
              </div>
            )}
          </div>
        )}

      </main>

      {/* USER EDIT MODAL */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ padding: 0 }}>
            <div className="modal-header">
              <h3>Edit User Details</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setEditingUser(null)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleUserUpdateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={editingUser.full_name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  />
                </div>

                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select 
                      className="filter-select" 
                      style={{ width: '100%', padding: '0.75rem' }}
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    >
                      <option value="donor">donor</option>
                      <option value="recipient">recipient</option>
                      <option value="hospital_blood_bank">hospital_blood_bank</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select 
                      className="filter-select"
                      style={{ width: '100%', padding: '0.75rem' }}
                      value={editingUser.blood_group || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, blood_group: e.target.value })}
                    >
                      <option value="">None</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input 
                      type="number" 
                      className="form-input"
                      value={editingUser.age || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, age: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={editingUser.gender || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, gender: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Location Name</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={editingUser.location_name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, location_name: e.target.value })}
                  />
                </div>

                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Latitude</label>
                    <input 
                      type="number" 
                      step="any"
                      className="form-input"
                      value={editingUser.latitude || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, latitude: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Longitude</label>
                    <input 
                      type="number" 
                      step="any"
                      className="form-input"
                      value={editingUser.longitude || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, longitude: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Emergency Contact</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={editingUser.emergency_contact || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, emergency_contact: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '2rem', gap: '0.5rem' }}>
                    <input 
                      type="checkbox" 
                      id="avail_chk"
                      checked={!!editingUser.is_available}
                      onChange={(e) => setEditingUser({ ...editingUser, is_available: e.target.checked })}
                    />
                    <label htmlFor="avail_chk" className="form-label" style={{ margin: 0 }}>Available to Donate</label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BLOOD REQUEST EDIT MODAL */}
      {editingRequest && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ padding: 0 }}>
            <div className="modal-header">
              <h3>Edit Blood Request</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setEditingRequest(null)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleRequestUpdateSubmit}>
              <div className="modal-body">
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Patient Name</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={editingRequest.patient_name}
                      onChange={(e) => setEditingRequest({ ...editingRequest, patient_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select 
                      className="filter-select"
                      style={{ width: '100%', padding: '0.75rem' }}
                      value={editingRequest.blood_group}
                      onChange={(e) => setEditingRequest({ ...editingRequest, blood_group: e.target.value })}
                      required
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Units Required</label>
                    <input 
                      type="number" 
                      className="form-input"
                      value={editingRequest.units_required}
                      onChange={(e) => setEditingRequest({ ...editingRequest, units_required: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hospital Name</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={editingRequest.hospital_name}
                      onChange={(e) => setEditingRequest({ ...editingRequest, hospital_name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Location Name</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={editingRequest.location_name}
                    onChange={(e) => setEditingRequest({ ...editingRequest, location_name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select 
                      className="filter-select"
                      style={{ width: '100%', padding: '0.75rem' }}
                      value={editingRequest.priority}
                      onChange={(e) => setEditingRequest({ ...editingRequest, priority: e.target.value })}
                    >
                      <option value="low">low</option>
                      <option value="medium">medium</option>
                      <option value="high">high</option>
                      <option value="critical">critical</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select 
                      className="filter-select"
                      style={{ width: '100%', padding: '0.75rem' }}
                      value={editingRequest.status}
                      onChange={(e) => setEditingRequest({ ...editingRequest, status: e.target.value })}
                    >
                      <option value="active">active</option>
                      <option value="completed">completed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '1rem', gap: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    id="emergency_chk"
                    checked={!!editingRequest.is_emergency}
                    onChange={(e) => setEditingRequest({ ...editingRequest, is_emergency: e.target.checked })}
                  />
                  <label htmlFor="emergency_chk" className="form-label" style={{ margin: 0 }}>Emergency Case</label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingRequest(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
