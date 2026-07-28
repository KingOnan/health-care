const TOKEN_KEY = "accessToken";

// "자동 로그인" 체크 시 localStorage(브라우저를 껐다 켜도 유지), 해제 시 sessionStorage(탭을 닫으면 로그아웃)에 저장
export function setToken(token, remember) {
  if (remember) {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}
