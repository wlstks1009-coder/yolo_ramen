import StatusBadge from "./StatusBadge.jsx";

function ScannerPanel({
  videoRef,
  canvasRef,
  previewImage,
  status,
  statusMessage,
  isScanning,
  onStart,
  onStop,
  onRestart,
}) {
  return (
    <section className="panel scanner-panel">
      <div className="panel-title-row">
        <div>
          <h2>📷 실시간 스캔</h2>
          <p>라면 봉지를 카메라 중앙에 맞춰주세요.</p>
        </div>

        <StatusBadge status={status} />
      </div>

      <div className="scanner-window">
        <video
            ref={videoRef}
            className={`scanner-media video-layer ${previewImage ? "media-hidden" : ""}`}
            autoPlay
            playsInline
            muted
        />

        {previewImage && (
            <img
            className="scanner-media preview-layer"
            src={previewImage}
            alt="인식된 순간"
            />
        )}

        <canvas ref={canvasRef} className="hidden-canvas" />
    </div>

      <p className="status-message">{statusMessage}</p>

      <div className="button-row">
        {!isScanning && !previewImage && (
          <button className="primary-button" onClick={onStart}>
            스캔 시작
          </button>
        )}

        {isScanning && (
          <button className="danger-button" onClick={onStop}>
            스캔 중지
          </button>
        )}

        {previewImage && (
          <button className="primary-button" onClick={onRestart}>
            다시 스캔하기
          </button>
        )}
      </div>
    </section>
  );
}

export default ScannerPanel;