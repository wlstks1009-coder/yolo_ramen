function Header() {
  return (
    <header className="header-card">
      <div>
        <p className="eyebrow">YOLO + Oracle DB</p>
        <h1>🤖 실시간 라면 영양 스캐너</h1>
        <p className="header-desc">
          카메라에 라면 봉지를 비추면 YOLO가 제품을 인식하고 Oracle DB에서
          영양성분을 조회합니다.
        </p>
      </div>
    </header>
  );
}

export default Header;