const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 약 항목 등록. data는 MedicationItemCreate 모양의 객체, photoFile은 선택(File | null)
export async function createMedication(data, photoFile, token) {
  const formData = new FormData();
  formData.append("data", JSON.stringify(data));
  if (photoFile) {
    formData.append("photo", photoFile);
  }

  const response = await fetch(`${API_BASE_URL}/medication/create`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("약 등록 실패");
  }

  const responseBody = await response.json();
  return responseBody.data;
}

// 약 항목 수정. data는 MedicationItemUpdate 모양의 객체, photoFile은 선택(File | null, 새로 첨부한 경우에만)
export async function updateMedication(medicationItemSeq, data, photoFile, token) {
  const formData = new FormData();
  formData.append("data", JSON.stringify(data));
  if (photoFile) {
    formData.append("photo", photoFile);
  }

  const response = await fetch(`${API_BASE_URL}/medication/update/${medicationItemSeq}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("약 수정 실패");
  }

  const responseBody = await response.json();
  return responseBody.data;
}

// 약 항목 삭제
export async function deleteMedication(medicationItemSeq, token) {
  const response = await fetch(`${API_BASE_URL}/medication/${medicationItemSeq}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("약 삭제 실패");
  }

  const { data } = await response.json();
  return data;
}

// 약 복용 상태 변경 (복용중 / 중지 / 종료)
export async function updateMedicationStatus(medicationItemSeq, newStatus, token) {
  const response = await fetch(`${API_BASE_URL}/medication/update/status/${medicationItemSeq}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status: newStatus }),
  });

  if (!response.ok) {
    throw new Error("약 복용 상태 변경 실패");
  }
}

// 약 항목 목록 조회
export async function getMedicationItemList(token) {
  const response = await fetch(`${API_BASE_URL}/medication/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("약 목록 조회 실패");
  }

  const { data } = await response.json();
  return data;
}

// 약 복용 체크 (복용완료/건너뛰기)
export async function checkMedication(medicationScheduleSeq, checkStatus, token) {
  const response = await fetch(`${API_BASE_URL}/medication/check/${medicationScheduleSeq}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status: checkStatus }),
  });

  if (!response.ok) {
    throw new Error("약 복용 체크 실패");
  }
}

// 약 복용 체크 취소 (되돌리기)
export async function deleteMedicationLog(medicationLogSeq, token) {
  const response = await fetch(`${API_BASE_URL}/medication/check/${medicationLogSeq}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("약 복용 체크 취소 실패");
  }
}

// 약 오늘 복용 항목 목록 조회. 이미 시간대 분류/정렬/다음 항목 판단까지 서버가 끝낸 상태로 내려줌
export async function getMedicationItemTodayList(token) {
  const response = await fetch(`${API_BASE_URL}/medication/today/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("오늘 복용 항목 조회 실패");
  }

  const { data } = await response.json();
  return data;
}

// 약 항목 사진 조회. 인증이 필요해서 <img src>로 바로 못 쓰고, 받아온 바이너리를 Blob URL로 변환해서 반환
export async function getMedicationItemPhotoUrl(medicationItemSeq, token) {
  const response = await fetch(`${API_BASE_URL}/medication/${medicationItemSeq}/photo`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("약 사진 조회 실패");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

// 약 항목 상세 조회
export async function getMedicationItem(medicationItemSeq, token) {
  const response = await fetch(`${API_BASE_URL}/medication/${medicationItemSeq}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("약 상세 조회 실패");
  }

  const { data } = await response.json();
  return data;
}
