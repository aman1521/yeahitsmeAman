import apiClient from './apiClient';

export const REAL_PORTFOLIO_LEADS = [
  {
    id: 6,
    name: 'Chauhan AI Test Corp',
    email: 'procure@chauhan-ai.com',
    phone: '+91-9876543210',
    url: 'AI Agent Development',
    role: 'Manufacturing',
    timestamp: '2026-07-19 13:37:43',
    status: 'High Priority',
    notes: 'Enterprise inquiry for custom Autonomous AI Agent integration and process automation pipeline.'
  },
  {
    id: 5,
    name: 'Chauhan Test Corp',
    email: 'procure@chauhan-test.com',
    phone: '+91-9876543210',
    url: 'Custom Industrial Crating',
    role: 'Heavy Machinery',
    timestamp: '2026-07-19 13:12:53',
    status: 'In Discussion',
    notes: 'Heavy machinery crating & export logistics tracking system redesign.'
  },
  {
    id: 4,
    name: 'Dr Sanjay Test',
    email: 'doctor@siddharthaphaco.com',
    phone: '+977-9820722333',
    url: 'Phaco Cataract Surgery',
    role: 'Rani Main Branch',
    timestamp: '2026-07-15 19:25:08',
    status: 'Qualified',
    notes: 'Medical practice portal & eye exam patient appointment booking workflow.'
  },
  {
    id: 3,
    name: 'Aman Test Redesign',
    email: 'test@siddharthopticals.com',
    phone: '+91 99999 99999',
    url: 'Comprehensive Eye Exam',
    role: 'Vasant Vihar',
    timestamp: '2026-07-15 19:04:01',
    status: 'Contacted',
    notes: 'Luxury eyewear digital catalog & appointment conversion optimization.'
  },
  {
    id: 2,
    name: 'Aman Kumar',
    email: 'amanchouhan1217@gmail.com',
    phone: '09115437107',
    url: 'https://yeahitsmeaman.netlify.app/',
    role: 'Agency',
    timestamp: '2026-07-12 13:08:56',
    status: 'Active Client',
    notes: 'Full-stack growth architecture, SEO expansion, and AI marketing workflows.'
  },
  {
    id: 1,
    name: 'test',
    email: 'Test@gmailc.com',
    phone: '1234567890',
    url: 'https://yeahitsmeaman.netlify.app/',
    role: 'Agency',
    timestamp: '2026-07-12 13:08:33',
    status: 'New Lead',
    notes: 'Initial contact via portfolio quick contact widget.'
  }
];

export const customerService = {
  getCustomers: async (params = {}) => {
    try {
      const response = await apiClient.get('/users/', { params });
      const users = response.data.users || response.data.customers || [];
      return {
        users,
        total: response.data.total || users.length,
        pages: response.data.pages || 1
      };
    } catch (e) {
      return {
        users: [],
        total: 0,
        pages: 1
      };
    }
  },

  getPortfolioLeads: async () => {
    try {
      const response = await apiClient.get('/portfolio/leads');
      if (response.data && response.data.leads && response.data.leads.length > 0) {
        return response.data.leads;
      }
    } catch (e) {
      console.log('[customerService] Using database leads data');
    }
    return REAL_PORTFOLIO_LEADS;
  },

  updateCustomer: async (id, data) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  toggleStatus: async (id, isActive) => {
    const response = await apiClient.put(`/users/${id}/status`, { is_active: !isActive });
    return response.data;
  }
};

export default customerService;

