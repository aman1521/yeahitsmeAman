/**
 * React Hook for Field Configuration (Frontend-Only)
 * Provides easy access to field labels and endpoints
 */
import { useState, useEffect } from 'react';
import { 
  getFieldConfig as getFieldConfigSync,
  getLabelSync,
  getApiEndpointSync,
  getPlaceholder as getPlaceholderAsync
} from '../services/fieldConfigService';
import fieldLabelsConfig from '../config/fieldLabels';

/**
 * Hook to get field configuration (synchronous - no loading state needed)
 */
export const useFieldConfig = (fieldKey) => {
  // Initialize immediately with config (no need to wait for useEffect)
  let initialConfig = null;
  try {
    initialConfig = fieldKey ? getFieldConfigSync(fieldKey) : null;
  } catch (error) {
    console.error(`Error loading config for ${fieldKey}:`, error);
    initialConfig = null;
  }
  const [config, setConfig] = useState(initialConfig);

  useEffect(() => {
    if (fieldKey) {
      try {
        const fieldConfig = getFieldConfigSync(fieldKey);
        setConfig(fieldConfig);
      } catch (error) {
        console.error(`Error loading config for ${fieldKey} in useEffect:`, error);
        setConfig(null);
      }
    }
  }, [fieldKey]);

  const getLabelValue = (labelKey, fallback = null) => {
    return getLabelSync(fieldKey, labelKey, fallback);
  };

  const getEndpoint = () => {
    return getApiEndpointSync(fieldKey);
  };

  const getPlaceholderText = async (labelKey, fallback = null) => {
    const { getPlaceholder } = await import('../services/fieldConfigService');
    return await getPlaceholder(fieldKey, labelKey, fallback);
  };


  // Compute displayLabel - try multiple ways to get it
  const displayLabel = config?.display_label || getLabelSync(fieldKey, 'display_label') || fieldKey;

  return {
    config,
    loading: false,  // No loading needed for local config
    error: null,
    displayLabel: displayLabel,
    apiEndpoint: config?.api_endpoint || `/api/${fieldKey.replace('_', '-')}`,
    labels: config?.labels || {},
    getLabel: getLabelValue,
    getEndpoint,
    getPlaceholder: getPlaceholderText
  };
};

/**
 * Hook for synchronous label access
 */
export const useFieldLabel = (fieldKey, labelKey = 'display_label', fallback = null) => {
  const [label, setLabel] = useState(fallback || labelKey);
  const { config } = useFieldConfig(fieldKey);

  useEffect(() => {
    if (fieldKey && config) {
      // Use cached config
      if (labelKey === 'display_label') {
        setLabel(config.display_label || fallback || labelKey);
      } else if (config.labels && config.labels[labelKey]) {
        const labelObj = config.labels[labelKey];
        if (typeof labelObj === 'string') {
          setLabel(labelObj);
        } else {
          setLabel(labelObj.label_value || fallback || labelKey);
        }
      } else {
        setLabel(fallback || labelKey);
      }
    } else if (fieldKey) {
      // Fallback to direct access
      setLabel(getLabelSync(fieldKey, labelKey, fallback));
    }
  }, [fieldKey, labelKey, fallback, config]);

  return label;
};
