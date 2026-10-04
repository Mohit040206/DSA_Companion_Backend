import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor — Attach token if available in localStorage
client.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('dsa_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {}
  return config;
});

// Response Interceptor — Handle 401 Unauthorized globally
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      try { localStorage.removeItem('dsa_token'); } catch (_) {}
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// ──────────────────────────────────────────────
// AUTH
// ──────────────────────────────────────────────
export const authAPI = {
  login: async (credentials) => {
    const res = await client.post('/auth/login', credentials);
    if (res.data?.token) {
      try { localStorage.setItem('dsa_token', res.data.token); } catch (_) {}
    }
    return res.data;
  },

  register: async (userData) => {
    const res = await client.post('/auth/register', userData);
    if (res.data?.token) {
      try { localStorage.setItem('dsa_token', res.data.token); } catch (_) {}
    }
    return res.data;
  },

  getProfile: async () => {
    const res = await client.get('/auth/me');
    return res.data.data || res.data.user || res.data;
  },

  logout: async () => {
    try { await client.post('/auth/logout'); } catch (_) { /* ignore */ }
    try { localStorage.removeItem('dsa_token'); } catch (_) {}
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    const res = await client.post('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  }
};

export const userAPI = {
  updateProfile: async (profileData) => {
    const res = await client.put('/user/profile', profileData);
    return res.data.data || res.data;
  }
};

// ──────────────────────────────────────────────
// PROBLEMS
// ──────────────────────────────────────────────
export const problemAPI = {
  getAll: async (params = {}) => {
    const res = await client.get('/problem', { params });
    // Backend returns { success, data: [...] }
    return Array.isArray(res.data) ? res.data : (res.data.data || res.data.problems || []);
  },

  getById: async (id) => {
    const res = await client.get(`/problem/${id}`);
    return res.data.data || res.data.problem || res.data;
  },

  create: async (problemData) => {
    const res = await client.post('/problem', problemData);
    return res.data.data || res.data;
  },

  update: async (id, updateData) => {
    const res = await client.put(`/problem/${id}`, updateData);
    return res.data.data || res.data;
  },

  delete: async (id) => {
    const res = await client.delete(`/problem/${id}`);
    return res.data;
  },

  bulkUpload: async (problemsArray) => {
    const res = await client.post('/problem/bulk', { problems: problemsArray });
    return res.data;
  },

  reseed: async () => {
    const res = await client.post('/problem/reseed');
    return res.data;
  }
};

// ──────────────────────────────────────────────
// ATTEMPTS
// ──────────────────────────────────────────────
export const attemptAPI = {
  start: async (problemId) => {
    const res = await client.post('/attempt/start', { problemId });
    return res.data.data || res.data;
  },

  submit: async (attemptId, submissionData) => {
    const res = await client.post(`/attempt/${attemptId}/submit`, submissionData);
    return res.data.data || res.data;
  },

  getById: async (attemptId) => {
    const res = await client.get(`/attempt/${attemptId}`);
    return res.data.data || res.data.attempt || res.data;
  },

  getByProblem: async (problemId) => {
    const res = await client.get(`/attempt/problem/${problemId}`);
    const d = res.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.data)) return d.data;
    if (Array.isArray(d?.data?.attempts)) return d.data.attempts;
    if (Array.isArray(d?.attempts)) return d.attempts;
    return [];
  },

  getAll: async () => {
    const res = await client.get('/attempt');
    const d = res.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.data)) return d.data;
    if (Array.isArray(d?.data?.attempts)) return d.data.attempts;
    if (Array.isArray(d?.attempts)) return d.attempts;
    return [];
  },

  resumeSession: async (attemptId) => {
    const res = await client.post(`/attempt/session/${attemptId}/resume`);
    return res.data.data || res.data;
  },

  endSession: async (attemptId) => {
    const res = await client.post(`/attempt/session/${attemptId}/end`);
    return res.data.data || res.data;
  },

  importRecords: async (recordsArray) => {
    const res = await client.post('/attempt/import', { records: recordsArray });
    return res.data;
  }
};

// ──────────────────────────────────────────────
// REVISIONS
// ──────────────────────────────────────────────
export const revisionAPI = {
  getAll: async () => {
    const res = await client.get('/revision');
    const d = res.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.data)) return d.data;
    if (Array.isArray(d?.data?.revisions)) return d.data.revisions;
    if (Array.isArray(d?.revisions)) return d.revisions;
    return [];
  },

  getById: async (revisionId) => {
    const res = await client.get(`/revision/${revisionId}`);
    return res.data.data || res.data.revision || res.data;
  },

  create: async (revisionData) => {
    const res = await client.post('/revision', revisionData);
    return res.data.data || res.data;
  },

  start: async (revisionId) => {
    const res = await client.post(`/revision/${revisionId}/start`);
    return res.data.data || res.data;
  },

  skip: async (revisionId) => {
    const res = await client.post(`/revision/${revisionId}/skip`);
    return res.data;
  }
};

// ──────────────────────────────────────────────
// PATTERNS (static – computed from problems)
// ──────────────────────────────────────────────
export const patternAPI = {
  getAll: async () => {
    try {
      const problems = await problemAPI.getAll();
      const map = {};
      problems.forEach(p => {
        (p.patterns || []).forEach(pat => {
          const key = pat.toLowerCase().replace(/\s+/g, '-');
          if (!map[key]) {
            map[key] = {
              id: key,
              name: pat,
              count: 0,
              solved: 0,
              attempted: 0,
              revisions: 0,
              avgConfidence: 4.0,
              status: 'Developing'
            };
          }
          map[key].count += 1;
          if (p.status === 'Solved') {
            map[key].solved += 1;
            map[key].attempted += 1;
          } else if (p.status === 'Needs Revision') {
            map[key].revisions += 1;
            map[key].attempted += 1;
          } else if (p.status === 'In Progress') {
            map[key].attempted += 1;
          }
        });
      });

      // Compute status for each pattern
      Object.values(map).forEach(pat => {
        const ratio = pat.count > 0 ? pat.solved / pat.count : 0;
        if (ratio >= 0.7) pat.status = 'Strong';
        else if (pat.revisions > 0) pat.status = 'Needs attention';
        else pat.status = 'Developing';
      });

      return Object.values(map);
    } catch {
      return [];
    }
  }
};

// ──────────────────────────────────────────────
// ADMIN
// ──────────────────────────────────────────────
export const adminAPI = {
  deleteProblem: async (id) => {
    const res = await client.delete(`/problem/${id}`);
    return res.data;
  },

  updateProblem: async (id, updateData) => {
    const res = await client.put(`/problem/${id}`, updateData);
    return res.data.data || res.data;
  },

  bulkUpload: async (problemsArray) => {
    const res = await client.post('/problem/bulk', { problems: problemsArray });
    return res.data;
  },

  getUsers: async (filters = {}) => {
    const res = await client.get('/user', { params: filters });
    const d = res.data;
    return Array.isArray(d) ? d : (d.data || d.users || []);
  },

  getUserById: async (id) => {
    const res = await client.get(`/user/${id}`);
    return res.data.data || res.data.user || res.data;
  },

  updateUserStatus: async (id, status) => {
    const res = await client.put(`/user/${id}/status`, { status });
    return res.data;
  }
};

// ──────────────────────────────────────────────
// AI & MEMORY ENGINE
// ──────────────────────────────────────────────
export const aiAPI = {
  saveOnboarding: async (onboardingData) => {
    const res = await client.post('/ai/onboarding', onboardingData);
    return res.data;
  },

  getRecommendations: async () => {
    const res = await client.get('/ai/recommendations');
    return res.data.data || res.data;
  },

  getMemory: async () => {
    const res = await client.get('/ai/memory');
    return res.data.data || res.data;
  },

  evaluateAttempt: async (attemptId) => {
    const res = await client.post(`/ai/evaluate-attempt/${attemptId}`);
    return res.data;
  },

  getEvaluation: async (attemptId) => {
    const res = await client.get(`/ai/evaluation/${attemptId}`);
    return res.data.data || res.data;
  },

  generateHint: async ({ problemId, code, language, hintLevel }) => {
    const res = await client.post('/ai/generate-hint', { problemId, code, language, hintLevel });
    return res.data.data || res.data;
  }
};

// ──────────────────────────────────────────────
// COMPANY PREPARATION ENGINE
// ──────────────────────────────────────────────
export const companyPrepAPI = {
  getPlan: async () => {
    const res = await client.get('/company-prep/plan');
    return res.data.data || null;
  },

  createPlan: async ({ company, role, interviewDate }) => {
    const res = await client.post('/company-prep/plan', { company, role, interviewDate });
    return res.data.data || res.data;
  },

  refreshPlan: async () => {
    const res = await client.post('/company-prep/refresh');
    return res.data.data || res.data;
  }
};

