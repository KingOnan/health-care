const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 영양제 항목 등록. data는 SupplementItemCreate 모양의 객체, photoFile은 선택(File | null)
export async function createSupplement(data, photoFile, token) {
  const formData = new FormData();
  formData.append("data", JSON.stringify(data));
  if (photoFile) {
    formData.append("photo", photoFile);
  }

  const response = await fetch(`${API_BASE_URL}/supplement/create`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("영양제 등록 실패");
  }

  const responseBody = await response.json();
  return responseBody.data;
}

// 영양제 항목 수정. data는 SupplementItemUpdate 모양의 객체, photoFile은 선택(File | null, 새로 첨부한 경우에만)
export async function updateSupplement(supplementItemSeq, data, photoFile, token) {
  const formData = new FormData();
  formData.append("data", JSON.stringify(data));
  if (photoFile) {
    formData.append("photo", photoFile);
  }

  const response = await fetch(`${API_BASE_URL}/supplement/update/${supplementItemSeq}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("영양제 수정 실패");
  }

  const responseBody = await response.json();
  return responseBody.data;
}

// 영양제 항목 삭제
export async function deleteSupplement(supplementItemSeq, token) {
  const response = await fetch(`${API_BASE_URL}/supplement/${supplementItemSeq}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("영양제 삭제 실패");
  }

  const { data } = await response.json();
  return data;
}

// 영양제 복용 상태 변경 (복용중 ⇄ 중지)
export async function updateSupplementStatus(supplementItemSeq, newStatus, token) {
  const response = await fetch(`${API_BASE_URL}/supplement/update/status/${supplementItemSeq}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status: newStatus }),
  });

  if (!response.ok) {
    throw new Error("영양제 복용 상태 변경 실패");
  }
}

// 영양제 항목 목록 조회
export async function getSupplementItemList(token) {
  const response = await fetch(`${API_BASE_URL}/supplement/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("영양제 목록 조회 실패");
  }

  const { data } = await response.json();
  return data;
}

// 영양제 항목 사진 조회. 인증이 필요해서 <img src>로 바로 못 쓰고, 받아온 바이너리를 Blob URL로 변환해서 반환
export async function getSupplementItemPhotoUrl(supplementItemSeq, token) {
  const response = await fetch(`${API_BASE_URL}/supplement/${supplementItemSeq}/photo`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("영양제 사진 조회 실패");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

// 영양제 항목 상세 조회
export async function getSupplementItem(supplementItemSeq, token) {
  const response = await fetch(`${API_BASE_URL}/supplement/${supplementItemSeq}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("영양제 상세 조회 실패");
  }

  const { data } = await response.json();
  return data;
}
