import React, { useEffect, useState } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: '' }); // Vite proxy → /api goes to backend

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ firstName: '', lastName: '', title: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/api/employees');
      setEmployees(data);
    } catch {
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function onCreate(e) {
    e.preventDefault(); setError('');
    if (!form.firstName || !form.lastName) { setError('First and last name required'); return; }
    try {
      await api.post('/api/employees', form);
      setForm({ firstName: '', lastName: '', title: '' });
      load();
    } catch {
      setError('Save failed');
    }
  }

  function startEdit(emp) {
    setEditingId(emp.id);
    setForm({ firstName: emp.firstName || '', lastName: emp.lastName || '', title: emp.title || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function onUpdate(e) {
    e.preventDefault(); setError('');
    if (!editingId) return;
    if (!form.firstName || !form.lastName) { setError('First and last name required'); return; }
    try {
      await api.put(`/api/employees/${editingId}`, form);
      setEditingId(null);
      setForm({ firstName: '', lastName: '', title: '' });
      load();
    } catch {
      setError('Update failed');
    }
  }

  async function onDelete(id) {
    if (!confirm('Delete this employee?')) return;
    try {
      await api.delete(`/api/employees/${id}`);
      load();
    } catch {
      setError('Delete failed');
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Employee Directory</h1>
      {error && <div style={{ color: 'white', background: 'crimson', padding: 8, borderRadius: 6 }}>{error}</div>}
      <form onSubmit={editingId ? onUpdate : onCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto auto', gap: 8, marginBottom: 16 }}>
        <input name="firstName" placeholder="First name" value={form.firstName} onChange={onChange} required />
        <input name="lastName" placeholder="Last name" value={form.lastName} onChange={onChange} required />
        <input name="title" placeholder="Title (optional)" value={form.title} onChange={onChange} />
        <button type="submit">{editingId ? 'Update' : 'Add'}</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ firstName: '', lastName: '', title: '' }); }}>Cancel</button>}
      </form>

      <h2>All Employees</h2>
      {loading ? <p>Loading...</p> : (
        <table border="1" cellPadding="6" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th>ID</th><th>First</th><th>Last</th><th>Title</th><th>Actions</th></tr></thead>
          <tbody>
            {employees.map(e => (
              <tr key={e.id}>
                <td>{e.id}</td>
                <td>{e.firstName}</td>
                <td>{e.lastName}</td>
                <td>{e.title}</td>
                <td>
                  <button onClick={() => startEdit(e)}>Edit</button>{' '}
                  <button onClick={() => onDelete(e.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No employees yet</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}
