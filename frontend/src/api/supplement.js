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
