import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../services/orderService';

export const useOrders = (initialParams = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [params, setParams] = useState(initialParams);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrders(params);
      setOrders(data.orders);
      setTotalPages(data.pages);
      setTotalCount(data.total);
    } catch (err) {
      console.error('[useOrders] Error loading orders:', err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (id, status) => {
    try {
      await orderService.updateOrderStatus(id, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
      toast.success('Order status updated');
      return true;
    } catch (err) {
      toast.error('Failed to update order status');
      return false;
    }
  };

  return {
    orders,
    loading,
    totalPages,
    totalCount,
    params,
    setParams,
    refetch: fetchOrders,
    updateStatus
  };
};

export default useOrders;

