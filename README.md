\# YOLO 라면 영양성분 스캐너



YOLO 모델로 봉지라면 제품을 인식하고, Oracle DB에서 해당 제품의 영양성분을 조회해 React 화면에 표시하는 프로젝트입니다.



\## 기술 스택



\- Frontend: React, Vite

\- Backend: FastAPI

\- AI Model: YOLO

\- Database: Oracle DB



\## 주요 기능



\- 웹캠 기반 라면 이미지 스캔

\- YOLO 모델 기반 봉지라면 제품 인식

\- Oracle DB 영양성분 조회

\- 현재 라면과 전체 라면 평균 영양성분 비교

\- YOLO 인식 실패와 DB 조회 실패 분리 처리

\- 자동 스캔 중복 요청 방지



\## 실행 방법



\### Backend



```bash

pip install -r requirements.txt

uvicorn fastapi\_server:app --reload --host 0.0.0.0 --port 8000

