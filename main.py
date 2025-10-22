import boto3
from botocore.exceptions import ClientError
from settings import get_settings
from pathlib import Path
from PIL import Image, ImageDraw
from dataclasses import dataclass

@dataclass
class BoundingBox:
    left: float
    top: float
    width: float
    height: float

@dataclass
class Label:
    name: str
    confidence: float
    bounding_box: BoundingBox

@dataclass
class DetectionResponse:
    labels: list[Label]

def detect_labels_from_local_file(image_path: Path, max_labels: int = 10, min_confidence: int = 40):
    """Phát hiện nhãn từ ảnh trên máy local"""
    try:
        settings = get_settings()
        rekognition = boto3.client(
            "rekognition",
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
        )

        # Đọc file ảnh dưới dạng bytes
        with open(image_path, "rb") as image_file:
            image_bytes = image_file.read()

        # Gọi API DetectLabels
        response = rekognition.detect_labels(
            Image={"Bytes": image_bytes},
            MaxLabels=max_labels,
            MinConfidence=min_confidence,
        )

        print(f"\n{'='*60}")
        print(f"Kết quả phân tích ảnh: {image_path}")
        print(f"{'='*60}\n")

        labels = []
        for label_data in response["Labels"]:
            if label_data.get("Instances"):
                for instance in label_data["Instances"]:
                    if instance.get("BoundingBox"):
                        bounding_box = BoundingBox(
                            left=instance["BoundingBox"]["Left"],
                            top=instance["BoundingBox"]["Top"],
                            width=instance["BoundingBox"]["Width"],
                            height=instance["BoundingBox"]["Height"],
                        )
                        label_obj = Label(
                            name=label_data["Name"],
                            confidence=label_data["Confidence"],
                            bounding_box=bounding_box,
                        )
                        labels.append(label_obj)

        if not labels:
            print("❌ Không tìm thấy đối tượng nào trong ảnh")
            return None

        return DetectionResponse(labels=labels)

    except FileNotFoundError:
        print(f"❌ Lỗi: Không tìm thấy file '{image_path}'")
        return None

    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        error_message = e.response["Error"]["Message"]

        if error_code == "InvalidImageFormatException":
            print("❌ Lỗi: Định dạng ảnh không hợp lệ (chỉ JPG hoặc PNG)")
        elif error_code == "ImageTooLargeException":
            print("❌ Lỗi: Ảnh quá lớn (tối đa 5MB khi gửi trực tiếp)")
        elif error_code == "AccessDeniedException":
            print("❌ Lỗi: Không có quyền truy cập. Kiểm tra IAM policy.")
        else:
            print(f"❌ Lỗi AWS: {error_code} - {error_message}")
        return None

    except Exception as e:
        print(f"❌ Lỗi không xác định: {str(e)}")
        return None
    

def draw_bounding_box(image_path: Path, detection_response: DetectionResponse):
    """Vẽ khung bao quanh từng đối tượng trong ảnh"""
    image = Image.open(image_path)
    draw = ImageDraw.Draw(image)
    
    # Lấy kích thước ảnh
    img_width, img_height = image.size

    bbox_dict = {}
    
    for label in detection_response.labels:
        bbox_key = (round(label.bounding_box.left, 2), round(label.bounding_box.top, 2), round(label.bounding_box.width, 2), round(label.bounding_box.height, 2))
        if bbox_key in bbox_dict:
            continue
        bbox_dict[bbox_key] = True
        # Chuyển đổi từ tỷ lệ (0-1) sang pixel
        left = label.bounding_box.left * img_width
        top = label.bounding_box.top * img_height
        width = label.bounding_box.width * img_width
        height = label.bounding_box.height * img_height
        
        # Vẽ hình chữ nhật
        draw.rectangle(
            [left, top, left + width, top + height],
            outline="red", 
            width=3
        )
        
        # Vẽ nhãn
        draw.text(
            (left, top - 10),  # Đặt text phía trên khung
            f"{label.name} ({label.confidence:.1f}%)",
            fill="white",
        )
    
    # Tạo thư mục nếu chưa có
    output_path = Path(f"image/detected_{image_path.name}")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path)

def main():
    # Ảnh nằm trong thư mục image/surreal.jpg
    image_path = Path("image/surreal.jpg")
    detection_response = detect_labels_from_local_file(
        image_path=image_path,
        max_labels=10,
        min_confidence=20,
    )
    if detection_response:
        draw_bounding_box(image_path, detection_response)
        print(f"ảnh đã được vẽ khung bao quanh đối tượng và lưu vào thư mục image/detected_{image_path.name}")
    else:
        print(f"❌ Không tìm thấy đối tượng nào trong ảnh: {image_path}")
        return


if __name__ == "__main__":
    main()