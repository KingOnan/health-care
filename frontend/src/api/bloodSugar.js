import { api } from "./client";

// 혈당 기록 등록. data는 BloodSugarCreate 모양의 객체
export async function createBloodSugar(data) {
  const response = await api.post("/blood-sugar/create", data);
  return response.data.data;
}

// 혈당 월별 목록 조회. checkTiming("공복" / "식후 2시간")을 넘기면 해당 시기만, 생략하면 전체
export async function getBloodSugarList(year, month, checkTiming) {
  const params = { year, month };
  if (checkTiming) params.check_timing = checkTiming;

  const response = await api.get("/blood-sugar/list", { params });
  return response.data.data;
}

// 혈당 단건 상세 조회
export async function getBloodSugar(bloodSugarSeq) {
  const response = await api.get(`/blood-sugar/${bloodSugarSeq}`);
  return response.data.data;
}

// 혈당 기록 수정. data는 BloodSugarUpdate 모양의 객체
export async function updateBloodSugar(bloodSugarSeq, data) {
  const response = await api.post(`/blood-sugar/update/${bloodSugarSeq}`, data);
  return response.data.data;
}

// 혈당 기록 삭제
export async function deleteBloodSugar(bloodSugarSeq) {
  await api.delete(`/blood-sugar/${bloodSugarSeq}`);
}
