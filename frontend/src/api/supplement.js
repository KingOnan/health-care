import { api } from "./client";

// 등록·수정 요청 본문: 항목 데이터는 JSON 문자열로, 사진은 파일 그대로 멀티파트 폼에 담음
function toFormData(data, photoFile) {
  const formData = new FormData();
  formData.append("data", JSON.stringify(data));
  if (photoFile) {
    formData.append("photo", photoFile);
  }
  return formData;
}

// 영양제 항목 등록. data는 SupplementItemCreate 모양의 객체, photoFile은 선택(File | null)
export async function createSupplement(data, photoFile) {
  const response = await api.post("/supplement/create", toFormData(data, photoFile));
  return response.data.data;
}

// 영양제 항목 수정. data는 SupplementItemUpdate 모양의 객체, photoFile은 선택(File | null, 새로 첨부한 경우에만)
export async function updateSupplement(supplementItemSeq, data, photoFile) {
  const response = await api.post(`/supplement/update/${supplementItemSeq}`, toFormData(data, photoFile));
  return response.data.data;
}

// 영양제 항목 삭제
export async function deleteSupplement(supplementItemSeq) {
  await api.delete(`/supplement/${supplementItemSeq}`);
}

// 영양제 복용 상태 변경 (복용중 ⇄ 중지)
export async function updateSupplementStatus(supplementItemSeq, newStatus) {
  await api.post(`/supplement/update/status/${supplementItemSeq}`, { status: newStatus });
}

// 영양제 항목 목록 조회
export async function getSupplementItemList() {
  const response = await api.get("/supplement/list");
  return response.data.data;
}

// 영양제 복용 체크 (복용완료/건너뛰기)
export async function checkSupplement(supplementScheduleSeq, checkStatus) {
  await api.post(`/supplement/check/${supplementScheduleSeq}`, { status: checkStatus });
}

// 영양제 복용 체크 취소 (되돌리기)
export async function deleteSupplementLog(supplementLogSeq) {
  await api.delete(`/supplement/check/${supplementLogSeq}`);
}

// 영양제 오늘 복용 항목 목록 조회. 이미 시간대 분류/정렬/다음 항목 판단까지 서버가 끝낸 상태로 내려줌
export async function getSupplementItemTodayList() {
  const response = await api.get("/supplement/today/list");
  return response.data.data;
}

// 영양제 항목 사진 조회. 인증이 필요해서 <img src>로 바로 못 쓰고, 받아온 바이너리를 Blob URL로 변환해서 반환
export async function getSupplementItemPhotoUrl(supplementItemSeq) {
  const response = await api.get(`/supplement/${supplementItemSeq}/photo`, { responseType: "blob" });
  return URL.createObjectURL(response.data);
}

// 영양제 항목 상세 조회
export async function getSupplementItem(supplementItemSeq) {
  const response = await api.get(`/supplement/${supplementItemSeq}`);
  return response.data.data;
}
