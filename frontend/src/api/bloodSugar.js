const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 혈당 기록 등록. data는 BloodSugarCreate 모양의 객체
export async function createBloodSugar(data, token) {
  const response = await fetch(`${API_BASE_URL}/blood-sugar/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("혈당 기록 등록 실패");
  }

  const { data: result } = await response.json();
  return result;
}

// 혈당 월별 목록 조회. checkTiming("공복" / "식후 2시간")을 넘기면 해당 시기만, 생략하면 전체
export async function getBloodSugarList(year, month, checkTiming, token) {
  const params = new URLSearchParams({ year, month });
  if (checkTiming) params.append("check_timing", checkTiming);

  const response = await fetch(`${API_BASE_URL}/blood-sugar/list?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("혈당 월별 조회 실패");
  }

  const { data } = await response.json();
  return data;
}

// 혈당 단건 상세 조회
export async function getBloodSugar(bloodSugarSeq, token) {
  const response = await fetch(`${API_BASE_URL}/blood-sugar/${bloodSugarSeq}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("혈당 상세 조회 실패");
  }

  const { data } = await response.json();
  return data;
}

// 혈당 기록 수정. data는 BloodSugarUpdate 모양의 객체
export async function updateBloodSugar(bloodSugarSeq, data, token) {
  const response = await fetch(`${API_BASE_URL}/blood-sugar/update/${bloodSugarSeq}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("혈당 기록 수정 실패");
  }

  const { data: result } = await response.json();
  return result;
}

// 혈당 기록 삭제
export async function deleteBloodSugar(bloodSugarSeq, token) {
  const response = await fetch(`${API_BASE_URL}/blood-sugar/${bloodSugarSeq}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("혈당 기록 삭제 실패");
  }
}
