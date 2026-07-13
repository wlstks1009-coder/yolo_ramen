import pandas as pd
import pymysql
import config


CSV_FILE_PATH = "ramen_data.csv"
CSV_ENCODINGS = ("utf-8", "cp949")

# 테이블 컬럼명과 일치하는 영문 리스트
ORACLE_COLUMNS = [
    '식품코드', 'YOLO_CLASS', '식품명', '영양성분함량기준량', '에너지(kcal)', '수분(g)',
    '단백질(g)', '지방(g)', '탄수화물(g)', '당류(g)', '식이섬유(g)', '칼슘(mg)',
    '철(mg)', '인(mg)', '칼륨(mg)', '나트륨(mg)', '비타민 A(μg RAE)', '비타민 C(mg)',
    '콜레스테롤(mg)', '포화지방산(g)', '트랜스지방산(g)', '식품중량', '제조사명'
]

INSERT_QUERY = """
    INSERT INTO RAMEN_NUTRITION (
        FOOD_CODE,
        YOLO_CLASS,
        FOOD_NAME,
        NUTRITION_REFERENCE_AMOUNT,
        ENERGY_KCAL,
        MOISTURE_G,
        PROTEIN_G,
        FAT_G,
        CARBOHYDRATE_G,
        SUGARS_G,
        DIETARY_FIBER_G,
        CALCIUM_MG,
        IRON_MG,
        PHOSPHORUS_MG,
        POTASSIUM_MG,
        SODIUM_MG,
        VITAMIN_A_UG_RAE,
        VITAMIN_C_MG,
        CHOLESTEROL_MG,
        SATURATED_FAT_G,
        TRANS_FAT_G,
        FOOD_WEIGHT,
        MANUFACTURER_NAME
    )
    VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
    )
"""


def load_csv():
    for encoding in CSV_ENCODINGS:
        try:
            df = pd.read_csv(CSV_FILE_PATH, encoding=encoding)
            print(f"CSV 파일을 성공적으로 불러왔습니다. ({encoding})")
            return df
        except Exception:
            pass

    raise RuntimeError("CSV 파일을 불러오지 못했습니다. utf-8, cp949 인코딩 모두 실패했습니다.")


def validate_columns(df):
    missing_columns = [column for column in ORACLE_COLUMNS if column not in df.columns]

    if missing_columns:
        raise ValueError(f"CSV에 필요한 컬럼이 없습니다: {missing_columns}")


def create_insert_rows(df):
    df_filtered = df[ORACLE_COLUMNS]

    rows = []
    for row in df_filtered.itertuples(index=False, name=None):
        cleaned_row = tuple(None if pd.isna(value) else value for value in row)
        rows.append(cleaned_row)

    return rows


def get_connection():
    return pymysql.connect(
        host=config.DB_HOST,
        port=config.DB_PORT,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        database=config.DB_NAME,
        charset=config.DB_CHARSET,
    )


def insert_rows(rows):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        # 다시 실행할 때 중복 적재를 막고 싶으면 아래 줄을 사용
        cursor.execute("TRUNCATE TABLE ramen_nutrition")

        cursor.executemany(INSERT_QUERY, rows)
        connection.commit()

        print(f"성공: 총 {len(rows)}개의 라면 데이터가 MariaDB에 적재되었습니다.")

    except Exception as error:
        print(f"DB 작업 중 오류 발생. 롤백합니다: {error}")

        if connection:
            connection.rollback()

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def main():
    df = load_csv()
    validate_columns(df)

    rows = create_insert_rows(df)
    insert_rows(rows)


if __name__ == "__main__":
    main()