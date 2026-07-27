import { apiClient } from "./client";
import type { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse, MeResponse } from "../types/auth";

export function register(data: RegisterRequest): Promise<RegisterResponse> {
  return apiClient<RegisterResponse>("/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function login(data: LoginRequest): Promise<LoginResponse> {
  return apiClient<LoginResponse>("/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMe(): Promise<MeResponse> {
  return apiClient<MeResponse>("/me");
}
