# csv_to_oracle.py

import pandas as pd
import oracledb
import config

csv_file_path = "ramen_data.csv"

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

connection = None
cursor = None
try:
    connection = oracledb.connect(
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        dsn=config.DB_DSN
    )
    cursor = connection.cursor()
    print("오라클 데이터베이스 연결 성공!")

    # 3. 23개 컬럼에 맞춘 INSERT 쿼리문 (:1부터 :23까지)
    insert_query = """
                   INSERT INTO RAMEN_NUTRITION (식품코드, YOLO_CLASS, 식품명, 영양성분함량기준량, 에너지_KCAL, 수분_G, \
                                                단백질_G, 지방_G, 탄수화물_G, 당류_G, 식이섬유_G, 칼슘_MG, \
                                                철_MG, 인_MG, 칼륨_MG, 나트륨_MG, 비타민A_UG_RAE, 비타민C_MG, \
                                                콜레스테롤_MG, 포화지방산_G, 트랜스지방산_G, 식품중량, 제조사명) \
                   VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, \
                           :13, :14, :15, :16, :17, :18, :19, :20, :21, :22, :23) \
                   """

    # 4. ★ 터미널에 출력된 실제 CSV 컬럼명 리스트와 100% 똑같이 매칭
    oracle_columns = [
        '식품코드', 'YOLO_CLASS', '식품명', '영양성분함량기준량', '에너지(kcal)', '수분(g)',
        '단백질(g)', '지방(g)', '탄수화물(g)', '당류(g)', '식이섬유(g)', '칼슘(mg)',
        '철(mg)', '인(mg)', '칼륨(mg)', '나트륨(mg)', '비타민 A(μg RAE)', '비타민 C(mg)',
        '콜레스테롤(mg)', '포화지방산(g)', '트랜스지방산(g)', '식품중량', '제조사명'
    ]

    # 실제 존재하는 컬럼들만 순서대로 정확하게 필터링
    df_filtered = df[oracle_columns]

    # 오라클에 전달할 23개짜리 튜플 리스트 생성
    data_rows = [tuple(x) for x in df_filtered.values]

    # 일괄 삽입 실행
    cursor.executemany(insert_query, data_rows)
    connection.commit()
    print(f"\n🎉 성공: 실제 CSV 구조 기준 총 {len(data_rows)}개의 라면 데이터가 오라클 DB에 적재되었습니다!")

except Exception as e:
    print(f"❌ DB 작업 중 오류 발생 (롤백합니다): {e}")
    if connection:
        connection.rollback()

finally:
    if cursor: cursor.close()
    if connection: connection.close()