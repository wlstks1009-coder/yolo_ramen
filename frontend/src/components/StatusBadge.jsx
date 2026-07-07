function StatusBadge({ status }) {
  const statusMap = {
    idle: "스캔 대기",
    scanning: "스캔 중",
    success: "인식 성공",
    "db-error": "DB 조회 실패",
    error: "오류 발생",
  };

  return (
    <span className={`status-badge ${status}`}>
      {statusMap[status] || "상태 확인"}
    </span>
  );
}

export default StatusBadge;