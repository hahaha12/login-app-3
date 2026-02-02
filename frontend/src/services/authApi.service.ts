import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class AuthFlowApiRequestError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export interface AuthEmailRequest {
  email: string;
}

export interface AuthPasswordRequest {
  password: string;
}

export interface AuthFlowSuccessResponse {
  ok: true;
  message?: string;
}

const toApiError = (error: unknown, fallbackMessage: string) => {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    const message = error.response?.data?.message || fallbackMessage;
    return new AuthFlowApiRequestError(message, statusCode);
  }
  return new AuthFlowApiRequestError('An unexpected error occurred');
};

export const authFlowService = {
  submitEmail: async (data: AuthEmailRequest): Promise<AuthFlowSuccessResponse> => {
    try {
      const response = await apiClient.post<AuthFlowSuccessResponse>('/auth/email', data);
      return response.data;
    } catch (error) {
      throw toApiError(error, 'Unable to submit email');
    }
  },
  submitPassword: async (
    data: AuthPasswordRequest,
  ): Promise<AuthFlowSuccessResponse> => {
    try {
      const response = await apiClient.post<AuthFlowSuccessResponse>('/auth/password', data);
      return response.data;
    } catch (error) {
      throw toApiError(error, 'Unable to submit password');
    }
  },
};
