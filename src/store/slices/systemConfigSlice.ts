import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SystemConfigState {
  dynamicRules: Record<string, unknown>;
  platformFeePercentage: number;
  escrowHoldPeriodHours: number;
  isLoaded: boolean;
}

const initialState: SystemConfigState = {
  dynamicRules: {},
  platformFeePercentage: 0,
  escrowHoldPeriodHours: 48,
  isLoaded: false,
};

export const systemConfigSlice = createSlice({
  name: 'systemConfig',
  initialState,
  reducers: {
    setSystemConfig: (state, action: PayloadAction<Partial<SystemConfigState>>) => {
      return { ...state, ...action.payload, isLoaded: true };
    },
    updateDynamicRule: (
      state,
      action: PayloadAction<{ key: string; value: unknown }>
    ) => {
      state.dynamicRules[action.payload.key] = action.payload.value;
    },
  },
});

export const { setSystemConfig, updateDynamicRule } = systemConfigSlice.actions;
export default systemConfigSlice.reducer;
