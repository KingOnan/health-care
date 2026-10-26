import axios from "axios";
import { getToken } from "../utils/user";

// 모든 API 요청이 공통으로 쓰는 axios 인스턴스 — 기본 주소, 시간 제한, 토큰 첨부를 한 곳에서 처리
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // 응답이 5초 안에 안 오면 실패로 처리(사진 업로드 포함 모든 요청 공통). 와이파이가 끊겼을 때
  // 폰이 요청을 오래 붙잡고 있어서 안내 없이 계속 기다리던 문제를 막음
  timeout: 5000,
});

api.interceptors.request.use((config) => {
  // 폰이 아예 인터넷에 연결돼 있지 않으면 요청을 보내지 않고 바로 실패 처리(즉시 안내)
  if (!navigator.onLine) {
    return Promise.reject(new Error("인터넷에 연결되어 있지 않음"));
  }

  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
