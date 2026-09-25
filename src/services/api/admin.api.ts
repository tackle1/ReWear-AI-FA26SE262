import axiosClient from '../axiosClient';
import { ApiResponse } from '../../types/apiResponse.type';

export const adminApi = {
  getFlaggedListings: () =>
    axiosClient.get<never, ApiResponse<unknown[]>>('/admin/flagged-listings'),
  moderateListing: (listingId: string, action: 'APPROVE' | 'REJECT', reason?: string) =>
    axiosClient.post<never, ApiResponse<unknown>>(`/admin/listings/${listingId}/moderate`, { action, reason }),
  getSystemRules: () =>
    axiosClient.get<never, ApiResponse<Record<string, unknown>>>('/admin/governance/rules'),
  updateSystemRules: (rules: Record<string, unknown>) =>
    axiosClient.put<never, ApiResponse<Record<string, unknown>>>('/admin/governance/rules', rules),
};

export default adminApi;
