function NutritionCards({ info }) {
  if (!info) {
    return null;
  }

  const cards = [
    {
      label: "열량",
      value: info.calories || "-",
      icon: "🔥",
    },
    {
      label: "나트륨",
      value: info.sodium || "-",
      icon: "🧂",
    },
    {
      label: "탄수화물",
      value: info.carbs || "-",
      icon: "🍚",
    },
    {
      label: "단백질",
      value: info.protein || "-",
      icon: "💪",
    },
  ];

  return (
    <div className="nutrition-card-grid">
      {cards.map((card) => (
        <div className="nutrition-card" key={card.label}>
          <span className="nutrition-icon">{card.icon}</span>
          <p>{card.label}</p>
          <strong>{card.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default NutritionCards;