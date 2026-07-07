from ultralytics import YOLO

model = YOLO("yolo11m.pt")


metrics = model.val(data=r"C:\Users\M\Desktop\dataset\ramen\data.yaml")

print("mAP50-95:", metrics.box.map)  # mAP75 / mAP50-95 "네모 박스를 얼마나 물체에 딱 맞게 정밀하게 쳤는가?"를 보는 점수
print("mAP50:", metrics.box.map50) # mAP50 (종합 정확도: 0.973) ⭐ 가장 중요
print("mAP75:", metrics.box.map75)
print("Precision:", metrics.box.mp) # Precision (정밀도: 0.934) ➡️ "모델이 예측한 것 중 정답 비율"
print("Recall:", metrics.box.mr) # Recall (재현율: 0.971) ➡️ "실제 라면 중 모델이 찾아낸 비율"