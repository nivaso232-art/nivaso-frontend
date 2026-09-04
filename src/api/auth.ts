import apiClient from './client'

export interface LoginResponse {
  access_token: string
  token_type: string
  business_slug: string
  business_name: string
  username: string
}

export interface SuperAdminLoginResponse {
  access_token: string
  token_type: string
}

export const authApi = {
  login: (username: string, password: string) =>
    apiClient
      .post<LoginResponse>('/auth/login', { username, password })
      .then((r) => r.data),

  superAdminLogin: (username: string, password: string) =>
    apiClient
      .post<SuperAdminLoginResponse>('/auth/super-admin/login', { username, password })
      .then((r) => r.data),
}
