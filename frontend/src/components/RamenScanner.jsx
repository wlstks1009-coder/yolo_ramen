import { useEffect, useRef, useState } from "react";
import { predictRamenImage } from "../api/ramenApi.js";
import Header from "./Header.jsx";
import ScannerPanel from "./ScannerPanel.jsx";
import ResultPanel from "./ResultPanel.jsx";
import NutritionTable from "./NutritionTable.jsx";
import AverageCompareBars from "./AverageCompareBars.jsx";
import FeedbackPanel from "./FeedbackPanel.jsx";

function RamenScanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const processingRef = useRef(false);
  const streamRef = useRef(null);

  const lastClassRef = useRef(null);
  const sameClassCountRef = useRef(0);
  const REQUIRED_SAME_CLASS_COUNT = 3;

  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("스캔 시작 버튼을 눌러주세요.");
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [historyList, setHistoryList] = useState([]);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error(error);
      setScanStatus("error");
      setStatusMessage("카메라를 실행할 수 없습니다. 브라우저 권한을 확인해주세요.");
      setErrorMessage("카메라 접근 권한이 없거나 카메라 장치를 사용할 수 없습니다.");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  function stopScan() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    processingRef.current = false;
    setIsScanning(false);
  }

  function resetResult() {
    setResult(null);
    setErrorMessage("");
    setScanStatus("idle");
    setStatusMessage("스캔 시작 버튼을 눌러주세요.");

    lastClassRef.current = null;
    sameClassCountRef.current = 0;

    setPreviewImage((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  function setCapturedPreview(blob) {
    setPreviewImage((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(blob);
    });
  }

  function addHistory(data) {
    const now = new Date();

    const item = {
      id: `${data.class_name}-${now.getTime()}`,
      name: data.info?.name || data.class_name,
      confidence: data.confidence || "-",
      time: now.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setHistoryList((prev) => [item, ...prev].slice(0, 5));
  }

  function captureFrameToBlob() {
    return new Promise((resolve, reject) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) {
        reject(new Error("비디오 또는 캔버스가 준비되지 않았습니다."));
        return;
      }

      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        reject(new Error("카메라 영상이 아직 준비되지 않았습니다."));
        return;
      }

      const width = video.videoWidth;
      const height = video.videoHeight;

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("캔버스 컨텍스트를 가져오지 못했습니다."));
        return;
      }

      context.drawImage(video, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("이미지 캡처에 실패했습니다."));
            return;
          }

          resolve(blob);
        },
        "image/jpeg",
        0.92
      );
    });
  }

  async function scanOnce() {
    if (processingRef.current) return;

    processingRef.current = true;

    try {
      const blob = await captureFrameToBlob();
      const data = await predictRamenImage(blob);

      if (data.success) {
        const detectedClass = data.class_name;
        const confidenceNumber = parseFloat(String(data.confidence).replace("%", ""));

        if (confidenceNumber < 70) {
          setScanStatus("scanning");
          setStatusMessage(`${detectedClass} 감지됨, 하지만 신뢰도 ${data.confidence}로 낮아 계속 스캔합니다.`);
          return;
        }

        if (lastClassRef.current === detectedClass) {
          sameClassCountRef.current += 1;
        } else {
          lastClassRef.current = detectedClass;
          sameClassCountRef.current = 1;
        }

        setScanStatus("scanning");
        setStatusMessage(`${detectedClass} 감지 중... (${sameClassCountRef.current}/${REQUIRED_SAME_CLASS_COUNT}) / 신뢰도 ${data.confidence}`);

        if (sameClassCountRef.current < REQUIRED_SAME_CLASS_COUNT) return;

        stopScan();
        setCapturedPreview(blob);
        setResult(data);
        addHistory(data);
        setErrorMessage("");
        setScanStatus("success");
        setStatusMessage("라면 인식 및 DB 조회에 성공했습니다.");
        return;
      }

      setScanStatus("scanning");
      setStatusMessage("라면을 찾는 중입니다. 봉지를 카메라 중앙에 맞춰주세요.");
    } catch (error) {
      console.error(error);
      stopScan();
      setScanStatus("error");
      setStatusMessage("스캔 중 오류가 발생했습니다.");
      setErrorMessage(error.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      processingRef.current = false;
    }
  }

  function startScan() {
    stopScan();
    resetResult();

    setIsScanning(true);
    setScanStatus("scanning");
    setStatusMessage("라면 봉지를 카메라 중앙에 맞춰주세요.");

    setTimeout(() => {
      scanOnce();
      intervalRef.current = setInterval(scanOnce, 700);
    }, 500);
  }

  function restartScan() {
    resetResult();
    setTimeout(startScan, 200);
  }

  useEffect(() => {
    startCamera();

    return () => {
      stopScan();
      stopCamera();

      setPreviewImage((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, []);

  return (
    <div className="app-shell">
      <Header />

      <main className="reference-page">
        <div className="cell cell-scan">
          <ScannerPanel
            videoRef={videoRef}
            canvasRef={canvasRef}
            previewImage={previewImage}
            status={scanStatus}
            statusMessage={statusMessage}
            isScanning={isScanning}
            onStart={startScan}
            onStop={stopScan}
            onRestart={restartScan}
          />
        </div>

        <div className="cell cell-result">
          <ResultPanel
            result={result}
            errorMessage={errorMessage}
            previewImage={previewImage}
          />
        </div>

        <div className="cell cell-detail">
          <NutritionTable result={result} />
        </div>

        <div className="cell cell-feedback">
          <FeedbackPanel result={result} setResult={setResult} />
        </div>

        <section className="panel cell cell-history">
          <div className="section-title-row">
            <h2>최근 인식 기록</h2>
            <span>{historyList.length}개</span>
          </div>

          {historyList.length === 0 ? (
            <p className="empty-text compact">아직 인식 기록이 없습니다.</p>
          ) : (
            <div className="history-list">
              {historyList.map((item) => (
                <div className="history-item" key={item.id}>
                  <div className="history-thumb">🍜</div>

                  <div className="history-info">
                    <strong>{item.name}</strong>
                    <span>{item.time}</span>
                  </div>

                  <span className="history-confidence">{item.confidence}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="cell cell-compare">
          <AverageCompareBars result={result} />
        </div>
      </main>
    </div>
);
}

export default RamenScanner;
