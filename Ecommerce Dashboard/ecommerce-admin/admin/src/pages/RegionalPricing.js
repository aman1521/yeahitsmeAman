import React, { useState } from 'react';
import CurrencyRateTable from '../components/pricing/CurrencyRateTable';
import TaxRateTable from '../components/pricing/TaxRateTable';
import AuditLogModal from '../components/pricing/AuditLogModal';
import ProductPriceDisplay from '../components/pricing/ProductPriceDisplay';

const RegionalPricing = () => {
  const [showAudit, setShowAudit] = useState(false);
  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Regional Pricing & Taxes</h2>
        <div>
          <button className="btn btn-secondary" onClick={() => setShowAudit(true)}>View Audit Logs</button>
        </div>
      </div>
      <div className="grid grid-2">
        <div>
          <CurrencyRateTable />
        </div>
        <div>
          <TaxRateTable />
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <ProductPriceDisplay />
      </div>
      {showAudit && <AuditLogModal onClose={() => setShowAudit(false)} />}
    </div>
  );
};

export default RegionalPricing;


