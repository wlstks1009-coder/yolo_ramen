import io
import pymysql  # 오라클 연결 라이브러리
from fastapi import FastAPI, UploadFile, File
from ultralytics import YOLO
from PIL import Image
import config
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import json
from textwrap import dedent
from sqlalchemy import text

app = FastAPI()

# 1. YOLOv8 모델 로드
model = YOLO("yolo11n_ver2.pt")

engine = config.get_engine()


def get_ramen_info_from_db(yolo_class_name):
    """SQLAlchemy Engine을 사용해 마리아DB에서 라면 정보를 조회하는 함수"""

    query = dedent("""
                   SELECT 식품명,
                          에너지_KCAL,
                          단백질_G,
                          지방_G,
                          탄수화물_G,
                          당류_G,
                          나트륨_MG,
                          식품중량,
                          제조사명
                   FROM RAMEN_NUTRITION
                   WHERE YOLO_CLASS = :class_name
                   """)

    try:
        with engine.connect() as connection:
            result = connection.execute(text(query), {"class_name": yolo_class_name})
            row = result.fetchone()

        if row:
            return {
                "name": row[0],
                "calories": f"{row[1]} kcal",
                "protein": f"{row[2]} g",
                "fat": f"{row[3]} g",
                "carbs": f"{row[4]} g",
                "sugar": f"{row[5]} g",
                "sodium": f"{row[6]} mg",
                "weight": row[7],
                "brand": row[8]
            }
        return None

    except Exception as e:
        print(f"❌ 마리아DB(SQLAlchemy) 에러: {e}")
        return None


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    request_object_content = await file.read()

    # 경로 앞에 소문자 r을 붙여줍니다.
    # img_path = r'C:\Users\M\Desktop\프로젝트\신2.jpg'

    try:
        # 이 방식으로 열면 이미지 알맹이 데이터가 메모리에 그대로 로드됩니다.
        image_data = Image.open(io.BytesIO(request_object_content))
    except Exception as e:
        print(f"❌ 이미지 파일 자체를 읽지 못함: {e}")
        return {"success": False, "message": "파일을 읽을 수 없습니다."}

    # 2. ★ 중요: model('C:/...') 대신, 위에서 안전하게 열어둔 'image_data' 변수를 그대로 던집니다!
    # 이렇게 해야 YOLO가 경로를 다시 안 찾아가고 메모리에 로드된 사진을 그대로 분석합니다.
    results = model(image_data, conf=0.5, imgsz=640)

    detected_class = None
    confidence = 0.0

    for result in results:
        if len(result.boxes) > 0:
            box = result.boxes[0]
            class_id = int(box.cls[0])
            detected_class = model.names[class_id]
            confidence = float(box.conf[0])
            break

    print(f"▶ [2 단계] YOLO 검출 결과 -> 클래스: {detected_class}, 신뢰도: {confidence}")

    if detected_class:
        db_info = get_ramen_info_from_db(detected_class)

        print(f"▶ [3 단계] DB 조회 결과: {db_info}")

        if db_info:
            return {
                "success": True,
                "class_name": detected_class,
                "confidence": f"{confidence * 100:.1f}%",
                "info": db_info
            }

        else:
            return {"success": False, "message": f"YOLO는 [{detected_class}]로 인식했으나 DB 조회 실패"}

    return {"success": False, "message": "YOLO가 이미지에서 아무것도 인식하지 못함"}

    # return {"success": False, "message": "searching"}


# 프론트엔드에서 API 호출할 수 있게 CORS 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 중에는 전체 허용, 배포 시 프론트 주소로 제한 가능
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 현재 main.py와 같은 폴더에 있는 JSON 파일 읽기
BASE_DIR = Path(__file__).resolve().parent
JSON_PATH = BASE_DIR / "ramen_nutrition_summary.json"

with open(JSON_PATH, "r", encoding="utf-8") as f:
    nutrition_data = json.load(f)


@app.get("/")
def home():
    return {"message": "Ramen nutrition API is running"}


# 전체 라면 영양성분 데이터 반환
@app.get("/nutrition")
def get_all_nutrition():
    return nutrition_data


# YOLO 클래스명으로 특정 라면 영양성분 찾기
@app.get("/nutrition/{yolo_class}")
def get_nutrition_by_class(yolo_class: str):
    for item in nutrition_data:
        if item["YOLO_CLASS"] == yolo_class:
            return item

    return {
        "message": "해당 라면 정보를 찾을 수 없습니다.",
        "requestedClass": yolo_class
    }


# YOLO 예측 결과와 영양성분 연결용 API
@app.get("/nutrition-result/{detected_class}")
def get_nutrition_result(detected_class: str):
    selected = None

    for item in nutrition_data:
        if item["YOLO_CLASS"] == detected_class:
            selected = item
            break

    if selected is None:
        return {
            "success": False,
            "message": "탐지된 라면의 영양성분 정보를 찾을 수 없습니다.",
            "detectedClass": detected_class
        }

    avg_calories = sum(item["calories"] for item in nutrition_data) / len(nutrition_data)
    avg_sodium = sum(item["sodium"] for item in nutrition_data) / len(nutrition_data)

    messages = []

    if selected["calories"] > avg_calories:
        messages.append("칼로리가 라면 10종 평균보다 높은 편입니다.")
    else:
        messages.append("칼로리가 라면 10종 평균보다 낮은 편입니다.")

    if selected["sodium"] > avg_sodium:
        messages.append("나트륨이 라면 10종 평균보다 높은 편입니다.")
    else:
        messages.append("나트륨이 라면 10종 평균보다 낮은 편입니다.")

    return {
        "success": True,
        "detectedClass": detected_class,
        "nutrition": selected,
        "comparison": {
            "averageCalories": round(avg_calories, 1),
            "averageSodium": round(avg_sodium, 1),
            "messages": messages
        }
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

