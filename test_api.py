import requests
import base64
import json
import time
from pathlib import Path
from settings import get_settings

setting = get_settings()
# ========== CẤU HÌNH ==========
API_UPLOAD_URL = setting.api_upload_url
API_STATUS_URL = setting.api_status_url
IMAGE_PATH = "image/surreal.jpg"
MAX_LABELS = 10
MIN_CONFIDENCE = 40

def convert_image_to_base64(image_path):
    """Convert ảnh thành base64 string"""
    try:
        with open(image_path, "rb") as image_file:
            image_data = image_file.read()
            base64_string = base64.b64encode(image_data).decode('utf-8')
            return base64_string
    except FileNotFoundError:
        print(f"❌ Không tìm thấy file: {image_path}")
        return None
    except Exception as e:
        print(f"❌ Lỗi khi đọc file: {str(e)}")
        return None

def upload_image(image_base64, max_labels=10, min_confidence=40):
    """Upload ảnh lên API"""
    print("📤 Đang upload ảnh...")
    
    payload = {
        "image": image_base64,
        "max_labels": max_labels,
        "min_confidence": min_confidence
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(
            API_UPLOAD_URL,
            headers=headers,
            json=payload,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}\n")
        
        if response.status_code == 200:
            result = response.json()
            job_id = result.get('job_id')
            print(f"✅ Upload thành công!")
            print(f"Job ID: {job_id}")
            print(f"Status: {result.get('status')}")
            return job_id
        else:
            print(f"❌ Upload thất bại: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Lỗi kết nối: {str(e)}")
        return None

def check_status(job_id):
    """Kiểm tra trạng thái job"""
    print(f"\n📊 Kiểm tra trạng thái job: {job_id}")
    
    try:
        response = requests.get(
            f"{API_STATUS_URL}?job_id={job_id}",
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            status = result.get('status')
            
            print(f"Status: {status}")
            
            if status == 'COMPLETED':
                print("\n✅ Phân tích hoàn thành!")
                print(f"Original Image URL: {result.get('original_image_url', 'N/A')[:80]}...")
                print(f"Detected Image URL: {result.get('detected_image_url', 'N/A')[:80]}...")
                
                labels = result.get('labels', [])
                print(f"\n🏷️  Đã phát hiện {len(labels)} đối tượng:")
                for i, label in enumerate(labels, 1):
                    print(f"  {i}. {label['name']} - {label['confidence']:.2f}%")
                
                return result
            
            elif status == 'FAILED':
                print(f"❌ Phân tích thất bại: {result.get('error_message', 'Unknown error')}")
                return None
            
            else:
                print(f"⏳ Status: {status}")
                return None
        else:
            print(f"❌ Lỗi: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Lỗi kết nối: {str(e)}")
        return None

def poll_status(job_id, max_attempts=30, interval=2):
    """Poll trạng thái job cho đến khi hoàn thành"""
    print(f"\n⏳ Đang chờ kết quả (tối đa {max_attempts * interval} giây)...")
    
    for attempt in range(max_attempts):
        time.sleep(interval)
        
        result = check_status(job_id)
        
        if result:
            return result
        
        print(f"Thử lại {attempt + 1}/{max_attempts}...")
    
    print("\n❌ Timeout: Quá thời gian chờ")
    return None

def main():
    """Main function"""
    print("=" * 60)
    print("🚀 AWS Rekognition API Test")
    print("=" * 60)
    
    # Kiểm tra file ảnh
    image_path = Path(IMAGE_PATH)
    if not image_path.exists():
        print(f"❌ Không tìm thấy file: {IMAGE_PATH}")
        return
    
    print(f"\n📁 Đọc file: {IMAGE_PATH}")
    file_size = image_path.stat().st_size / 1024  # KB
    print(f"📏 Kích thước: {file_size:.2f} KB")
    
    # Convert sang base64
    base64_image = convert_image_to_base64(IMAGE_PATH)
    if not base64_image:
        return
    
    print(f"✅ Convert base64 thành công (độ dài: {len(base64_image)} ký tự)")
    
    # Upload ảnh
    print("\n" + "=" * 60)
    job_id = upload_image(base64_image, MAX_LABELS, MIN_CONFIDENCE)
    
    if not job_id:
        print("\n❌ Test thất bại!")
        return
    
    # Poll status
    print("\n" + "=" * 60)
    result = poll_status(job_id, max_attempts=30, interval=2)
    
    if result:
        print("\n" + "=" * 60)
        print("✅ TEST THÀNH CÔNG!")
        print("=" * 60)
        
        # Lưu kết quả
        with open("test_result.json", "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        print("\n💾 Kết quả đã lưu vào: test_result.json")
    else:
        print("\n" + "=" * 60)
        print("❌ TEST THẤT BẠI!")
        print("=" * 60)

if __name__ == "__main__":
    main()