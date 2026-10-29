import jsPDF from 'jspdf';

/**
 * Generate a professional revenue PDF report matching admin panel theme
 */
export const generateRevenuePDF = async (reportData, dateRange = 30, totalUniqueCustomers = null) => {
  try {
    // Dynamic import with proper error handling
    const autoTableModule = await import('jspdf-autotable');
    
    // jspdf-autotable v5.x exports as default
    let autoTable = null;
    
    // Try to get the function from various possible export patterns
    if (typeof autoTableModule === 'function') {
      autoTable = autoTableModule;
    } else if (autoTableModule.default) {
      if (typeof autoTableModule.default === 'function') {
        autoTable = autoTableModule.default;
      } else if (autoTableModule.default.default && typeof autoTableModule.default.default === 'function') {
        autoTable = autoTableModule.default.default;
      }
    }
    
    // If still not found, search all exports
    if (!autoTable) {
      for (const key in autoTableModule) {
        if (typeof autoTableModule[key] === 'function' && key.toLowerCase().includes('table')) {
          autoTable = autoTableModule[key];
          break;
        }
      }
    }
    
    // Last resort: find any function in the module
    if (!autoTable) {
      const allExports = Object.values(autoTableModule);
      autoTable = allExports.find(exp => typeof exp === 'function');
    }
    
    if (!autoTable || typeof autoTable !== 'function') {
      console.error('autoTable module structure:', Object.keys(autoTableModule));
      console.error('autoTable module:', autoTableModule);
      throw new Error('autoTable function not found. jspdf-autotable may not be installed. Run: npm install jspdf-autotable@^5.0.2 --save');
    }
    
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Admin panel color theme - matching the dashboard
    const colors = {
      primary: [59, 130, 246],          // Blue-500 (admin panel primary)
      primaryDark: [37, 99, 235],       // Blue-600
      secondary: [99, 102, 241],        // Indigo-500
      success: [16, 185, 129],          // Emerald-500
      warning: [245, 158, 11],          // Amber-500
      danger: [239, 68, 68],            // Red-500
      light: [249, 250, 251],           // Gray-50
      white: [255, 255, 255],
      text: [17, 24, 39],               // Gray-900
      textSecondary: [75, 85, 99],      // Gray-600
      textLight: [156, 163, 175],       // Gray-400
      border: [229, 231, 235],          // Gray-200
      accent: [139, 92, 246]            // Purple-500
    };
    
    // Helper functions - Fixed to work properly with jsPDF
    const formatNumber = (amount) => {
      const num = parseFloat(amount || 0);
      if (isNaN(num)) return '0.00';
      // Format with commas and 2 decimal places - ensure clean string output
      const parts = num.toFixed(2).split('.');
      const integerPart = parts[0];
      const decimalPart = parts[1] || '00';
      // Add commas to integer part
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return formattedInteger + '.' + decimalPart;
    };
  
    const formatCurrency = (amount) => {
      const formatted = formatNumber(amount);
      // Use plain string concatenation to avoid template literal issues
      return 'Rs. ' + formatted;
    };
    
    const formatDate = (dateString) => {
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        });
      } catch (e) {
        return dateString;
      }
    };
    
    // Ensure reportData is an array and sort by date
    let data = Array.isArray(reportData) ? reportData : [];
    data.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate summary statistics - CRITICAL: Only count customers who placed orders
    const totalRevenue = data.reduce((sum, item) => sum + (parseFloat(item.revenue) || 0), 0);
    const totalOrders = data.reduce((sum, item) => sum + (parseInt(item.orders) || 0), 0);
    
    // Use total unique customers from backend (users who placed orders)
    // If not provided, sum up customers from all days (each day counts unique customers for that day)
    // This gives us total customer-days, but we need unique customers across all days
    // Best approach: Use backend value if available, otherwise sum all daily customers
    let finalCustomerCount = 0;
    if (totalUniqueCustomers !== null && totalUniqueCustomers !== undefined && totalUniqueCustomers > 0) {
      // Use backend-provided unique customer count (most accurate)
      finalCustomerCount = totalUniqueCustomers;
    } else {
      // Fallback: Sum all customers from daily data (each day may have overlapping customers, but this is better than max)
      const allCustomers = data.map(item => parseInt(item.customers) || 0);
      finalCustomerCount = allCustomers.reduce((sum, count) => sum + count, 0);
      // If that gives 0 but we have orders, estimate at least 1 customer per order (minimum)
      if (finalCustomerCount === 0 && totalOrders > 0) {
        finalCustomerCount = totalOrders; // At minimum, each order is from one customer
      }
    }
    
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // ========================================
    // PROFESSIONAL HEADER - Admin Panel Style
    // ========================================
    
    let yPos = 15;
    
    // ========================================
    // SHOPIFY-STYLE PROFESSIONAL HEADER
    // ========================================
    
    // Clean white header background
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    // Subtle border at bottom
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.5);
    doc.line(0, 60, pageWidth, 60);
    
    yPos = 18; // Start higher
    
    // Company name - Smaller
    doc.setFontSize(12);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Peenakaa', 20, yPos + 5);
    
    // Report title - Smaller
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const titleText = 'Revenue Report';
    const titleWidth = doc.getTextWidth(titleText);
    doc.text(titleText, (pageWidth / 2) - (titleWidth / 2), yPos + 5);
    
    // Metadata (right) - Smaller
    doc.setFontSize(8);
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    const genDate = new Date().toLocaleString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
    const genDateWidth = doc.getTextWidth(genDate);
    doc.text(genDate, pageWidth - 20 - genDateWidth, yPos + 5);
    doc.setFontSize(7);
    const daysText = 'Last ' + dateRange + ' days';
    const daysTextWidth = doc.getTextWidth(daysText);
    doc.text(daysText, pageWidth - 20 - daysTextWidth, yPos + 11);
    
    // Divider line - closer
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.3);
    doc.line(20, yPos + 18, pageWidth - 20, yPos + 18);
    
    yPos = yPos + 22; // Reduced starting position
    
    // ========================================
    // COMPACT PROFESSIONAL METRICS CARDS
    // ========================================
    
    // Compact card dimensions - Smaller for single page
    const cardWidth = 55;
    const cardHeight = 24;
    const cardGap = 6;
    const startX = 20;
    
    // Card 1: Total Revenue - Compact professional card
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.rect(startX, yPos, cardWidth, cardHeight, 'F');
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.3);
    doc.rect(startX, yPos, cardWidth, cardHeight, 'S');
    
    // Compact label - smaller font
    doc.setFontSize(8);
    doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('Total Revenue', startX + 6, yPos + 6);
    
    // Value - smaller size
    doc.setFontSize(14);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFont('helvetica', 'bold');
    const revenueText = formatCurrency(totalRevenue);
    doc.text(revenueText.toString(), startX + 6, yPos + 17);
    
    // Subtle left accent bar
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(startX, yPos, 3, cardHeight, 'F');
    
    // Card 2: Total Orders - Compact
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.rect(startX + cardWidth + cardGap, yPos, cardWidth, cardHeight, 'F');
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.3);
    doc.rect(startX + cardWidth + cardGap, yPos, cardWidth, cardHeight, 'S');
    
    doc.setFontSize(8);
    doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('Total Orders', startX + cardWidth + cardGap + 6, yPos + 6);
    
    doc.setFontSize(14);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(String(totalOrders), startX + cardWidth + cardGap + 6, yPos + 17);
    
    doc.setFillColor(colors.success[0], colors.success[1], colors.success[2]);
    doc.rect(startX + cardWidth + cardGap, yPos, 3, cardHeight, 'F');
    
    yPos += cardHeight + cardGap;
    
    // Card 3: Customers - Compact
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.rect(startX, yPos, cardWidth, cardHeight, 'F');
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.3);
    doc.rect(startX, yPos, cardWidth, cardHeight, 'S');
    
    doc.setFontSize(8);
    doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('Customers', startX + 6, yPos + 6);
    doc.setFontSize(7);
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    doc.text('(active)', startX + 6, yPos + 12);
    
    doc.setFontSize(14);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(String(finalCustomerCount), startX + 6, yPos + 20);
    
    doc.setFillColor(colors.warning[0], colors.warning[1], colors.warning[2]);
    doc.rect(startX, yPos, 3, cardHeight, 'F');
  
    // Card 4: Average Order Value - Compact
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.rect(startX + cardWidth + cardGap, yPos, cardWidth, cardHeight, 'F');
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.3);
    doc.rect(startX + cardWidth + cardGap, yPos, cardWidth, cardHeight, 'S');
    
    doc.setFontSize(8);
    doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('Avg Order Value', startX + cardWidth + cardGap + 6, yPos + 6);
    
    doc.setFontSize(14);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFont('helvetica', 'bold');
    const avgValueText = formatCurrency(avgOrderValue);
    doc.text(avgValueText.toString(), startX + cardWidth + cardGap + 6, yPos + 17);
    
    doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.rect(startX + cardWidth + cardGap, yPos, 3, cardHeight, 'F');
    
    yPos += cardHeight + 10; // Reduced gap
    
    // ========================================
    // DAILY BREAKDOWN TABLE - Compact
    // ========================================
    
    doc.setFontSize(10);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Daily Breakdown', 20, yPos);
    
    yPos += 4;
    
    // Prepare table data with proper formatting - ensure all values are clean strings
    const tableData = data.map(item => {
      const revenueNum = parseFloat(item.revenue) || 0;
      const ordersNum = parseInt(item.orders) || 0;
      const customersNum = parseInt(item.customers) || 0;
      
      // Ensure all values are properly formatted strings
      return [
        formatDate(item.date || '') || '',
        String(ordersNum),
        formatCurrency(revenueNum).toString(),  // Explicitly convert to string
        String(customersNum),
        (ordersNum > 0 ? formatCurrency(revenueNum / ordersNum) : formatCurrency(0)).toString()
      ];
    });
    
    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Orders', 'Revenue', 'Customers', 'Avg Value']],
      body: tableData,
      theme: 'plain',
      headStyles: { 
        fillColor: [249, 250, 251],
        textColor: [colors.text[0], colors.text[1], colors.text[2]],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'left',
        cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
        lineWidth: 0,
        lineColor: [colors.border[0], colors.border[1], colors.border[2]]
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [colors.text[0], colors.text[1], colors.text[2]],
        cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
        lineWidth: 0,
        lineColor: [colors.border[0], colors.border[1], colors.border[2]]
      },
      alternateRowStyles: { 
        fillColor: [255, 255, 255]
      },
      columnStyles: {
        0: { cellWidth: 30, halign: 'left', textColor: [colors.text[0], colors.text[1], colors.text[2]] },
        1: { cellWidth: 22, halign: 'center', textColor: [colors.text[0], colors.text[1], colors.text[2]] },
        2: { cellWidth: 35, halign: 'right', fontStyle: 'bold', textColor: [colors.text[0], colors.text[1], colors.text[2]] },
        3: { cellWidth: 24, halign: 'center', textColor: [colors.text[0], colors.text[1], colors.text[2]] },
        4: { cellWidth: 29, halign: 'right', textColor: [colors.text[0], colors.text[1], colors.text[2]] }
      },
      margin: { left: 20, right: 20 },
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      didDrawCell: function(data) {
        // Add bottom border to all cells for clean separation - Shopify style
        if (data.row.index === 0) {
          // Header row - add bottom border
          doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
          doc.setLineWidth(0.5);
          doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
        } else {
          // Body rows - subtle bottom border
          doc.setDrawColor(240, 240, 240);
          doc.setLineWidth(0.3);
          doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
        }
      }
    });
    
    yPos = doc.lastAutoTable.finalY + 20;
    
    // ========================================
    // REVENUE CHART - Enhanced
    // ========================================
    
    if (yPos > pageHeight - 100) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Revenue Trend', 20, yPos);
    
    yPos += 6;
    
      if (data.length > 0) {
      const chartHeight = 65; // Increased to accommodate labels
      const chartWidth = pageWidth - 50;
      const chartX = 25;
      const chartY = yPos + 10; // Add space for Y-axis title
      const chartBottom = chartY + chartHeight - 12; // Reserve space for x-axis labels and padding
      
      // Chart container - clean white background
      doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.rect(chartX, chartY, chartWidth, chartHeight, 'F');
      doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
      doc.setLineWidth(0.3);
      doc.rect(chartX, chartY, chartWidth, chartHeight, 'S');
      
      // Find max revenue for scaling with better insight
      const maxRevenue = Math.max(...data.map(item => parseFloat(item.revenue) || 0), 1);
      const minRevenue = Math.min(...data.map(item => parseFloat(item.revenue) || 0), maxRevenue);
      const avgRevenue = data.reduce((sum, item) => sum + (parseFloat(item.revenue) || 0), 0) / data.length;
      
      // Calculate chart area dimensions (declare once and reuse)
      const chartAreaHeight = chartHeight - 14; // Reduced padding
      const chartTop = chartY + 6; // Reduced top padding
      
      // Draw subtle grid lines - fewer lines for compact chart
      doc.setDrawColor(240, 240, 240);
      doc.setLineWidth(0.2);
      for (let i = 1; i <= 3; i++) {
        const y = chartTop + (chartAreaHeight / 3) * i;
        doc.line(chartX + 6, y, chartX + chartWidth - 8, y);
      }
      
      // Y-axis
      doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
      doc.setLineWidth(0.5);
      doc.line(chartX + 6, chartTop, chartX + 6, chartBottom);
      
      // X-axis
      doc.line(chartX + 6, chartBottom, chartX + chartWidth - 8, chartBottom);
      
      // Draw bars - improved visualization
      const displayData = data.length > 20 ? data.slice(-20) : data; // Last 20 days max for compact view
      const barWidth = Math.min((chartWidth - 16) / Math.max(displayData.length, 1), 6); // Smaller bars
      const barGap = Math.max(0.5, (chartWidth - 16 - (displayData.length * barWidth)) / Math.max(displayData.length - 1, 1));
      displayData.forEach((item, index) => {
        const itemRevenue = parseFloat(item.revenue) || 0;
        const barHeight = (itemRevenue / maxRevenue) * chartAreaHeight;
        const barX = chartX + 8 + (index * (barWidth + barGap));
        const barY = chartBottom - barHeight;
        
        if (barHeight > 0 && !isNaN(barX) && !isNaN(barY) && !isNaN(barWidth) && !isNaN(barHeight)) {
          // Ensure all values are valid numbers
          const safeBarX = Math.max(0, barX);
          const safeBarY = Math.max(0, barY);
          const safeBarWidth = Math.max(0.5, barWidth);
          const safeBarHeight = Math.max(0.5, barHeight);
          
          // Color code bars: above average = primary, below = lighter
          const isAboveAverage = itemRevenue >= avgRevenue;
          if (isAboveAverage) {
            doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
          } else {
            doc.setFillColor(200, 200, 200); // Lighter gray for below average
          }
          
          // Main bar
          doc.rect(safeBarX, safeBarY, safeBarWidth, safeBarHeight, 'F');
          
          // Subtle border
          doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
          doc.setLineWidth(0.1);
          doc.rect(safeBarX, safeBarY, safeBarWidth, safeBarHeight, 'S');
        }
      });
      
      // Y-axis labels - Compact formatting
      doc.setFontSize(7);
      doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
      doc.setFont('helvetica', 'normal');
      doc.text('Rs. 0', chartX + 2, chartBottom + 1); // Position at x-axis level
      
      // Y-axis scale labels - fewer labels for compact chart
      const yScaleSteps = 3;
      for (let i = 1; i <= yScaleSteps; i++) {
        const scaleValue = (maxRevenue / yScaleSteps) * i;
        const scaleY = chartBottom - ((scaleValue / maxRevenue) * chartAreaHeight);
        const scaleText = 'Rs. ' + formatNumber(scaleValue);
        doc.text(scaleText, chartX + 2, scaleY + 1);
      }
      
      // X-axis labels - Date labels (fewer for compact chart)
      doc.setFontSize(6);
      doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
      const xLabelCount = Math.min(displayData.length, 5); // Show max 5 date labels
      const xLabelStep = Math.max(1, Math.floor(displayData.length / xLabelCount));
      for (let i = 0; i < displayData.length; i += xLabelStep) {
        if (i < displayData.length) {
          const item = displayData[i];
          const barX = chartX + 8 + (i * (barWidth + barGap));
          const dateLabel = formatDate(item.date);
          // Format date more compactly for chart
          const labelText = dateLabel.length > 6 ? dateLabel.substring(0, 6) : dateLabel;
          // Center align manually by calculating text width
          const textWidth = doc.getTextWidth(labelText);
          doc.text(labelText, barX + (barWidth / 2) - (textWidth / 2), chartBottom + 4);
        }
      }
      
      // Chart Y-axis title - smaller and positioned better
      doc.setFontSize(7);
      doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
      doc.setFont('helvetica', 'bold');
      const yAxisTitle = 'Revenue (INR)';
      doc.text(yAxisTitle, chartX - 2, yPos + 6); // Position before adjusting chartY
      
      // Average line indicator - skip for compact view to save space
      // Removed to save vertical space
      
      yPos += chartHeight + 6; // Reduced gap
    }
    
    // ========================================
    // KEY INSIGHTS - Very Compact for single page
    // ========================================
    
    doc.setFontSize(10);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Insights', 20, yPos);
    
    yPos += 4;
    
    // Insights container - Very compact
    const insightsHeight = 28; // Much smaller height
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.rect(20, yPos, pageWidth - 40, insightsHeight, 'F');
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.3);
    doc.rect(20, yPos, pageWidth - 40, insightsHeight, 'S');
    
    const insightsY = yPos + 6;
    let insightY = insightsY;
    const labelX = 25;
    const valueX = 110;
    
    // Calculate insights
    const avgDailyRevenue = data.length > 0 ? totalRevenue / data.length : 0;
    const avgDailyOrders = data.length > 0 ? totalOrders / data.length : 0;
    const conversionRate = totalOrders > 0 ? (finalCustomerCount / totalOrders * 100) : 0;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    // Compact insights - Two columns layout with tighter spacing
    doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
    
    // First column - Left side
    doc.text('Avg Daily Rev', labelX, insightY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    const avgRevText = formatCurrency(avgDailyRevenue);
    doc.text(avgRevText, valueX, insightY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
    doc.text('Avg Daily Orders', labelX, insightY + 5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.text(avgDailyOrders.toFixed(1), valueX, insightY + 5);
    
    // Second column - Right side
    const rightColumnX = 115;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
    doc.text('Customers', rightColumnX, insightY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.text(String(finalCustomerCount), pageWidth - 25, insightY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
    doc.text('Conversion', rightColumnX, insightY + 5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.text(conversionRate.toFixed(1) + '%', pageWidth - 25, insightY + 5);
    
    // Best day on separate line (compact)
    if (data.length > 0) {
      const bestDay = data.reduce((max, item) => 
        (parseFloat(item.revenue) > parseFloat(max.revenue)) ? item : max
      );
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
      doc.text('Best Day', labelX, insightY + 11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      const bestDayText = formatDate(bestDay.date) + ' - ' + formatCurrency(bestDay.revenue);
      // Truncate if too long
      const maxBestDayWidth = pageWidth - 50 - (valueX - labelX);
      const bestDayWidth = doc.getTextWidth(bestDayText);
      if (bestDayWidth > maxBestDayWidth) {
        let truncated = bestDayText;
        while (doc.getTextWidth(truncated + '...') > maxBestDayWidth && truncated.length > 8) {
          truncated = truncated.slice(0, -1);
        }
        doc.text(truncated + '...', valueX, insightY + 11);
      } else {
        doc.text(bestDayText, valueX, insightY + 11);
      }
    }
    
    // ========================================
    // PROFESSIONAL FOOTER
    // ========================================
    
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Footer separator - clean line
      doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
      doc.setLineWidth(0.3);
      doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);
      
      // Footer text - minimal and clean
      doc.setFontSize(9);
      doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
      doc.setFont('helvetica', 'normal');
      doc.text('Peenakaa', 20, pageHeight - 8);
      doc.text('Page ' + i + ' of ' + totalPages, pageWidth - 20, pageHeight - 8, { align: 'right' });
    }
  
    // ========================================
    // SAVE PDF
    // ========================================
    
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = 'revenue_report_' + dateStr + '.pdf';
    doc.save(filename);
    
    return true;
  } catch (error) {
    console.error('[PDF Generation] Error:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

export default generateRevenuePDF;
