import { AnalysisResult, UploadResponse } from "@/types/rekognition";

const API_UPLOAD_URL = process.env.NEXT_PUBLIC_API_UPLOAD_URL!
const API_STATUS_URL = process.env.NEXT_PUBLIC_API_STATUS_URL!

export async function uploadImage(
  imageBase64: string,
  maxLabels: number = 10,
  minConfidence: number = 40
): Promise<UploadResponse> {
  const response = await fetch(API_UPLOAD_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: imageBase64,
      max_labels: maxLabels,
      min_confidence: minConfidence,
    }),
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
}

export async function checkStatus(jobId: string): Promise<AnalysisResult> {
  const response = await fetch(`${API_STATUS_URL}?job_id=${jobId}`);

  if (!response.ok) {
    throw new Error(`Status check failed: ${response.statusText}`);
  }

  return response.json();
}

export function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data:image/...;base64, prefix
      const base64String = base64.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
