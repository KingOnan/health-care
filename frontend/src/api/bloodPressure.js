const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 혈압 기록 등록. data는 BloodPressureCreate 모양의 객체
export async function createBloodPressure(data, token) {
  const response = await fetch(`${API_BASE_URL}/blood-pressure/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("혈압 기록 등록 실패");
  }

  const { data: result } = await response.json();
  return result;
}

// 혈압 월별 목록 조회
export async function getBloodPressureList(year, month, token) {
  const response = await fetch(`${API_BASE_URL}/blood-pressure/list?year=${year}&month=${month}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("혈압 월별 조회 실패");
  }

  const { data } = await response.json();
  return data;
}

// 혈압 단건 상세 조회
export async function getBloodPressure(bloodPressureSeq, token) {
  const response = await fetch(`${API_BASE_URL}/blood-pressure/${bloodPressureSeq}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("혈압 상세 조회 실패");
  }

  const { data } = await response.json();
  return data;
}

// 혈압 기록 수정. data는 BloodPressureUpdate 모양의 객체
export async function updateBloodPressure(bloodPressureSeq, data, token) {
  const response = await fetch(`${API_BASE_URL}/blood-pressure/update/${bloodPressureSeq}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("혈압 기록 수정 실패");
  }

  const { data: result } = await response.json();
  return result;
}
