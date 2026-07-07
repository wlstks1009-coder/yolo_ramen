function NutritionTable({ result }) {
  if (!result || !result.success) {
    return (
      <section className="panel">
        <h2>📋 상세 영양성분</h2>
        <p className="empty-text">라면 인식 성공 후 상세 영양성분이 표시됩니다.</p>
      </section>
    );
  }

  const info = result.info;

  const rows = [
    ["제품명", info.name],
    ["제조사", info.brand],
    ["식품중량", info.weight],
    ["열량", info.calories],
    ["탄수화물", info.carbs],
    ["당류", info.sugar],
    ["단백질", info.protein],
    ["지방", info.fat],
    ["나트륨", info.sodium],
  ];

  return (
    <section className="panel">
      <h2>📋 상세 영양성분 (100g 기준)</h2>

      <table className="nutrition-table">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th>{label}</th>
              <td>{value || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default NutritionTable;