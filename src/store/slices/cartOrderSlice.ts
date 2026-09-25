import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ListingItem } from '../../types/listing.type';

interface CartOrderState {
  selectedItem: ListingItem | null;
  shippingAddress: string | null;
  orderNote: string;
}

const initialState: CartOrderState = {
  selectedItem: null,
  shippingAddress: null,
  orderNote: '',
};

export const cartOrderSlice = createSlice({
  name: 'cartOrder',
  initialState,
  reducers: {
    setSelectedItem: (state, action: PayloadAction<ListingItem | null>) => {
      state.selectedItem = action.payload;
    },
    setShippingAddress: (state, action: PayloadAction<string>) => {
      state.shippingAddress = action.payload;
    },
    setOrderNote: (state, action: PayloadAction<string>) => {
      state.orderNote = action.payload;
    },
    clearCartOrder: (state) => {
      state.selectedItem = null;
      state.shippingAddress = null;
      state.orderNote = '';
    },
  },
});

export const { setSelectedItem, setShippingAddress, setOrderNote, clearCartOrder } = cartOrderSlice.actions;
export default cartOrderSlice.reducer;
