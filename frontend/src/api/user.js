const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 아이디+비밀번호로 로그인, 성공 시 { accessToken } 반환, 실패 시 에러 throw
export async function login(userId, password) {
  const response = await fetch(`${API_BASE_URL}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, user_password: password }),
  });

  if (!response.ok) {
    throw new Error("로그인 실패");
  }

  const data = await response.json();
  return { accessToken: data.access_token };
}

// 토큰으로 로그인한 내 정보 조회
export async function getMe(token) {
  const response = await fetch(`${API_BASE_URL}/user/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("사용자 정보 조회 실패");
  }

  return response.json();
}
