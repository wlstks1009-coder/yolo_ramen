import { useEffect, useState } from "react";

function FeedbackPanel({ result, setResult }) {
  const [feedbackState, setFeedbackState] = useState(null);
  const [selectedRamen, setSelectedRamen] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ramenList = [
    "삼양라면",
    "신라면",
    "안성탕면",
    "오뚜기 참깨라면",
    "진라면(순한맛)",
    "올리브짜파게티",
    "짜슐랭",
    "짜짜로니",
    "배홍동비빔면",
    "팔도비빔면",
    "기타라면",
  ];

  useEffect(() => {
    setFeedbackState(null);
    setSelectedRamen("");
    setIsSubmitting(false);
  }, [result]);

  if (!result || !result.success) {
    return (
      <section className="panel feedback-panel">
        <h2>이 라면이 맞나요?</h2>
        <div className="empty-text feedback-empty">
          라면 인식 후 확인 버튼이 표시됩니다.
        </div>
      </section>
    );
  }

  const handleCorrect = () => {
    setFeedbackState("done");
  };

  const handleWrong = () => {
    setFeedbackState("selecting");
  };

  const handleCorrectionSubmit = async () => {
    if (!selectedRamen) {
      alert("라면을 선택해주세요!");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      detected_class: result.class_name,
      detected_name: result.info.name,
      is_correct: false,
      corrected_ramen: selectedRamen,
      confidence: parseFloat(result.confidence) || 0.0,
    };

    try {
      await fetch("http://localhost:8000/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await fetch(
        `http://localhost:8000/nutrition-by-name/${encodeURIComponent(
          selectedRamen
        )}`
      );

      const newData = await res.json();

      if (!newData.error) {
        setResult((prev) => ({ ...prev, info: newData }));
        setFeedbackState("done");
      } else {
        alert("라면 정보를 가져오는 데 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="panel feedback-panel">
      <h2>이 라면이 맞나요?</h2>

      {feedbackState === null && (
        <div className="feedback-card-body">
          <p>
            인식된 라면은
            <br />
            <strong>{result.info?.name}</strong>
            입니다.
          </p>

          <div className="feedback-button-column">
            <button className="btn-yes" onClick={handleCorrect}>
              네, 맞아요
            </button>

            <button className="btn-no" onClick={handleWrong}>
              아니오
            </button>
          </div>
        </div>
      )}

      {feedbackState === "selecting" && (
        <div className="feedback-card-body">
          <select
            className="ramen-select"
            value={selectedRamen}
            onChange={(e) => setSelectedRamen(e.target.value)}
          >
            <option value="">라면 선택</option>
            {ramenList.map((ramen) => (
              <option key={ramen} value={ramen}>
                {ramen}
              </option>
            ))}
          </select>

          <button
            className="btn-apply"
            onClick={handleCorrectionSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "변경 적용하기"}
          </button>
        </div>
      )}

      {feedbackState === "done" && (
        <div className="feedback-card-body">
          <p className="success-msg">확인되었습니다.</p>
        </div>
      )}
    </section>
  );
}

export default FeedbackPanel;