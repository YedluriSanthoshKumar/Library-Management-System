import api from './api';

export const issueService = {
  getIssues: async (params = {}) => {
    const response = await api.get('/issues', { params });
    return response.data;
  },

  getIssueById: async (id) => {
    const response = await api.get(`/issues/${id}`);
    return response.data;
  },

  createIssue: async (issueData) => {
    const response = await api.post('/issues', issueData);
    return response.data;
  },

  returnBook: async (id) => {
    const response = await api.put(`/issues/${id}/return`);
    return response.data;
  },
};

export default issueService;
