function extractNumber(value) {
  if (!value) return 0;

  const number = parseFloat(String(value).replace(/[^\d.]/g, ""));
  return Number.isNaN(number) ? 0 : number;
}

function getCompareMessage(current, average) {
  if (!average || average === 0) {
    return "평균 데이터 없음";
  }

  const diffRate = ((current - average) / average) * 100;
  const absRate = Math.abs(diffRate).toFixed(1);

  if (diffRate > 0) {
    return `평균보다 ${absRate}% 높음`;
  }

  if (diffRate < 0) {
    return `평균보다 ${absRate}% 낮음`;
  }

  return "평균과 동일";
}

function AverageCompareBars({ result }) {
  if (!result || !result.success || !result.average) {
    return (
      <section className="panel">
        <h2>📊 전체 라면 평균 비교</h2>
        <p className="empty-text">
          라면 인식 성공 후 전체 라면 평균과 비교됩니다.
        </p>
      </section>
    );
  }

  const info = result.info;
  const average = result.average;

  const items = [
    {
      label: "열량",
      current: extractNumber(info.calories),
      average: average.calories,
      unit: "kcal",
    },
    {
      label: "탄수화물",
      current: extractNumber(info.carbs),
      average: average.carbs,
      unit: "g",
    },
    {
      label: "당류",
      current: extractNumber(info.sugar),
      average: average.sugar,
      unit: "g",
    },
    {
      label: "단백질",
      current: extractNumber(info.protein),
      average: average.protein,
      unit: "g",
    },
    {
      label: "지방",
      current: extractNumber(info.fat),
      average: average.fat,
      unit: "g",
    },
    {
      label: "나트륨",
      current: extractNumber(info.sodium),
      average: average.sodium,
      unit: "mg",
    },
  ];

  return (
    <section className="panel">
      <h2>📊 전체 라면 평균 비교</h2>
      <p className="sub-text">
        DB에 저장된 전체 라면 평균값과 현재 인식된 라면을 비교합니다.
      </p>

      <div className="vertical-compare-grid">
        {items.map((item) => {
          const maxValue = Math.max(item.current, item.average, 1);

          const currentHeight = (item.current / maxValue) * 100;
          const averageHeight = (item.average / maxValue) * 100;

          const isHigh = item.current > item.average;

          return (
            <div className="vertical-compare-card" key={item.label}>
              <div className="vertical-card-header">
                <strong>{item.label}</strong>
                <span className={isHigh ? "compare-high" : "compare-low"}>
                  {getCompareMessage(item.current, item.average)}
                </span>
              </div>

              <div className="vertical-chart">
                <div className="vertical-bar-group">
                  <div className="bar-value">
                    {item.current}
                    {item.unit}
                  </div>

                  <div className="bar-track">
                    <div
                      className={`vertical-bar current-bar ${
                        isHigh ? "high" : "low"
                      }`}
                      style={{ height: `${currentHeight}%` }}
                    />
                  </div>

                  <div className="bar-label">현재</div>
                </div>

                <div className="vertical-bar-group">
                  <div className="bar-value">
                    {item.average}
                    {item.unit}
                  </div>

                  <div className="bar-track">
                    <div
                      className="vertical-bar average-bar"
                      style={{ height: `${averageHeight}%` }}
                    />
                  </div>

                  <div className="bar-label">평균</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default AverageCompareBars;