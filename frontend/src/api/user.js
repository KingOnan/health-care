import { api } from "./client";

// 아이디+비밀번호로 로그인, 성공 시 { accessToken } 반환, 실패 시 에러 throw
export async function login(userId, password) {
  const response = await api.post("/user/login", { user_id: userId, user_password: password });
  return { accessToken: response.data.data.access_token };
}

// 로그인한 내 정보 조회
export async function getMe() {
  const response = await api.get("/user/me");
  return response.data.data;
}
