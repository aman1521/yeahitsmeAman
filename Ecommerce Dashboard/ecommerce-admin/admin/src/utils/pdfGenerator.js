import jsPDF from 'jspdf';

const getCurrencySymbol = (code = 'INR') => {
  const symbols = {
    INR: 'Rs. ',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'د.إ',
    AUD: 'A$',
    CAD: 'C$',
    SGD: 'S$'
  };
  return symbols[code] || code;
};

const toNumber = (value) => {
  const num = Number(value);
  if (Number.isFinite(num)) return Number(num.toFixed(2));
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? Number(parsed.toFixed(2)) : 0;
};

export const generateInvoicePDF = (invoice, orderItems = [], options = {}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const baseCurrency = options.baseCurrency || 'INR';
  const invoiceCurrency = invoice.currency || baseCurrency;
  const currencyCode = options.currencyCode || invoiceCurrency || baseCurrency;
  const currencySymbol = options.currencySymbol || getCurrencySymbol(currencyCode);
  
  // Helper function to parse address
  const parseAddress = (address) => {
    if (!address) return null;
    if (typeof address === 'object') return address;
    try {
      return JSON.parse(address);
    } catch {
      return { full: address };
    }
  };

  // Format numbers as plain strings - avoid any encoding issues with jsPDF
  // Use simple currency symbol that jsPDF can handle (₹ causes corruption, use "Rs. " instead)
  const safeCurrencySymbol = currencySymbol === '₹' ? 'Rs. ' : currencySymbol;
  
  const formatNumberForPDF = (num) => {
    const n = parseFloat(num) || 0;
    const abs = Math.abs(n);
    const fixed = abs.toFixed(2);
    const parts = fixed.split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const decPart = parts[1] || '00';
    return (n < 0 ? '-' : '') + intPart + '.' + decPart;
  };
  
  const formatCurrency = (amount) => {
    return safeCurrencySymbol + formatNumberForPDF(amount);
  };

  // Company/Business Information
  const companyName = 'Peenakaa';
  const companyAddress = {
    street: '123 Commercial Avenue, Cyber City',
    city: 'Mumbai',
    state: 'Maharashtra',
    postal_code: '400069',
    country: 'India'
  };
  const companyPhone = '+91 (22) 4567-8900';
  const companyEmail = 'orders@peenakaa.com';
  const companyWebsite = 'www.peenakaa.com';
  const companyGSTIN = '27AAAAA0000A1Z5';
  const companyCIN = 'U74999MH2020PTC123456';  // Corporate Identification Number

  // Header Section - Brand accent background
  doc.setFillColor(255, 140, 0); // Orange color for Peenakaa brand
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Company Logo Area (Left side of header)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, margin, 28);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Your Trusted Health & Wellness Partner', margin, 36);
  
  // Invoice Details - Right side of header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - margin - 40, 20);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${invoice.invoice_number || 'N/A'}`, pageWidth - margin - 40, 27);
  doc.text(`Date: ${invoice.created_at ? new Date(invoice.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}`, pageWidth - margin - 40, 33);
  doc.text(`Order #: ${invoice.order_number || 'N/A'}`, pageWidth - margin - 40, 38);
  
  // Company Details Section
  let yPos = 55;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${companyAddress.street}`, margin, yPos);
  yPos += 5;
  doc.text(`${companyAddress.city}, ${companyAddress.state} ${companyAddress.postal_code}`, margin, yPos);
  yPos += 5;
  doc.text(`Phone: ${companyPhone} | Email: ${companyEmail}`, margin, yPos);
  yPos += 5;
  doc.text(`${companyWebsite} | ${companyGSTIN}`, margin, yPos);
  
  // Customer Information - Two columns starting at yPos + 15
  yPos += 15;
  
  // Bill To section (Left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('Bill To:', margin, yPos);
  
  let billingYPos = yPos + 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  const customerName = invoice.customer_name || invoice.user?.full_name || 'N/A';
  const customerEmail = invoice.customer_email || invoice.user?.email || 'N/A';
  const customerPhone = invoice.customer_phone || invoice.user?.phone || '';
  
  doc.text(customerName, margin, billingYPos);
  billingYPos += 5;
  doc.text(customerEmail, margin, billingYPos);
  billingYPos += 5;
  
  if (customerPhone) {
    doc.text(`Phone: ${customerPhone}`, margin, billingYPos);
    billingYPos += 5;
  }
  
  const billingAddress = parseAddress(invoice.billing_address);
  if (billingAddress) {
    if (billingAddress.full) {
      const lines = doc.splitTextToSize(billingAddress.full, 80);
      lines.forEach(line => {
        doc.text(line, margin, billingYPos);
        billingYPos += 5;
      });
    } else {
      if (billingAddress.street) {
        doc.text(billingAddress.street, margin, billingYPos);
        billingYPos += 5;
      }
      if (billingAddress.city) {
        const cityLine = `${billingAddress.city}${billingAddress.state ? ', ' + billingAddress.state : ''}${billingAddress.postal_code ? ' ' + billingAddress.postal_code : ''}`;
        doc.text(cityLine, margin, billingYPos);
        billingYPos += 5;
      }
      if (billingAddress.country) {
        doc.text(billingAddress.country, margin, billingYPos);
        billingYPos += 5;
      }
    }
  }
  
  // Shipped To section (Right column)
  const shippedXPos = 110;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Shipped To:', shippedXPos, yPos);
  
  let shippingYPos = yPos + 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(customerName, shippedXPos, shippingYPos);
  shippingYPos += 5;
  
  const shippingAddress = parseAddress(invoice.shipping_address);
  if (shippingAddress) {
    if (shippingAddress.full) {
      const lines = doc.splitTextToSize(shippingAddress.full, 80);
      lines.forEach(line => {
        doc.text(line, shippedXPos, shippingYPos);
        shippingYPos += 5;
      });
    } else {
      if (shippingAddress.street) {
        doc.text(shippingAddress.street, shippedXPos, shippingYPos);
        shippingYPos += 5;
      }
      if (shippingAddress.city) {
        const cityLine = `${shippingAddress.city}${shippingAddress.state ? ', ' + shippingAddress.state : ''}${shippingAddress.postal_code ? ' ' + shippingAddress.postal_code : ''}`;
        doc.text(cityLine, shippedXPos, shippingYPos);
        shippingYPos += 5;
      }
      if (shippingAddress.country) {
        doc.text(shippingAddress.country, shippedXPos, shippingYPos);
        shippingYPos += 5;
      }
    }
  } else {
    doc.text('Same as billing address', shippedXPos, shippingYPos);
    shippingYPos += 5;
  }
  
  // Order Information Section (Payment Method, Status, etc.)
  let infoYPos = Math.max(billingYPos, shippingYPos) + 10;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  
  const paymentMethod = invoice.payment_method || 'Not specified';
  const orderStatus = invoice.status ? invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) : 'N/A';
  const paymentStatus = invoice.payment_status ? invoice.payment_status.charAt(0).toUpperCase() + invoice.payment_status.slice(1) : 'N/A';
  
  doc.text(`Payment Method: ${paymentMethod}`, margin, infoYPos);
  doc.text(`Order Status: ${orderStatus}`, margin + 65, infoYPos);
  doc.text(`Payment Status: ${paymentStatus}`, margin + 125, infoYPos);
  
  if (invoice.coupon_code) {
    infoYPos += 5;
    doc.text(`Coupon Code: ${invoice.coupon_code}`, margin, infoYPos);
  }
  
  // Products Table - Start below info section
  const tableStartY = infoYPos + 10;
  yPos = tableStartY;
  
  // Table Header with background
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, yPos, pageWidth - (margin * 2), 8, 'F');
  
  // Draw border around header
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPos, pageWidth - (margin * 2), 8);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  const columnX = {
    name: margin + 2,
    qty: 110,
    unitPrice: 140,
    tax: 165,
    subtotal: pageWidth - margin - 5
  };

  doc.text('Product Name', columnX.name, yPos + 6);
  doc.text('Qty', columnX.qty, yPos + 6, { align: 'right' });
  doc.text('Unit Price', columnX.unitPrice, yPos + 6, { align: 'right' });
  doc.text('Tax', columnX.tax, yPos + 6, { align: 'right' });
  doc.text('Subtotal', columnX.subtotal, yPos + 6, { align: 'right' });
  
  yPos += 11;
  
  // Calculate all totals FIRST (needed for item-level tax calculation)
  let subtotal = toNumber(invoice.subtotal || 0);
  let totalTax = toNumber(invoice.tax_amount || 0);
  
  // Calculate subtotal from items (needed for proportional tax calculation)
  const calculatedSubtotalForItems = orderItems.length > 0 ? 
    orderItems.reduce((sum, item) => {
      const unitPrice = toNumber(item.unit_price || item.price || 0);
      const quantity = Number(item.quantity) || 1;
      return sum + (unitPrice * quantity);
    }, 0) : subtotal;
  
  // Use stored tax_amount from invoice/order (calculated correctly during order creation using country_code)
  const finalTaxForItems = toNumber(invoice.tax_amount || totalTax || 0);
  
  // Items data
  if (orderItems && orderItems.length > 0) {
    orderItems.forEach((item, index) => {
      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = margin + 10;
        
        // Redraw table header on new page
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, yPos, pageWidth - (margin * 2), 8, 'F');
        doc.setDrawColor(203, 213, 225);
        doc.rect(margin, yPos, pageWidth - (margin * 2), 8);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        doc.text('Product Name', columnX.name, yPos + 6);
        doc.text('Qty', columnX.qty, yPos + 6, { align: 'right' });
        doc.text('Unit Price', columnX.unitPrice, yPos + 6, { align: 'right' });
        doc.text('Tax', columnX.tax, yPos + 6, { align: 'right' });
        doc.text('Subtotal', columnX.subtotal, yPos + 6, { align: 'right' });
        yPos += 11;
      }
      
      // Row background (alternating)
      if (index % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(249, 250, 251);
      }
      doc.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F');
      
      // Row border
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, yPos, pageWidth - (margin * 2), 10);
      
      // Item details - Use stored values from order items
      // The tax was calculated correctly during order creation using country-specific rate
      const productName = item.product_name || item.product?.name || item.name || 'Product';
      const quantity = Number(item.quantity) || 1;
      
      // Use stored unit_price and total_price from order items
      // These were calculated correctly during order creation
      const unitPrice = toNumber(item.unit_price || item.price || 0);
      const baseTotal = unitPrice * quantity;
      
      // IMPORTANT: Tax was calculated at ORDER level on (subtotal - coupon_discount)
      // NOT at item level. So for item-level tax display in invoice:
      // Calculate proportionally so sum of item taxes ≈ order tax_amount
      // This ensures consistency with the order's stored tax_amount
      // Calculate item tax as proportion of subtotal (before coupon)
      // This way: sum(item_taxes) ≈ order_tax_amount (after rounding)
      const itemTaxAmount = calculatedSubtotalForItems > 0 
        ? toNumber((baseTotal / calculatedSubtotalForItems) * finalTaxForItems) 
        : 0;
      
      // Use stored total_price if available, otherwise calculate
      const finalSubtotal = toNumber(item.total_price || baseTotal);
      
      // Display product name (truncate if too long)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      
      const productNameLines = doc.splitTextToSize(productName, 70);
      productNameLines.forEach((line, lineIndex) => {
        doc.text(line, margin + 2, yPos + 6 + (lineIndex * 5));
      });
      
      doc.text(quantity.toString(), columnX.qty, yPos + 7, { align: 'right' });
      doc.text(formatCurrency(unitPrice), columnX.unitPrice, yPos + 7, { align: 'right' });
      doc.text(formatCurrency(itemTaxAmount), columnX.tax, yPos + 7, { align: 'right' });
      doc.text(formatCurrency(finalSubtotal), columnX.subtotal, yPos + 7, { align: 'right' });
      
      // Adjust yPos based on product name lines
      yPos += Math.max(11, productNameLines.length * 5 + 3);
    });
  } else {
    // No items - show message
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text('No items in this order', margin + 2, yPos + 7);
    yPos += 11;
  }
  
  // Totals Section - Right aligned
  const totalsStartY = yPos + 12;
  let currentY = totalsStartY;
  const totalsLabelX = pageWidth - margin - 70;
  const totalsValueX = pageWidth - margin;
  
  // Use the subtotal and tax we calculated earlier (for consistency)
  const calculatedSubtotal = calculatedSubtotalForItems;
  
  // Use stored tax_amount from invoice/order (calculated correctly during order creation using country_code)
  // This ensures consistency - tax was calculated using country-specific rate during order creation
  // The tax_amount in the order was calculated by calculate_shopify_compliant_pricing() which uses
  // the country's default_tax_rate from the countries table based on country_code
  const finalTax = finalTaxForItems;
  console.log(`[Invoice PDF] Order ${invoice.order_number || invoice.id}: Using stored tax_amount = ${finalTax} (from DB: ${invoice.tax_amount || totalTax})`);
  
  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal', totalsLabelX, currentY);
  doc.text(formatCurrency(calculatedSubtotal), totalsValueX, currentY, { align: 'right' });
  currentY += 7;
  
  // Tax - always show if there's any tax (even if 0, show it for clarity)
  if (finalTax > 0 || toNumber(totalTax || 0) > 0) {
    doc.text('Tax', totalsLabelX, currentY);
    doc.text(formatCurrency(finalTax), totalsValueX, currentY, { align: 'right' });
    currentY += 7;
  }
  
  // Shipping - NOT IMPLEMENTED, always set to 0
  const shipping = 0; // Shipping functionality not implemented in project
  // Don't show shipping line in invoice since it's always 0
  
  // Coupon Discount
  const couponDiscount = toNumber(invoice.coupon_discount || 0);
  if (couponDiscount > 0) {
    doc.text('Coupon Discount', totalsLabelX, currentY);
    doc.text(`-${formatCurrency(couponDiscount)}`, totalsValueX, currentY, { align: 'right' });
    currentY += 7;
  }
  
  // Reward Points Used
  const rewardPoints = invoice.reward_points_used || 0;
  const walletUsed = toNumber(invoice.wallet_used || 0);
  const discountAmount = toNumber(invoice.discount_amount || 0);
  const additionalDiscount = Math.max(discountAmount - couponDiscount, 0);

  if (walletUsed > 0) {
    doc.text('Wallet Applied', totalsLabelX, currentY);
    doc.text(`-${formatCurrency(walletUsed)}`, totalsValueX, currentY, { align: 'right' });
    currentY += 7;
  }
  
  // Additional Discount
  if (additionalDiscount > 0) {
    doc.text('Additional Discount', totalsLabelX, currentY);
    doc.text(`-${formatCurrency(additionalDiscount)}`, totalsValueX, currentY, { align: 'right' });
    currentY += 7;
  }
  
  // Determine reward value as residual if points used
  let rewardValue = 0;
  if (rewardPoints > 0) {
    const expectedBeforeRewards = calculatedSubtotal + finalTax + shipping - couponDiscount - walletUsed - additionalDiscount;
    rewardValue = toNumber(expectedBeforeRewards - toNumber(invoice.total_amount || expectedBeforeRewards));
    if (rewardValue < 0) {
      rewardValue = 0;
    }
    if (Math.abs(rewardValue) < 0.01) {
      rewardValue = 0;
    }
  }
  
  const rewardAmount = toNumber(invoice.reward_amount || invoice.reward_points_amount || rewardValue || 0);
  if (rewardPoints > 0 || rewardAmount > 0) {
    const rewardLabel = rewardPoints > 0 ? `Reward Points (${rewardPoints} pts)` : 'Reward Points';
    doc.text(rewardLabel, totalsLabelX, currentY);
    doc.text(`-${formatCurrency(rewardAmount)}`, totalsValueX, currentY, { align: 'right' });
    currentY += 7;
  }
  
  // Final Total
  currentY += 3;
  
  // Total box background
  // Shipping is 0 (not implemented), so don't include it
  const finalTotal = toNumber(
    invoice.total_amount ||
    (calculatedSubtotal + finalTax - couponDiscount - walletUsed - additionalDiscount - rewardAmount)
  );

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(148, 163, 184);
  doc.roundedRect(totalsLabelX, currentY - 4, totalsValueX - totalsLabelX, 12, 2, 2, 'F');
  doc.setFillColor(34, 197, 94);
  doc.roundedRect(totalsLabelX, currentY - 4, totalsValueX - totalsLabelX, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL', totalsLabelX + 4, currentY + 3);
  doc.text(formatCurrency(finalTotal), totalsValueX - 4, currentY + 3, { align: 'right' });
  
  // Additional Information Section
  currentY += 15;
  
  // Payment Information
  if (invoice.payment_method || invoice.payment_status || invoice.payment_reference) {
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Payment Information:', margin, currentY);
    currentY += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    
    if (invoice.payment_method) {
      doc.text(`Method: ${invoice.payment_method}`, margin, currentY);
      currentY += 5;
    }
    if (invoice.payment_status) {
      const paymentStatusColor = invoice.payment_status === 'paid' ? [34, 197, 94] : [239, 68, 68];
      doc.setTextColor(...paymentStatusColor);
      doc.text(`Status: ${paymentStatus}`, margin, currentY);
      doc.setTextColor(71, 85, 105);
      currentY += 5;
    }
    if (invoice.payment_reference) {
      doc.text(`Reference: ${invoice.payment_reference}`, margin, currentY);
      currentY += 5;
    }
  }
  
  // Order Notes
  if (invoice.notes) {
    currentY += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text('Notes:', margin, currentY);
    currentY += 6;
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const notesLines = doc.splitTextToSize(invoice.notes, pageWidth - (margin * 2));
    notesLines.forEach(line => {
      doc.text(line, margin, currentY);
      currentY += 4;
    });
  }
  
  // Footer
  const footerY = pageHeight - 25;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('Thank you for your business!', pageWidth / 2, footerY + 7, { align: 'center' });
  doc.text('For any queries, contact us at support@peenakaa.com or call +91 12345 67890', pageWidth / 2, footerY + 13, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleString('en-IN')} | ${companyName} Admin Panel`, pageWidth / 2, footerY + 19, { align: 'center' });
  
  // Download
  doc.save(`${invoice.invoice_number || 'invoice'}.pdf`);
};

// Generate PDF Invoice from Order Data
// Use the same function for both Orders and Invoices sections
export const generateOrderInvoicePDF = (order) => {
  // Convert order format to invoice format for consistency
  const invoiceData = {
    invoice_number: order.invoice_number || `INV-${order.order_number}`,
    order_number: order.order_number,
    created_at: order.created_at,
    due_date: order.created_at, // Can be calculated as created_at + 30 days if needed
    status: order.payment_status || order.status,
    payment_status: order.payment_status,
    currency: order.currency,
    customer_name: order.user?.full_name,
    customer_email: order.user?.email,
    customer_phone: order.user?.phone,
    billing_address: order.billing_address,
    shipping_address: order.shipping_address,
    subtotal: order.subtotal,
    discount_amount: order.discount_amount || order.coupon_discount,
    coupon_discount: order.coupon_discount,
    group_discount: order.group_discount,
    wallet_used: order.wallet_used,
    shipping_cost: order.shipping_cost,
    tax_amount: order.tax_amount,
    total_amount: order.total_amount,
    items: order.items,
    user: order.user
  };
  
  // Use the unified invoice generator
  return generateInvoicePDF(invoiceData, order.items || []);
};
