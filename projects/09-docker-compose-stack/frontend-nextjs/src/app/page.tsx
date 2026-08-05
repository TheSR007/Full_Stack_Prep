'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface Job {
  id: string;
  title: string;
  task_type: string;
  status: string;
}

interface SystemHealth {
  status: string;
  service: string;
  api_go_user?: string;
  api_fastapi_worker?: string;
}

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // New user form state
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('USER');

  // New job form state
  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState('DATA_PROCESSING');

  // Relative routing via Nginx reverse proxy (default) or environment override
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Health check via Nginx proxied API Gateway endpoint
      const resHealth = await fetch(`${API_BASE}/api/v1/healthz`).catch(() => null);
      if (resHealth && resHealth.ok) {
        setHealth(await resHealth.json());
      } else {
        setHealth({ status: 'offline', service: 'api-gateway' });
      }

      // Fetch users via Nginx proxied Go User Service endpoint
      const resUsers = await fetch(`${API_BASE}/api/v1/users`).catch(() => null);
      if (resUsers && resUsers.ok) {
        setUsers(await resUsers.json());
      } else {
        setUsers([{ id: 1, username: 'admin', email: 'admin@example.com', role: 'ADMIN' }]);
      }

      // Fetch jobs via Nginx proxied FastAPI Worker Service endpoint
      const resJobs = await fetch(`${API_BASE}/api/v1/jobs`).catch(() => null);
      if (resJobs && resJobs.ok) {
        const data = await resJobs.json();
        setJobs(data.jobs || []);
      } else {
        setJobs([{ id: 'job_101', title: 'System Telemetry Sync', task_type: 'TELEMETRY', status: 'COMPLETED' }]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newEmail) return;

    try {
      const res = await fetch(`${API_BASE}/api/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, email: newEmail, role: newRole }),
      });
      if (res.ok) {
        setNewUsername('');
        setNewEmail('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to create user:', err);
    }
  };

  const handleDispatchJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle) return;

    try {
      const res = await fetch(`${API_BASE}/api/v1/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: jobTitle, task_type: jobType }),
      });
      if (res.ok) {
        setJobTitle('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to dispatch job:', err);
    }
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 700, color: '#38bdf8' }}>Fullstack Microservices Dashboard (Live)</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8' }}>10-Tier Containerized Docker Stack (Nginx Edge Proxy &rarr; Go Fiber + FastAPI + PostgreSQL + MongoDB + Redis)</p>
        </div>
        <button
          onClick={fetchData}
          style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 600 }}
        >
          {loading ? 'Refreshing...' : 'Refresh Stack'}
        </button>
      </header>

      {/* Health telemetry banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#1e293b', padding: '1.25rem', borderRadius: '0.5rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Nginx &rarr; API Gateway</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem', color: health?.status === 'ok' ? '#34d399' : '#f87171' }}>
            {health?.status === 'ok' ? 'HEALTHY (/api/v1/healthz)' : 'UNREACHABLE'}
          </div>
        </div>

        <div style={{ background: '#1e293b', padding: '1.25rem', borderRadius: '0.5rem', borderLeft: '4px solid #6366f1' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Go User Service (PostgreSQL & Redis)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem', color: health?.api_go_user === 'healthy' ? '#818cf8' : '#f87171' }}>
            {health?.api_go_user === 'healthy' ? 'CONNECTED (8081)' : 'STANDALONE'}
          </div>
        </div>

        <div style={{ background: '#1e293b', padding: '1.25rem', borderRadius: '0.5rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>FastAPI Worker (MongoDB & Redis)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem', color: health?.api_fastapi_worker === 'healthy' ? '#fbbf24' : '#f87171' }}>
            {health?.api_fastapi_worker === 'healthy' ? 'CONNECTED (8000)' : 'STANDALONE'}
          </div>
        </div>
      </div>

      {/* Main Grid: User Service & Worker Service */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* User Service Section */}
        <section style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.25rem', color: '#818cf8' }}>Go User Microservice (Postgres DB)</h2>

          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              style={{ padding: '0.5rem', background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '0.375rem' }}
              required
            />
            <input
              type="email"
              placeholder="User Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              style={{ padding: '0.5rem', background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '0.375rem' }}
              required
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              style={{ padding: '0.5rem', background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '0.375rem' }}
            >
              <option value="USER">Role: USER</option>
              <option value="ADMIN">Role: ADMIN</option>
            </select>
            <button type="submit" style={{ padding: '0.5rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 600 }}>
              + Create User Record
            </button>
          </form>

          <h3 style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>Registered Users ({users.length})</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {users.map((u) => (
              <li key={u.id} style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{u.username}</strong> <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>({u.email})</span>
                </div>
                <span style={{ padding: '0.1rem 0.5rem', background: u.role === 'ADMIN' ? '#4338ca' : '#334155', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                  {u.role}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Worker Service Section */}
        <section style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.25rem', color: '#fbbf24' }}>FastAPI Async Worker (MongoDB & Redis)</h2>

          <form onSubmit={handleDispatchJob} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="Background Job Title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              style={{ padding: '0.5rem', background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '0.375rem' }}
              required
            />
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              style={{ padding: '0.5rem', background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '0.375rem' }}
            >
              <option value="DATA_PROCESSING">Type: DATA_PROCESSING</option>
              <option value="IMAGE_OPTIMIZATION">Type: IMAGE_OPTIMIZATION</option>
              <option value="TELEMETRY_EXPORT">Type: TELEMETRY_EXPORT</option>
            </select>
            <button type="submit" style={{ padding: '0.5rem', background: '#d97706', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 600 }}>
              ⚡ Dispatch Worker Job
            </button>
          </form>

          <h3 style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>Async Jobs Queue ({jobs.length})</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {jobs.map((j) => (
              <li key={j.id} style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{j.title}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Task: {j.task_type}</div>
                </div>
                <span style={{ padding: '0.1rem 0.5rem', background: j.status === 'COMPLETED' ? '#065f46' : '#92400e', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                  {j.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
