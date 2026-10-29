/**
 * Field Configuration Service (Frontend-Only)
 * Uses local config file - no database/API calls needed
 */
import { 
  getLabel as getLabelFromConfig, 
  getPlaceholder as getPlaceholderFromConfig,
  getApiEndpoint as getApiEndpointFromConfig,
  getFieldConfig as getFieldConfigFromConfig
} from '../config/fieldLabels';

/**
 * Get field configuration by field key
 * Returns cached config from local file
 */
export const getFieldConfig = (fieldKey) => {
  return getFieldConfigFromConfig(fieldKey);
};

/**
 * Get all field configurations
 */
export const getAllFieldConfigs = async () => {
  // Import dynamically to get fresh config
  const { default: configs } = await import('../config/fieldLabels');
  return configs;
};

/**
 * Get label value for a field
 */
export const getLabel = async (fieldKey, labelKey = 'display_label', fallback = null) => {
  return getLabelFromConfig(fieldKey, labelKey, fallback);
};

/**
 * Get API endpoint for a field
 */
export const getApiEndpoint = async (fieldKey) => {
  try {
    return getApiEndpointFromConfig(fieldKey);
  } catch (error) {
    console.error(`Error getting API endpoint for ${fieldKey}:`, error);
    // Return default endpoint as fallback
    return `/api/${fieldKey.replace('_', '-')}`;
  }
};

/**
 * Get placeholder text for a field label
 */
export const getPlaceholder = async (fieldKey, labelKey, fallback = null) => {
  return getPlaceholderFromConfig(fieldKey, labelKey, fallback);
};

/**
 * Refresh field configurations (reloads config file)
 */
export const refreshFieldConfigs = async () => {
  // In frontend-only mode, just return current config
  // Config changes require page reload or hot reload
  return await getAllFieldConfigs();
};

/**
 * Update field configuration (frontend-only, persists in localStorage)
 * Note: This is temporary - real changes should be made in fieldLabels.js
 */
export const updateFieldConfig = async (fieldKey, updates) => {
  try {
    // Store in localStorage for session persistence
    const stored = localStorage.getItem('fieldConfigOverrides') || '{}';
    const overrides = JSON.parse(stored);
    overrides[fieldKey] = { ...overrides[fieldKey], ...updates };
    localStorage.setItem('fieldConfigOverrides', JSON.stringify(overrides));
    
    // Return merged config
    const baseConfig = getFieldConfigFromConfig(fieldKey);
    return { ...baseConfig, ...updates };
  } catch (error) {
    console.error('Error updating field config:', error);
    throw error;
  }
};

// For backward compatibility - synchronous version
export const getFieldConfigSync = (fieldKey) => {
  return getFieldConfigFromConfig(fieldKey);
};

export const getLabelSync = (fieldKey, labelKey = 'display_label', fallback = null) => {
  return getLabelFromConfig(fieldKey, labelKey, fallback);
};

export const getApiEndpointSync = (fieldKey) => {
  return getApiEndpointFromConfig(fieldKey);
};
