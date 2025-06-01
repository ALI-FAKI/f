import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [status, setStatus] = useState('Present');
  const [report, setReport] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Fetch users, attendance records, and report
  useEffect(() => {
    if (isLoggedIn) {
      axios.get(`${API_URL}/users`, { withCredentials: true }).then(res => setUsers(res.data));
      axios.get(`${API_URL}/attendance`, { withCredentials: true }).then(res => setAttendance(res.data));
      axios.get(`${API_URL}/attendance/report`, { withCredentials: true }).then(res => setReport(res.data));
    }
  }, [isLoggedIn]);

  // Registration
  const handleRegister = () => {
    setAuthError('');
    axios.post(`${API_URL}/register`, {
      name: authName,
      role: authRole,
      password: authPassword
    }, { withCredentials: true })
      .then(() => {
        setAuthMode('login');
        setAuthError('Registration successful! Please log in.');
      })
      .catch(err => setAuthError(err.response?.data?.error || 'Registration failed'));
  };

  // Login
  const handleLogin = () => {
    setAuthError('');
    axios.post(`${API_URL}/login`, {
      name: authName,
      password: authPassword
    }, { withCredentials: true })
      .then(() => {
        setIsLoggedIn(true);
        setAuthError('');
      })
      .catch(err => setAuthError(err.response?.data?.error || 'Login failed'));
  };

  // Logout
  const handleLogout = () => {
    axios.post(`${API_URL}/logout`, {}, { withCredentials: true }).then(() => {
      setIsLoggedIn(false);
      setAuthName('');
      setAuthPassword('');
      setAuthRole('');
      setAuthError('');
    });
  };

  // Add user (admin only, optional)
  const handleAddUser = () => {
    if (!name || !role) return;
    axios.post(`${API_URL}/users`, { name, role }, { withCredentials: true }).then(res => {
      setUsers([...users, res.data]);
      setName('');
      setRole('');
      axios.get(`${API_URL}/attendance/report`, { withCredentials: true }).then(res => setReport(res.data));
    });
  };

  // Mark attendance
  const handleMarkAttendance = () => {
    if (!selectedUser) return;
    axios.post(`${API_URL}/attendance`, {
      user_id: selectedUser,
      date: new Date().toISOString().slice(0, 10),
      status
    }, { withCredentials: true }).then(res => {
      setAttendance([...attendance, { ...res.data, name: users.find(u => u.id === Number(selectedUser)).name }]);
      setSelectedUser('');
      setStatus('Present');
      axios.get(`${API_URL}/attendance/report`, { withCredentials: true }).then(res => setReport(res.data));
    });
  };

  // Auth forms
  if (!isLoggedIn) {
    return (
      <div className="container">
        <h2>{authMode === 'login' ? 'Login' : 'Register'}</h2>
        <input
          placeholder="Name"
          value={authName}
          onChange={e => setAuthName(e.target.value)}
        />
        {authMode === 'register' && (
          <input
            placeholder="Role"
            value={authRole}
            onChange={e => setAuthRole(e.target.value)}
          />
        )}
        <input
          placeholder="Password"
          type="password"
          value={authPassword}
          onChange={e => setAuthPassword(e.target.value)}
        />
        <button onClick={authMode === 'login' ? handleLogin : handleRegister}>
          {authMode === 'login' ? 'Login' : 'Register'}
        </button>
        <button onClick={() => {
          setAuthMode(authMode === 'login' ? 'register' : 'login');
          setAuthError('');
        }}>
          {authMode === 'login' ? 'Create Account' : 'Back to Login'}
        </button>
        {authError && <div style={{ color: 'red', marginTop: 10 }}>{authError}</div>}
      </div>
    );
  }

  // Main app after login
  return (
    <div className="container">
      <button style={{ float: 'right' }} onClick={handleLogout}>Logout</button>
      <h2>Add User</h2>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Role" value={role} onChange={e => setRole(e.target.value)} />
      <button onClick={handleAddUser}>Add</button>

      <h2>Mark Attendance</h2>
      <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
        <option value="">Select User</option>
        {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
      </select>
      <select value={status} onChange={e => setStatus(e.target.value)}>
        <option value="Present">Present</option>
        <option value="Absent">Absent</option>
        <option value="Late">Late</option>
      </select>
      <button onClick={handleMarkAttendance}>Mark</button>

      <h2>Attendance Records</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((a, i) => (
            <tr key={i}>
              <td>{a.name}</td>
              <td>{a.date}</td>
              <td>{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Attendance Summary Report</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Late</th>
          </tr>
        </thead>
        <tbody>
          {report.map((r, i) => (
            <tr key={i}>
              <td>{r.name}</td>
              <td>{r.role}</td>
              <td>{r.present}</td>
              <td>{r.absent}</td>
              <td>{r.late}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;