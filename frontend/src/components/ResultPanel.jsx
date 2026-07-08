import { useState, useEffect } from "react";
import NutritionCards from "./NutritionCards.jsx";

function ResultPanel({ result, errorMessage, setResult }) {
  const [feedbackState, setFeedbackState] = useState(null); // null, 'selecting', 'done'
  const [selectedRamen, setSelectedRamen] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // 중복 클릭 방지 상태

  const ramenList = ["삼양라면", "신라면", "안성탕면", "오뚜기 참깨라면", "진라면(순한맛)", "올리브짜파게티", "짜슐랭", "짜짜로니", "배홍동비빔면", "팔도비빔면", "기타라면"];

  // 스캔 결과가 바뀌면 피드백 상태 초기화
  useEffect(() => {
    setFeedbackState(null);
    setSelectedRamen("");
    setIsSubmitting(false);
  }, [result]);

  const handleFeedback = async (isCorrect) => {
    if (isCorrect) {
      // "네"를 눌렀을 때도 서버에 저장하고 싶다면 여기서 호출
      setFeedbackState('done');
    } else {
      setFeedbackState('selecting');
    }
  };

  const handleCorrectionSubmit = async () => {
    if (!selectedRamen) return alert("라면을 선택해주세요!");

    setIsSubmitting(true); // 요청 시작 시 버튼 비활성화

    const payload = {
        detected_class: result.class_name,
        detected_name: result.info.name,
        is_correct: false,
        corrected_ramen: selectedRamen,
        confidence: parseFloat(result.confidence) || 0.0
    };

    try {
        // 1. 피드백 저장
        await fetch("http://localhost:8000/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        // 2. 새로운 데이터 가져오기
        const res = await fetch(`http://localhost:8000/nutrition-by-name/${encodeURIComponent(selectedRamen)}`);
        const newData = await res.json();

        // 3. UI 업데이트
        if (!newData.error) {
            setResult(prev => ({ ...prev, info: newData }));
            setFeedbackState('done');
        } else {
            alert("라면 정보를 가져오는 데 실패했습니다.");
        }
    } catch (e) {
        alert("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
        setIsSubmitting(false); // 완료 후 버튼 활성화
    }
  };

  if (errorMessage) return <section className="panel result-panel"><h2>⚠️ 확인 필요</h2><p>{errorMessage}</p></section>;
  if (!result || !result.success) return <section className="panel result-panel"><h2>🍜 인식 결과</h2><p>스캔을 시작해주세요.</p></section>;

  return (
    <section className="panel result-panel">
      <h2>인식된 제품: {result.info.name}</h2>
      <NutritionCards info={result.info} />

      {/* 개선된 UI 피드백 영역 */}
      <div className="feedback-container">
    {feedbackState === null && (
      <div className="action-box">
        <p style={{ fontWeight: 'bold' }}>이 라면이 맞나요?</p>
        <div className="button-row-full">
          <button className="btn-yes" onClick={() => handleFeedback(true)}>네, 맞아요!</button>
          <button className="btn-no" onClick={() => handleFeedback(false)}>아니오, 틀려요</button>
        </div>
      </div>
    )}

        {feedbackState === 'selecting' && (
          <div className="action-box">
            <select className="ramen-select" onChange={(e) => setSelectedRamen(e.target.value)}>
              <option value="">라면 선택</option>
              {ramenList.map(r => <option key={r} value={r}>{r}</option>)}
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

        {feedbackState === 'done' && <div className="success-msg">✅ 정보가 업데이트되었습니다.</div>}
      </div>
    </section>
  );
}
export default ResultPanel;