import NutritionCards from "./NutritionCards.jsx";

function ResultPanel({ result, errorMessage }) {
  if (errorMessage) {
    return (
      <section className="panel result-panel">
        <h2>⚠️ 확인 필요</h2>
        <div className="empty-result error-box">
          <p>{errorMessage}</p>
        </div>
      </section>
    );
  }

  if (!result || !result.success) {
    return (
      <section className="panel result-panel">
        <h2>🍜 인식 결과</h2>
        <div className="empty-result">
          <p>아직 인식된 라면이 없습니다.</p>
          <span>스캔을 시작하면 결과가 여기에 표시됩니다.</span>
        </div>
      </section>
    );
  }

  const info = result.info;

  return (
    <section className="panel result-panel">
      <div className="result-header">
        <div>
          <p className="result-label">인식된 제품</p>
          <h2>{info.name}</h2>
          <p className="brand-text">
            {info.brand || "제조사 정보 없음"} · {info.weight || "중량 정보 없음"}
          </p>
        </div>

        <div className="confidence-box">
          <span>신뢰도</span>
          <strong>{result.confidence}</strong>
        </div>
      </div>

      <div className="class-name-box">
        YOLO class: <strong>{result.class_name}</strong>
      </div>

      <NutritionCards info={info} />
    </section>
  );
}

export default ResultPanel;