import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { productService } from '../services/productService';

export const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [params, setParams] = useState(initialParams);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts(params);
      setProducts(data.products);
      setTotalPages(data.pages);
      setTotalCount(data.total);
    } catch (err) {
      console.error('[useProducts] Error loading products:', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [params]);

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await productService.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('[useProducts] Error loading categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const deleteProduct = async (id) => {
    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product removed successfully');
      return true;
    } catch (err) {
      toast.error('Failed to delete product');
      return false;
    }
  };

  return {
    products,
    categories,
    loading,
    totalPages,
    totalCount,
    params,
    setParams,
    refetch: fetchProducts,
    deleteProduct
  };
};

export default useProducts;

