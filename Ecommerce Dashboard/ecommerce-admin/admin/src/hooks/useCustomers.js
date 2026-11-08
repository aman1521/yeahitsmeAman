import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { customerService } from '../services/customerService';

export const useCustomers = (initialParams = {}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'customers', 'leads'
  const [params, setParams] = useState(initialParams);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await customerService.getCustomers(params);
      setUsers(data.users);
      setTotalPages(data.pages);
      setTotalCount(data.total);
    } catch (err) {
      console.error('[useCustomers] Error fetching customers:', err);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleStatus = async (id, currentActive) => {
    try {
      await customerService.toggleStatus(id, currentActive);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, is_active: !currentActive } : u))
      );
      toast.success(currentActive ? 'Customer blocked' : 'Customer activated');
      return true;
    } catch {
      toast.error('Failed to update status');
      return false;
    }
  };

  const filteredUsers = users.filter((u) => {
    if (activeTab === 'leads') return u.type === 'Portfolio Inquiry' || u.role === 'lead';
    if (activeTab === 'customers') return u.type !== 'Portfolio Inquiry' && u.role !== 'lead';
    return true;
  });

  return {
    users: filteredUsers,
    allUsers: users,
    loading,
    totalPages,
    totalCount,
    activeTab,
    setActiveTab,
    params,
    setParams,
    refetch: fetchUsers,
    toggleStatus
  };
};

export default useCustomers;

