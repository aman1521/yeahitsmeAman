import React, { useState, useEffect } from 'react';
import { 
  FiActivity, 
  FiPackage, 
  FiTruck, 
  FiGlobe, 
  FiRefreshCw,
  FiDollarSign,
  FiPercent,
  FiInfo
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const TaxCalculator = () => {
  const [countries, setCountries] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calculationType, setCalculationType] = useState('product');
  
  // Form states
  const [formData, setFormData] = useState({
    country_code: '',
    product_id: '',
    price: '',
    quantity: 1,
    shipping_cost: '',
    order_amount: ''
  });
  
  const [orderItems, setOrderItems] = useState([]);
  const [calculationResult, setCalculationResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [countriesRes, productsRes] = await Promise.all([
        axios.get('/api/countries/'),
        axios.get('/api/products')
      ]);

      setCountries(countriesRes.data.countries || []);
      setProducts(productsRes.data.products || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addOrderItem = () => {
    if (!formData.product_id || !formData.price || !formData.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const product = products.find(p => p.id === parseInt(formData.product_id));
    if (!product) {
      toast.error('Product not found');
      return;
    }

    const newItem = {
      product_id: parseInt(formData.product_id),
      product_name: product.name,
      quantity: parseInt(formData.quantity),
      unit_price: parseFloat(formData.price)
    };

    setOrderItems(prev => [...prev, newItem]);
    
    // Reset form
    setFormData(prev => ({
      ...prev,
      product_id: '',
      price: '',
      quantity: 1
    }));
  };

  const removeOrderItem = (index) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTax = async () => {
    if (!formData.country_code) {
      toast.error('Please select a country');
      return;
    }

    setLoading(true);
    try {
      let payload;
      
      if (calculationType === 'product') {
        if (!formData.product_id || !formData.price) {
          toast.error('Please fill in product details');
          return;
        }
        
        payload = {
          type: 'product',
          product_id: formData.product_id,
          price: formData.price,
          country_code: formData.country_code,
          order_amount: formData.order_amount
        };
      } else if (calculationType === 'shipping') {
        if (!formData.shipping_cost) {
          toast.error('Please enter shipping cost');
          return;
        }
        
        payload = {
          type: 'shipping',
          shipping_cost: formData.shipping_cost,
          country_code: formData.country_code,
          order_amount: formData.order_amount
        };
      } else if (calculationType === 'order') {
        if (orderItems.length === 0) {
          toast.error('Please add at least one item to the order');
          return;
        }
        
        payload = {
          type: 'order',
          items: orderItems,
          shipping_cost: formData.shipping_cost || 0,
          country_code: formData.country_code
        };
      }

      const response = await axios.post('/api/taxes/calculate', payload);
      setCalculationResult(response.data);
    } catch (error) {
      console.error('Error calculating tax:', error);
      toast.error(error.response?.data?.error || 'Failed to calculate tax');
    } finally {
      setLoading(false);
    }
  };

  const clearCalculation = () => {
    setCalculationResult(null);
    setOrderItems([]);
    setFormData({
      country_code: '',
      product_id: '',
      price: '',
      quantity: 1,
      shipping_cost: '',
      order_amount: ''
    });
  };

  const getTotalOrderAmount = () => {
    return orderItems.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tax Calculator</h1>
        <p className="text-gray-600">Test and preview tax calculations for different scenarios</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Tax Calculation Input</h2>
          
          {/* Calculation Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Calculation Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setCalculationType('product')}
                className={`p-3 rounded-lg border-2 transition-colors flex items-center justify-center space-x-2 ${
                  calculationType === 'product'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FiPackage className="w-4 h-4" />
                <span className="text-sm font-medium">Product</span>
              </button>
              <button
                onClick={() => setCalculationType('shipping')}
                className={`p-3 rounded-lg border-2 transition-colors flex items-center justify-center space-x-2 ${
                  calculationType === 'shipping'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FiTruck className="w-4 h-4" />
                <span className="text-sm font-medium">Shipping</span>
              </button>
              <button
                onClick={() => setCalculationType('order')}
                className={`p-3 rounded-lg border-2 transition-colors flex items-center justify-center space-x-2 ${
                  calculationType === 'order'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FiActivity className="w-4 h-4" />
                <span className="text-sm font-medium">Order</span>
              </button>
            </div>
          </div>

          {/* Country Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <select
              name="country_code"
              value={formData.country_code}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Country</option>
              {countries.map(country => (
                <option key={country.country_code} value={country.country_code}>
                  {country.country_name}
                </option>
              ))}
            </select>
          </div>

          {/* Product-specific inputs */}
          {calculationType === 'product' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product *
                </label>
                <select
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Shipping-specific inputs */}
          {calculationType === 'shipping' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Cost *
              </label>
              <input
                type="number"
                name="shipping_cost"
                value={formData.shipping_cost}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Order-specific inputs */}
          {calculationType === 'order' && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product
                  </label>
                  <select
                    name="product_id"
                    value={formData.product_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addOrderItem}
                className="w-full px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
              >
                Add Item
              </button>

              {/* Order Items List */}
              {orderItems.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Added Items:</h4>
                  <div className="space-y-2">
                    {orderItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{item.product_name}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            {item.quantity} × ${item.unit_price} = ${(item.quantity * item.unit_price).toFixed(2)}
                          </span>
                        </div>
                        <button
                          onClick={() => removeOrderItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-sm font-medium text-gray-900">
                    Total: ${getTotalOrderAmount().toFixed(2)}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Cost
                </label>
                <input
                  type="number"
                  name="shipping_cost"
                  value={formData.shipping_cost}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Optional Order Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Amount (for validation)
            </label>
            <input
              type="number"
              name="order_amount"
              value={formData.order_amount}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Used to validate minimum/maximum order amount requirements
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={calculateTax}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <FiActivity className="w-4 h-4" />
              <span>{loading ? 'Calculating...' : 'Calculate Tax'}</span>
            </button>
            <button
              onClick={clearCalculation}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Calculation Results</h2>
          
          {calculationResult ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Tax Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Country:</span>
                    <span className="font-medium text-blue-900">
                      {countries.find(c => c.country_code === calculationResult.country_code)?.country_name || calculationResult.country_code}
                    </span>
                  </div>
                  
                  {calculationType === 'product' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Product Price:</span>
                        <span className="font-medium text-blue-900">${calculationResult.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Tax Rate:</span>
                        <span className="font-medium text-blue-900">{calculationResult.tax_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Tax Amount:</span>
                        <span className="font-medium text-blue-900">${calculationResult.tax_amount}</span>
                      </div>
                      <div className="flex justify-between border-t border-blue-200 pt-2">
                        <span className="text-blue-700 font-semibold">Total with Tax:</span>
                        <span className="font-bold text-blue-900">${calculationResult.price_with_tax}</span>
                      </div>
                    </>
                  )}

                  {calculationType === 'shipping' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Shipping Cost:</span>
                        <span className="font-medium text-blue-900">${calculationResult.shipping_cost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Tax Rate:</span>
                        <span className="font-medium text-blue-900">{calculationResult.tax_rate}%</span>
                      </div>
                      <div className="flex justify-between border-t border-blue-200 pt-2">
                        <span className="text-blue-700 font-semibold">Tax Amount:</span>
                        <span className="font-bold text-blue-900">${calculationResult.tax_amount}</span>
                      </div>
                    </>
                  )}

                  {calculationType === 'order' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Order Amount:</span>
                        <span className="font-medium text-blue-900">${calculationResult.order_amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Product Tax:</span>
                        <span className="font-medium text-blue-900">${calculationResult.product_tax}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Shipping Tax:</span>
                        <span className="font-medium text-blue-900">${calculationResult.shipping_tax}</span>
                      </div>
                      <div className="flex justify-between border-t border-blue-200 pt-2">
                        <span className="text-blue-700 font-semibold">Total Tax:</span>
                        <span className="font-bold text-blue-900">${calculationResult.total_tax}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Detailed Breakdown for Orders */}
              {calculationType === 'order' && calculationResult.items && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Item-wise Tax Breakdown</h3>
                  <div className="space-y-3">
                    {calculationResult.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                          <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Unit Price:</span>
                            <span className="ml-2 font-medium">${item.unit_price}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Tax Rate:</span>
                            <span className="ml-2 font-medium">{item.tax_rate}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Tax Amount:</span>
                            <span className="ml-2 font-medium">${item.tax_amount}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Total with Tax:</span>
                            <span className="ml-2 font-medium">${item.total_with_tax}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tax Rule Information */}
              {calculationResult.tax_rule && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Applied Tax Rule</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rule Name:</span>
                      <span className="font-medium">{calculationResult.tax_rule.rule_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Calculation Type:</span>
                      <span className="font-medium">{calculationResult.tax_rule.tax_calculation_type}</span>
                    </div>
                    {calculationResult.tax_rule.description && (
                      <div className="mt-2">
                        <span className="text-gray-600">Description:</span>
                        <p className="text-gray-900 mt-1">{calculationResult.tax_rule.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiActivity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No calculation yet</h3>
              <p className="text-gray-600">Fill in the details and click "Calculate Tax" to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxCalculator;
