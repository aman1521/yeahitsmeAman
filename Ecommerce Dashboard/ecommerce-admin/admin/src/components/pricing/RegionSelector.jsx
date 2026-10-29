import React from 'react';

const regions = [
  { code: 'US', currency: 'USD', name: 'USA' },
  { code: 'GB', currency: 'GBP', name: 'UK' },
  { code: 'IN', currency: 'INR', name: 'India' },
  { code: 'CA', currency: 'CAD', name: 'Canada' },
  { code: 'AU', currency: 'AUD', name: 'Australia' },
  { code: 'AE', currency: 'AED', name: 'UAE' },
  { code: 'SG', currency: 'SGD', name: 'Singapore' },
];

const RegionSelector = ({ value, onChange }) => {
  return (
    <select
      className="form-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {regions.map((r) => (
        <option key={r.code} value={r.code}>
          {r.name} ({r.currency})
        </option>
      ))}
    </select>
  );
};

export default RegionSelector;


