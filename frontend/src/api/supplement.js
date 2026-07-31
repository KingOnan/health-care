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

  return response.json();
}

// 영양제 항목 목록 조회
export async function getSupplementItemList(token) {
  const response = await fetch(`${API_BASE_URL}/supplement/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("영양제 목록 조회 실패");
  }

  return response.json();
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

  return response.json();
}
