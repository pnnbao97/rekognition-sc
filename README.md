## ⚡ **BƯỚC 1: Deploy Lambda #1 - Upload Function**

### 1.1. Tạo Function:
1. Vào **AWS Console** → **Lambda** → **Functions**
2. Click **"Create function"**
3. Chọn **"Author from scratch"**
4. Điền thông tin:
   - **Function name**: `rekognition-upload-prod`
   - **Runtime**: `Python 3.12`
   - **Architecture**: `x86_64`
   - **Execution role**: 
     - Chọn **"Use an existing role"**
     - Chọn role `RekognitionUploadLambdaRole`
5. Click **"Create function"**

### 1.2. Upload Code:
1. Trong trang function vừa tạo, kéo xuống phần **"Code source"**
2. Click **"Upload from"** → **".zip file"**
3. Click **"Upload"** → Chọn file `upload-lambda.zip`
4. Click **"Save"**

### 1.3. Cấu hình:
1. Click tab **"Configuration"** → **"General configuration"**
   - **Timeout**: `30 seconds`
   - **Memory**: `512 MB`
   - Click **"Edit"** → **"Save"**

2. Click tab **"Configuration"** → **"Environment variables"**
   - Click **"Edit"** → **"Add environment variable"**
   - Thêm 3 biến:
```
     BUCKET_NAME =
     QUEUE_URL =
     TABLE_NAME =
```
   - Click **"Save"**

✅ **Upload Lambda hoàn thành!**

---

## ⚙️ **BƯỚC 2: Deploy Lambda #2 - Processing Function**

### 2.1. Tạo Function:
1. Click **"Create function"**
2. Điền thông tin:
   - **Function name**: `rekognition-processing-prod`
   - **Runtime**: `Python 3.12`
   - **Execution role**: Chọn `RekognitionProcessingLambdaRole`
3. Click **"Create function"**

### 2.2. Upload Code:
1. **"Upload from"** → **".zip file"** → Chọn `processing-lambda.zip`
2. Click **"Save"**

### 2.3. Thêm Pillow Layer:
1. Kéo xuống phần **"Layers"**
2. Click **"Add a layer"**
3. Chọn **"Custom layers"**
4. **Layer**: Chọn `pillow-layer`
5. **Version**: Chọn version mới nhất (thường là 1)
6. Click **"Add"**

### 2.4. Cấu hình:
1. **General configuration**:
   - **Timeout**: `300 seconds` (5 phút)
   - **Memory**: `1024 MB`

2. **Environment variables**:
```
   TABLE_NAME =
```

### 2.5. Thêm SQS Trigger (QUAN TRỌNG!):
1. Click **"Add trigger"**
2. Chọn **"SQS"**
3. **SQS queue**: Chọn `rekognition-sc`
4. **Batch size**: `1`
5. **Enabled**: Check ✅
6. Click **"Add"**

✅ **Processing Lambda hoàn thành!**

---

## 📊 **BƯỚC 3: Deploy Lambda #3 - Status Function**

### 3.1. Tạo Function:
1. Click **"Create function"**
2. Điền thông tin:
   - **Function name**: `rekognition-status-prod`
   - **Runtime**: `Python 3.12`
   - **Execution role**: Chọn `RekognitionStatusLambdaRole`
3. Click **"Create function"**

### 3.2. Upload Code:
1. **"Upload from"** → **".zip file"** → Chọn `status-lambda.zip`
2. Click **"Save"**

### 3.3. Cấu hình:
1. **General configuration**:
   - **Timeout**: `10 seconds`
   - **Memory**: `256 MB`

2. **Environment variables**:
```
   TABLE_NAME =
   BUCKET_NAME =
```

✅ **Status Lambda hoàn thành!**

---

## 🌐 **BƯỚC 4: Tạo API Gateway**

### 4.1. Tạo REST API:
1. Vào **AWS Console** → **API Gateway**
2. Click **"Create API"**
3. Chọn **"REST API"** (không phải REST API Private)
4. Click **"Build"**
5. Điền:
   - **API name**: `rekognition-api`
   - **Endpoint Type**: `Regional`
6. Click **"Create API"**

### 4.2. Tạo Resource `/upload`:
1. Click **"Actions"** → **"Create Resource"**
2. **Resource Name**: `upload`
3. **Resource Path**: `upload`
4. Check ✅ **"Enable API Gateway CORS"**
5. Click **"Create Resource"**

### 4.3. Tạo Method POST cho `/upload`:
1. Chọn resource `/upload`
2. Click **"Actions"** → **"Create Method"**
3. Chọn **"POST"** từ dropdown → Click ✅
4. Cấu hình:
   - **Integration type**: `Lambda Function`
   - **Use Lambda Proxy integration**: Check ✅
   - **Lambda Region**: `ap-southeast-1`
   - **Lambda Function**: `rekognition-upload-prod`
5. Click **"Save"** → Click **"OK"** (cho phép API Gateway invoke Lambda)

### 4.4. Tạo Resource `/status`:
1. Click **"/"** (root)
2. Click **"Actions"** → **"Create Resource"**
3. **Resource Name**: `status`
4. Check ✅ **"Enable API Gateway CORS"**
5. Click **"Create Resource"**

### 4.5. Tạo Method GET cho `/status`:
1. Chọn resource `/status`
2. Click **"Actions"** → **"Create Method"**
3. Chọn **"GET"** → Click ✅
4. Cấu hình:
   - **Integration type**: `Lambda Function`
   - **Use Lambda Proxy integration**: Check ✅
   - **Lambda Function**: `rekognition-status-prod`
5. Click **"Save"** → **"OK"**

### 4.6. Deploy API:
1. Click **"Actions"** → **"Deploy API"**
2. **Deployment stage**: `[New Stage]`
3. **Stage name**: `prod`
4. Click **"Deploy"**

### 4.7. Lấy API URLs:
Sau khi deploy, bạn sẽ thấy **"Invoke URL"** ở đầu trang, dạng:
```
https://abc123xyz.execute-api.ap-southeast-1.amazonaws.com/prod