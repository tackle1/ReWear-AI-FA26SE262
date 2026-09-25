import axiosClient from '../axiosClient';
import { ApiResponse } from '../../types/apiResponse.type';
import { User } from '../../types/user.type';

export const authApi = {
  login: (credentials: { email: string; password?: string; otp?: string }) =>
    axiosClient.post<never, ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>('/auth/login', credentials),
  register: (payload: { email: string; name: string; phone: string }) =>
    axiosClient.post<never, ApiResponse<{ user: User }>>('/auth/register', payload),
  verifyOtp: (payload: { phone: string; otp: string }) =>
    axiosClient.post<never, ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/verify-otp', payload),
  getProfile: () =>
    axiosClient.get<never, ApiResponse<User>>('/auth/profile'),
};

export default authApi;
