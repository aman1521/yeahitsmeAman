import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCurrencies, getProducts } from '../services/currencyApi';

export const fetchCurrencies = createAsyncThunk('currency/fetchCurrencies', async (_, { rejectWithValue }) => {
  try {
    const res = await getCurrencies();
    // getCurrencies returns { data: { data: [...] } }
    return res.data?.data || res.data || [];
  } catch (e) {
    return rejectWithValue(e?.message || 'Failed to fetch currencies');
  }
});

export const fetchProductsForCurrency = createAsyncThunk(
  'currency/fetchProductsForCurrency',
  async (code, { rejectWithValue }) => {
    try {
      const res = await getProducts(code);
      return res.data;
    } catch (e) {
      return rejectWithValue(e?.message || 'Failed to fetch products');
    }
  }
);

const slice = createSlice({
  name: 'currency',
  initialState: {
    currencies: [],
    selected: 'INR',
    products: [],
    loading: false,
    lastUpdatedByCurrency: {},
  },
  reducers: {
    setSelected(state, action) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrencies.fulfilled, (state, action) => {
        // action.payload is already the array from getCurrencies
        state.currencies = Array.isArray(action.payload) ? action.payload : [];
        const activeCurrencies = state.currencies.filter(c => c.is_active !== false);
        const stillAvailable = activeCurrencies.some(c => c.currency_code === state.selected);
        if (!stillAvailable) {
          state.selected = activeCurrencies[0]?.currency_code || 'INR';
        }
      })
      .addCase(fetchCurrencies.rejected, (state, action) => {
        console.error('Failed to fetch currencies:', action.payload);
        state.currencies = []; // Set empty array on error
      })
      .addCase(fetchProductsForCurrency.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsForCurrency.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload?.data || [];
        const anyItem = state.products[0];
        if (anyItem?.pricing?.lastUpdated) {
          state.lastUpdatedByCurrency[state.selected] = anyItem.pricing.lastUpdated;
        }
      })
      .addCase(fetchProductsForCurrency.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setSelected } = slice.actions;
export default slice.reducer;

