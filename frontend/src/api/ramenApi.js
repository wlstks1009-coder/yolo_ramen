const API_BASE_URL = "http://localhost:8000";

export async function predictRamenImage(blob) {
  const formData = new FormData();

  // FastAPI의 predict 함수가 file이라는 이름으로 받기 때문에 file로 보내야 함
  formData.append("file", blob, "scan.jpg");

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("FastAPI 서버 응답 오류");
  }

  return response.json();
}