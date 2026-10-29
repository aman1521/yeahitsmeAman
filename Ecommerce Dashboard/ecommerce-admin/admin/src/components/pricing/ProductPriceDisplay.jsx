import React, { useEffect, useState } from 'react';
import RegionSelector from './RegionSelector';
import apiClient from '../../services/apiClient';

const ProductPriceDisplay = () => {
  const [country, setCountry] = useState('IN');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async (cc) => {
    setLoading(true);
    try {
      const res = await apiClient.get('/pricing/products/converted', { params: { country_code: cc, include_tax: true } });
      setData(res.data?.data?.items || []);
    } catch (e) {
      setData([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(country); }, [country]);

  return (
    <div className="card">
      <div className="card-header">
        <h3>Localized Product Prices</h3>
        <RegionSelector value={country} onChange={setCountry} />
      </div>
      <div className="card-body">
        {loading ? 'Loading...' : (
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Base Price (INR)</th>
                <th>Converted Subtotal</th>
                <th>Tax</th>
                <th>Final Price</th>
              </tr>
            </thead>
            <tbody>
              {data.map(it => (
                <tr key={it.product_id}>
                  <td>{it.name}</td>
                  <td>{it.base_price}</td>
                  <td>{it.converted_subtotal}</td>
                  <td>{it.tax_amount}</td>
                  <td>{it.final_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductPriceDisplay;


