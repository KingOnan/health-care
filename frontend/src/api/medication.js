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

// 약 항목 등록. data는 MedicationItemCreate 모양의 객체, photoFile은 선택(File | null)
export async function createMedication(data, photoFile) {
  const response = await api.post("/medication/create", toFormData(data, photoFile));
  return response.data.data;
}

// 약 항목 수정. data는 MedicationItemUpdate 모양의 객체, photoFile은 선택(File | null, 새로 첨부한 경우에만)
export async function updateMedication(medicationItemSeq, data, photoFile) {
  const response = await api.post(`/medication/update/${medicationItemSeq}`, toFormData(data, photoFile));
  return response.data.data;
}

// 약 항목 삭제
export async function deleteMedication(medicationItemSeq) {
  await api.delete(`/medication/${medicationItemSeq}`);
}

// 약 복용 상태 변경 (복용중 / 중지 / 종료)
export async function updateMedicationStatus(medicationItemSeq, newStatus) {
  await api.post(`/medication/update/status/${medicationItemSeq}`, { status: newStatus });
}

// 약 항목 목록 조회
export async function getMedicationItemList() {
  const response = await api.get("/medication/list");
  return response.data.data;
}

// 약 복용 체크 (복용완료/건너뛰기)
export async function checkMedication(medicationScheduleSeq, checkStatus) {
  await api.post(`/medication/check/${medicationScheduleSeq}`, { status: checkStatus });
}

// 약 복용 체크 취소 (되돌리기)
export async function deleteMedicationLog(medicationLogSeq) {
  await api.delete(`/medication/check/${medicationLogSeq}`);
}

// 약 오늘 복용 항목 목록 조회. 이미 시간대 분류/정렬/다음 항목 판단까지 서버가 끝낸 상태로 내려줌
export async function getMedicationItemTodayList() {
  const response = await api.get("/medication/today/list");
  return response.data.data;
}

// 약 항목 사진 조회. 인증이 필요해서 <img src>로 바로 못 쓰고, 받아온 바이너리를 Blob URL로 변환해서 반환
export async function getMedicationItemPhotoUrl(medicationItemSeq) {
  const response = await api.get(`/medication/${medicationItemSeq}/photo`, { responseType: "blob" });
  return URL.createObjectURL(response.data);
}

// 약 항목 상세 조회
export async function getMedicationItem(medicationItemSeq) {
  const response = await api.get(`/medication/${medicationItemSeq}`);
  return response.data.data;
}
