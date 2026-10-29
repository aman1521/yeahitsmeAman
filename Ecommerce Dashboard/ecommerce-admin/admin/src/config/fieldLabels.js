/**
 * Field Labels Configuration
 * Change labels here to customize the admin panel for different industries
 * No database changes needed - just edit this file!
 */

export const fieldLabelsConfig = {
  // Key Ingredients Configuration
  key_ingredients: {
    display_label: 'Specifications',  // Change to "Core Components", "Specifications", etc.
    api_endpoint: '/key-ingredients',  // Can change to '/core-components' if needed (no /api prefix - apiClient handles it)
    labels: {
      name: {
        label_value: 'Specification Name',  // Changed to match "Specifications"
        placeholder_text: 'Enter specification name...'
      },
      description: {
        label_value: 'Specification Description',  // Changed to match "Specifications"
        placeholder_text: 'Enter specification description...'
      },
      image: {
        label_value: 'Specification Image',  // Changed to match "Specifications"
        placeholder_text: 'Enter image URL...'
      },
      add_button: 'Add Specification',  // Changed to match "Specifications"
      manage_title: 'Manage Specifications',  // Changed to match "Specifications"
      section_title: 'Specifications',  // For section headers - matches display_label
      section_description: 'Add specifications for this product. Each specification can have a name, description, and image.'
    }
  },

  // Health Benefits Configuration
  health_benefits: {
    display_label: 'Product_Features',  // Change to "Product Features", "Benefits", etc.
    api_endpoint: '/health-benefits',  // Can change if needed (no /api prefix - apiClient handles it)
    labels: {
      name: {
        label_value: 'Benefit Name',  // Change to "Feature Name", etc.
        placeholder_text: 'Enter benefit name...'
      },
      description: {
        label_value: 'Benefit Description',  // Change to "Feature Description", etc.
        placeholder_text: 'Enter benefit description...'
      },
      add_button: 'Add Health Benefit',  // Change to "Add Feature", etc.
      manage_title: 'Manage Health Benefits',  // Change to "Manage Features", etc.
      section_title: 'Health Benefits',
      section_description: 'Add health benefits for this product.'
    }
  },

  // Product Fields
  product: {
    labels: {
      name: 'Product Name',
      description: 'Product Description',
      sku: 'SKU',
      category: 'Category',
      price: 'Price',
      sale_price: 'Sale Price'
    }
  }
};

/**
 * Helper function to get label value
 */
export const getLabel = (fieldKey, labelKey = 'display_label', fallback = null) => {
  const fieldConfig = fieldLabelsConfig[fieldKey];
  
  if (!fieldConfig) {
    return fallback || labelKey;
  }

  // Get display_label
  if (labelKey === 'display_label') {
    return fieldConfig.display_label || fallback || fieldKey;
  }

  // Get from labels object
  if (fieldConfig.labels && fieldConfig.labels[labelKey]) {
    const label = fieldConfig.labels[labelKey];
    // Handle both object format {label_value, placeholder_text} and string format
    if (typeof label === 'string') {
      return label;
    }
    return label.label_value || label.placeholder_text || fallback || labelKey;
  }

  return fallback || labelKey;
};

/**
 * Get placeholder text
 */
export const getPlaceholder = (fieldKey, labelKey, fallback = null) => {
  const fieldConfig = fieldLabelsConfig[fieldKey];
  
  if (fieldConfig && fieldConfig.labels && fieldConfig.labels[labelKey]) {
    const label = fieldConfig.labels[labelKey];
    if (typeof label === 'object' && label.placeholder_text) {
      return label.placeholder_text;
    }
  }

  return fallback;
};

/**
 * Get API endpoint
 */
export const getApiEndpoint = (fieldKey) => {
  const fieldConfig = fieldLabelsConfig[fieldKey];
  let endpoint = fieldConfig?.api_endpoint || `/${fieldKey.replace('_', '-')}`;
  // Remove leading /api if present (apiClient already has /api as baseURL)
  if (endpoint.startsWith('/api/')) {
    endpoint = endpoint.substring(4); // Remove '/api'
  }
  // Ensure it starts with /
  if (!endpoint.startsWith('/')) {
    endpoint = `/${endpoint}`;
  }
  return endpoint;
};

/**
 * Get full field configuration
 */
export const getFieldConfig = (fieldKey) => {
  return fieldLabelsConfig[fieldKey] || null;
};

// Export default for easy import
export default fieldLabelsConfig;

