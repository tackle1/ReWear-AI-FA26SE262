import axiosClient from '../../../services/axiosClient';
import envConfig from '../../../config/env.config';
import { ApiResponse } from '../../../types/apiResponse.type';
import { LoginPayload, LoginResponseData } from '../types/auth.type';
import { mockAuthApi } from './mockAuth.api';

export const loginApi = {
  login: (payload: LoginPayload): Promise<ApiResponse<LoginResponseData>> => {
    if (envConfig.useMockApi) {
      return mockAuthApi.login(payload);
    }
    return axiosClient.post<never, ApiResponse<LoginResponseData>>('/auth/login', payload);
  },
};

export default loginApi;
