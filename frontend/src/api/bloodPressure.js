import { api } from "./client";

// 혈압 기록 등록. data는 BloodPressureCreate 모양의 객체
export async function createBloodPressure(data) {
  const response = await api.post("/blood-pressure/create", data);
  return response.data.data;
}

// 혈압 월별 목록 조회
export async function getBloodPressureList(year, month) {
  const response = await api.get("/blood-pressure/list", { params: { year, month } });
  return response.data.data;
}

// 혈압 단건 상세 조회
export async function getBloodPressure(bloodPressureSeq) {
  const response = await api.get(`/blood-pressure/${bloodPressureSeq}`);
  return response.data.data;
}

// 혈압 기록 수정. data는 BloodPressureUpdate 모양의 객체
export async function updateBloodPressure(bloodPressureSeq, data) {
  const response = await api.post(`/blood-pressure/update/${bloodPressureSeq}`, data);
  return response.data.data;
}

// 혈압 기록 삭제
export async function deleteBloodPressure(bloodPressureSeq) {
  await api.delete(`/blood-pressure/${bloodPressureSeq}`);
}
