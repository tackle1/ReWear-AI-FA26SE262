import axiosClient from '../axiosClient';
import { ApiResponse } from '../../types/apiResponse.type';
import { ListingItem } from '../../types/listing.type';

export const listingApi = {
  createListing: (data: Partial<ListingItem>) =>
    axiosClient.post<never, ApiResponse<ListingItem>>('/listings', data),
  getListingById: (id: string) =>
    axiosClient.get<never, ApiResponse<ListingItem>>(`/listings/${id}`),
  verifyPhotosWithAI: (formData: FormData) =>
    axiosClient.post<never, ApiResponse<{ grade: string; confidence: number }>>('/listings/ai-verify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default listingApi;
