import axiosClient from '../axiosClient';
import { ApiResponse } from '../../types/apiResponse.type';
import { EscrowTransaction } from '../../types/escrow.type';

export const escrowApi = {
  initializePayment: (payload: { listingId: string; amount: number }) =>
    axiosClient.post<never, ApiResponse<EscrowTransaction>>('/escrow/init', payload),
  getEscrowStatus: (orderId: string) =>
    axiosClient.get<never, ApiResponse<EscrowTransaction>>(`/escrow/${orderId}/status`),
  confirmDelivery: (orderId: string) =>
    axiosClient.post<never, ApiResponse<EscrowTransaction>>(`/escrow/${orderId}/confirm-delivery`),
  releaseEscrow: (orderId: string) =>
    axiosClient.post<never, ApiResponse<EscrowTransaction>>(`/escrow/${orderId}/release`),
};

export default escrowApi;
