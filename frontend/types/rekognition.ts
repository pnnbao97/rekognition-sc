export interface Label {
    name: string;
    confidence: number;
  }
  
  export interface AnalysisResult {
    job_id: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    original_image_url?: string;
    detected_image_url?: string;
    labels?: Label[];
    error_message?: string;
  }
  
  export interface UploadResponse {
    job_id: string;
    status: string;
  }
  