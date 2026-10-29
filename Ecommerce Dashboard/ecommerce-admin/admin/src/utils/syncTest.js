/**
 * Frontend sync verification utilities
 * Use these to test that frontend-backend-database sync is working
 */
import api from '../services/currencyApi';

export async function verifySync() {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get('/sync/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Sync Verification:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Sync Verification Failed:', error);
    throw error;
  }
}

export async function testSync() {
  try {
    const token = localStorage.getItem('token');
    const response = await api.post('/sync/test', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Sync Test:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Sync Test Failed:', error);
    throw error;
  }
}

// Add to window for easy console access
if (typeof window !== 'undefined') {
  window.testSync = testSync;
  window.verifySync = verifySync;
  console.log('💡 Sync utilities available: window.testSync(), window.verifySync()');
}

