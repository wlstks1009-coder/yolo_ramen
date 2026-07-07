import pandas as pd
import config
from sqlalchemy import text
from textwrap import dedent

csv_file_path = "ramen_data.csv"

# 1. CSV 파일 로드
try:
    df = pd.read_csv(csv_file_path, encoding='utf-8')
    print("CSV 파일을 성공적으로 불러왔습니다. (UTF-8)")
except Exception as e:
    try:
        df = pd.read_csv(csv_file_path, encoding='cp949')
        print("CSV 파일을 성공적으로 불러왔습니다. (CP949)")
    except Exception as e2:
        print(f"CSV 로드 실패: {e2}")
        exit()

df = df.where(pd.notnull(df), None)

# 2. CSV 파일의 원래 컬럼명 순서 (23개)
csv_columns = [
    '식품코드', 'YOLO_CLASS', '식품명', '영양성분함량기준량', '에너지(kcal)', '수분(g)',
    '단백질(g)', '지방(g)', '탄수화물(g)', '당류(g)', '식이섬유(g)', '칼슘(mg)',
    '철(mg)', '인(mg)', '칼륨(mg)', '나트륨(mg)', '비타민 A(μg RAE)', '비타민 C(mg)',
    '콜레스테롤(mg)', '포화지방산(g)', '트랜스지방산(g)', '식품중량', '제조사명'
]

# 필요한 컬럼만 추출
df_filtered = df[csv_columns].copy()

# ⭐ [핵심 변경 사항] 특수문자 괄호 때문에 꼬이지 않도록 딕셔너리의 Key값을 c0 ~ c22로 강제 매핑합니다.
# 이렇게 하면 SQLAlchemy가 파싱할 때 에러가 절대 나지 않습니다.
rename_dict = {old_col: f"c{i}" for i, old_col in enumerate(csv_columns)}
df_renamed = df_filtered.rename(columns=rename_dict)

# 데이터프레임을 딕셔너리 리스트로 변환 (Key가 c0, c1, c2... 형태가 됨)
data_rows = df_renamed.to_dict(orient='records')

# 3. 바뀐 Key(c0 ~ c22)에 맞춘 안전한 INSERT 쿼리문
insert_query = dedent("""
    INSERT INTO RAMEN_NUTRITION (
        식품코드, YOLO_CLASS, 식품명, 영양성분함량기준량, 에너지_KCAL, 수분_G, 
        단백질_G, 지방_G, 탄수화물_G, 당류_G, 식이섬유_G, 칼슘_MG, 
        철_MG, 인_MG, 칼륨_MG, 나트륨_MG, 비타민A_UG_RAE, 비타민C_MG, 
        콜레스테롤_MG, 포화지방산_G, 트랜스지방산_G, 식품중량, 제조사명
    ) 
    VALUES (
        :c0, :c1, :c2, :c3, :c4, :c5, 
        :c6, :c7, :c8, :c9, :c10, :c11, 
        :c12, :c13, :c14, :c15, :c16, :c17, 
        :c18, :c19, :c20, :c21, :c22
    )
""")

# 4. 데이터베이스 적재 실행
engine = config.get_engine()

try:
    print("마리아DB 데이터베이스 연결 중...")
    with engine.connect() as connection:
        with connection.begin():
            connection.execute(text(insert_query), data_rows)
    print(f"\n🎉 성공: 총 {len(data_rows)}개의 라면 데이터가 마리아DB 테이블에 완벽하게 적재되었습니다!")

except Exception as e:
    print(f"❌ 마리아DB 적재 중 오류 발생: {e}")