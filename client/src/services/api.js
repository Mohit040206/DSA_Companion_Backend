import axios from 'axios';
import {
  INITIAL_USER,
  INITIAL_PROBLEMS,
  INITIAL_ATTEMPTS,
  INITIAL_REVISIONS,
  INITIAL_PATTERNS,
  getStoredData,
  setStoredData
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('dsa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* Helper for stub state */
function getLocalProblems() { return getStoredData('problems', INITIAL_PROBLEMS); }
function saveLocalProblems(list) { setStoredData('problems', list); }

function getLocalAttempts() { return getStoredData('attempts', INITIAL_ATTEMPTS); }
function saveLocalAttempts(list) { setStoredData('attempts', list); }

function getLocalRevisions() { return getStoredData('revisions', INITIAL_REVISIONS); }
function saveLocalRevisions(list) { setStoredData('revisions', list); }

function getLocalUser() { return getStoredData('user', INITIAL_USER); }
function saveLocalUser(u) { setStoredData('user', u); }

export const authAPI = {
  login: async (credentials) => {
    try {
      const res = await client.post('/auth/login', credentials);
      if (res.data && res.data.token) {
        localStorage.setItem('dsa_token', res.data.token);
      }
      return res.data;
    } catch (err) {
      console.warn('Backend login unavailable or failed, using stub mode fallback.', err?.response?.data || err.message);
      // Stub fallback
      const mockUser = getLocalUser();
      const token = 'stub_jwt_token_' + Date.now();
      localStorage.setItem('dsa_token', token);
      return { success: true, user: mockUser, token };
    }
  },

  register: async (userData) => {
    try {
      const res = await client.post('/auth/register', userData);
      if (res.data && res.data.token) {
        localStorage.setItem('dsa_token', res.data.token);
      }
      return res.data;
    } catch (err) {
      console.warn('Backend register unavailable, using stub fallback.');
      const newUser = {
        ...INITIAL_USER,
        name: userData.name || userData.username || 'Developer',
        email: userData.email,
        role: userData.role || 'Software Engineer'
      };
      saveLocalUser(newUser);
      const token = 'stub_jwt_token_' + Date.now();
      localStorage.setItem('dsa_token', token);
      return { success: true, user: newUser, token };
    }
  },

  getProfile: async () => {
    try {
      const res = await client.get('/auth/me');
      return res.data.user || res.data;
    } catch (err) {
      return getLocalUser();
    }
  },

  logout: async () => {
    try {
      await client.post('/auth/logout');
    } catch (err) {
      // ignore
    }
    localStorage.removeItem('dsa_token');
  }
};

export const problemAPI = {
  getAll: async () => {
    try {
      const res = await client.get('/problem');
      return res.data.problems || res.data;
    } catch (err) {
      return getLocalProblems();
    }
  },

  getById: async (id) => {
    try {
      const res = await client.get(`/problem/${id}`);
      return res.data.problem || res.data;
    } catch (err) {
      const list = getLocalProblems();
      return list.find(p => p.id === id || p._id === id) || list[0];
    }
  },

  create: async (problemData) => {
    try {
      const res = await client.post('/problem', problemData);
      return res.data;
    } catch (err) {
      const list = getLocalProblems();
      const newProb = {
        id: 'p-' + Date.now(),
        ...problemData,
        status: 'Not Attempted',
        lastConfidence: null
      };
      saveLocalProblems([newProb, ...list]);
      return newProb;
    }
  }
};

export const attemptAPI = {
  start: async (problemId) => {
    try {
      const res = await client.post('/attempt/start', { problemId });
      return res.data;
    } catch (err) {
      const attempts = getLocalAttempts();
      const problems = getLocalProblems();
      const prob = problems.find(p => p.id === problemId || p._id === problemId);
      const newAttempt = {
        id: 'a-' + Date.now(),
        problemId: problemId,
        attemptNumber: (attempts.filter(a => a.problemId === problemId).length || 0) + 1,
        date: new Date().toISOString().split('T')[0],
        when: 'Just now',
        outcome: 'In Progress',
        hints: 0,
        confidence: null,
        durationMin: 0,
        language: 'JavaScript',
        approach: '',
        startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      saveLocalAttempts([newAttempt, ...attempts]);
      return newAttempt;
    }
  },

  submit: async (attemptId, submissionData) => {
    try {
      const res = await client.post(`/attempt/${attemptId}/submit`, submissionData);
      return res.data;
    } catch (err) {
      const attempts = getLocalAttempts();
      const updated = attempts.map(a => {
        if (a.id === attemptId || a._id === attemptId) {
          return {
            ...a,
            ...submissionData,
            outcome: submissionData.outcome || 'Solved',
            completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return a;
      });
      saveLocalAttempts(updated);
      return updated.find(a => a.id === attemptId);
    }
  },

  getById: async (attemptId) => {
    try {
      const res = await client.get(`/attempt/${attemptId}`);
      return res.data.attempt || res.data;
    } catch (err) {
      const attempts = getLocalAttempts();
      return attempts.find(a => a.id === attemptId || a._id === attemptId) || attempts[0];
    }
  },

  getByProblem: async (problemId) => {
    try {
      const res = await client.get(`/attempt/problem/${problemId}`);
      return res.data.attempts || res.data;
    } catch (err) {
      const attempts = getLocalAttempts();
      return attempts.filter(a => a.problemId === problemId || a.problem === problemId);
    }
  },

  getAll: async () => {
    try {
      const res = await client.get('/attempt');
      return res.data.attempts || res.data;
    } catch (err) {
      return getLocalAttempts();
    }
  }
};

export const revisionAPI = {
  getAll: async () => {
    try {
      const res = await client.get('/revision');
      return res.data.revisions || res.data;
    } catch (err) {
      return getLocalRevisions();
    }
  },

  getById: async (revisionId) => {
    try {
      const res = await client.get(`/revision/${revisionId}`);
      return res.data.revision || res.data;
    } catch (err) {
      const list = getLocalRevisions();
      return list.find(r => r.id === revisionId || r._id === revisionId) || list[0];
    }
  },

  create: async (revisionData) => {
    try {
      const res = await client.post('/revision', revisionData);
      return res.data;
    } catch (err) {
      const list = getLocalRevisions();
      const newRev = {
        id: 'r-' + Date.now(),
        status: 'today',
        scheduledFor: new Date().toISOString().split('T')[0],
        overdueByDays: 0,
        ...revisionData
      };
      saveLocalRevisions([newRev, ...list]);
      return newRev;
    }
  },

  start: async (revisionId) => {
    try {
      const res = await client.post(`/revision/${revisionId}/start`);
      return res.data;
    } catch (err) {
      const list = getLocalRevisions();
      return list.find(r => r.id === revisionId || r._id === revisionId);
    }
  },

  skip: async (revisionId) => {
    try {
      const res = await client.post(`/revision/${revisionId}/skip`);
      return res.data;
    } catch (err) {
      const list = getLocalRevisions();
      const filtered = list.filter(r => r.id !== revisionId && r._id !== revisionId);
      saveLocalRevisions(filtered);
      return { success: true };
    }
  }
};

export const patternAPI = {
  getAll: async () => {
    return INITIAL_PATTERNS;
  }
};
