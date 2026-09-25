import axiosClient from '../../../services/axiosClient';
import envConfig from '../../../config/env.config';
import { ApiResponse } from '../../../types/apiResponse.type';
import { RegisterPayload, RegisterResponseData } from '../types/auth.type';
import { mockAuthApi } from './mockAuth.api';

export const registerApi = {
  register: (payload: RegisterPayload): Promise<ApiResponse<RegisterResponseData>> => {
    if (envConfig.useMockApi) {
      return mockAuthApi.register(payload);
    }
    return axiosClient.post<never, ApiResponse<RegisterResponseData>>('/auth/register', payload);
  },
};

export default registerApi;
