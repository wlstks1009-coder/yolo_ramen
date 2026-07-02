import cv2
import os


def extract_frames_from_folder(input_folder, base_output_folder, frames_per_second=2):
    # 1. 지원하는 동영상 확장자 목록
    video_exts = ['.mp4', '.avi', '.mov', '.mkv']

    # 2. 입력 폴더가 있는지 확인
    if not os.path.exists(input_folder):
        print(f"❌ '{input_folder}' 폴더를 찾을 수 없습니다. 경로를 확인해주세요.")
        return

    # 3. 폴더 내 파일 중 동영상 파일만 골라내기
    files = os.listdir(input_folder)
    video_files = [f for f in files if os.path.splitext(f)[1].lower() in video_exts]

    if not video_files:
        print(f"❌ '{input_folder}' 폴더 안에 동영상 파일이 없습니다.")
        return

    print(f"🎉 총 {len(video_files)}개의 동영상 파일을 찾았습니다. 일괄 추출을 시작합니다...\n")
    print("-" * 50)

    # 4. 각 동영상 파일마다 반복 작업 실행
    for video_file in video_files:
        video_path = os.path.join(input_folder, video_file)

        # 확장자를 제외한 순수 파일명 추출 (예: 'shin_ramen.mp4' -> 'shin_ramen')
        video_name = os.path.splitext(video_file)[0]

        # 결과물을 저장할 개별 폴더 생성 (예: dataset/shin_ramen/)
        output_dir = os.path.join(base_output_folder, video_name)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        print(f"🎬 처리 중: [{video_file}] -> '{output_dir}' 폴더에 저장됩니다.")

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"⚠️ {video_file} 파일을 열 수 없습니다. 건너뜁니다.")
            continue

        # 원본 영상의 FPS 확인
        original_fps = cap.get(cv2.CAP_PROP_FPS)
        if original_fps == 0:
            print(f"⚠️ {video_file}의 영상을 읽을 수 없습니다. 건너뜁니다.")
            continue

        frame_interval = int(original_fps / frames_per_second)
        if frame_interval < 1:
            frame_interval = 1

        frame_count = 0
        saved_count = 0

        # 영상 프레임 읽기 및 저장
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_count % frame_interval == 0:
                # 저장될 파일명 (예: shin_ramen_0001.jpg)
                file_name = f"{video_name}_{saved_count:04d}.jpg"
                file_path = os.path.join(output_dir, file_name)

                cv2.imwrite(file_path, frame)
                saved_count += 1

            frame_count += 1

        cap.release()
        print(f"✅ [{video_file}] 완료! 총 {saved_count}장 추출됨.\n")

    print("-" * 50)
    print("🚀 모든 동영상 처리가 완벽하게 끝났습니다!")


# --- 🛠️ 여기를 본인 환경에 맞게 수정해서 실행하세요! ---
if __name__ == "__main__":
    # 1. 찍어둔 동영상들이 모여있는 폴더 이름 (이 폴더 안에 mp4 파일들을 넣어두세요)
    INPUT_FOLDER = "my_videos"

    # 2. 추출된 이미지들이 저장될 최상위 폴더 이름
    OUTPUT_FOLDER = "ramen_dataset"

    # 3. 초당 몇 장을 뽑을 것인가? (과적합 방지를 위해 1~2장 추천)
    FPS_TO_EXTRACT = 4

    extract_frames_from_folder(INPUT_FOLDER, OUTPUT_FOLDER, FPS_TO_EXTRACT)