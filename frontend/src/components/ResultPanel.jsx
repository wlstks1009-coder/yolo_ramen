function ResultPanel({ result, errorMessage, previewImage }) {
  if (errorMessage) {
    return (
      <section className="panel result-panel">
        <h2>확인 필요</h2>

        <div className="empty-result error-box">
          <p>스캔 중 문제가 발생했습니다.</p>
          <span>{errorMessage}</span>
        </div>
      </section>
    );
  }

  if (!result || !result.success) {
    return (
      <section className="panel result-panel">
        <h2>인식 결과</h2>

        <div className="empty-result">
          <p>아직 인식된 라면이 없습니다.</p>
          <span>왼쪽에서 스캔을 시작하면 결과가 표시됩니다.</span>
        </div>
      </section>
    );
  }

  const info = result.info;

  return (
    <section className="panel result-panel">
      <div className="section-title-row">
        <h2>인식 결과</h2>
        <span className="success-chip">인식 완료</span>
      </div>

      <div className="result-hero result-hero-simple">
        <div className="result-image-box">
          {previewImage ? (
            <img src={previewImage} alt="인식된 라면" />
          ) : (
            <span>🍜</span>
          )}
        </div>

        <div className="result-main-info">
          <p className="result-label">인식된 라면</p>
          <h3>{info.name}</h3>

          <p className="brand-text">
            {info.brand || "제조사 정보 없음"} · {info.weight || "중량 정보 없음"}
          </p>

          <div className="confidence-area">
            <div>
              <span>신뢰도</span>
              <strong>{result.confidence}</strong>
            </div>

            <div className="confidence-track">
              <div
                className="confidence-fill"
                style={{
                  width: `${
                    parseFloat(String(result.confidence).replace("%", "")) || 0
                  }%`,
                }}
              />
            </div>
          </div>

          <p className="class-name-text">
            YOLO 클래스명: <strong>{result.class_name}</strong>
          </p>
        </div>
      </div>
    </section>
  );
}

export default ResultPanel;