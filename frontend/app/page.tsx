'use client'
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ImageUploader";
import { AnalysisResult } from "@/components/AnalysisResult";
import { ExampleImages } from "@/components/ExampleImages";
import { useToast } from "@/hooks/use-toast";
import { uploadImage, checkStatus, convertImageToBase64 } from "@/lib/api";
import { AnalysisResult as AnalysisResultType } from "@/types/rekognition";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const { toast } = useToast();

  const handleImageSelect = useCallback((file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    setResult(null);
  }, []);

  const handleExampleSelect = useCallback((dataUrl: string, demoResult?: AnalysisResultType) => {
    setSelectedImage(dataUrl);
    
    if (demoResult) {
      setResult(demoResult);
      setSelectedFile(null);
    } else {
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "example.jpg", { type: "image/jpeg" });
          setSelectedFile(file);
        })
        .catch(err => {
          console.error("Error converting example image:", err);
        });
      setResult(null);
    }
  }, []);

  const pollStatus = async (jobId: string, maxAttempts = 30) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResult = await checkStatus(jobId);
      
      if (statusResult.status === "COMPLETED") {
        return statusResult;
      } else if (statusResult.status === "FAILED") {
        throw new Error(statusResult.error_message || "Analysis failed");
      }
    }
    throw new Error("Analysis timeout");
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ảnh trước khi phân tích",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const base64Image = await convertImageToBase64(selectedFile);
      
      toast({
        title: "Đang tải ảnh lên...",
        description: "Vui lòng đợi trong giây lát",
      });
      
      const uploadResponse = await uploadImage(base64Image, 10, 40);
      
      toast({
        title: "Đang phân tích...",
        description: "Hệ thống đang xử lý ảnh của bạn",
      });
      
      const analysisResult = await pollStatus(uploadResponse.job_id);
      
      setResult(analysisResult);
      
      toast({
        title: "Phân tích hoàn thành!",
        description: `Đã phát hiện ${analysisResult.labels?.length || 0} đối tượng`,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Lỗi phân tích",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi phân tích ảnh",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <header className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-cyan-50 mb-2 drop-shadow-lg">
            Hệ thống gắn nhãn đơn giản với Computer Vision
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mt-4 rounded-full"></div>
        </header>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Left side - Upload */}
          <div className="space-y-4">
            {selectedImage ? (
              <div className="space-y-4">
                <div className="aspect-video relative overflow-hidden rounded-lg bg-slate-800/50 border border-cyan-500/30 shadow-xl shadow-cyan-500/20">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="w-full h-full object-contain"
                  />
                </div>
                <Button
                  variant="secondary"
                  className="w-full bg-slate-700 hover:bg-slate-600 text-cyan-50 border border-cyan-500/30"
                  onClick={() => {
                    setSelectedImage(null);
                    setSelectedFile(null);
                    setResult(null);
                  }}
                  disabled={isAnalyzing}
                >
                  Chọn ảnh khác
                </Button>
              </div>
            ) : (
              <ImageUploader onImageSelect={handleImageSelect} disabled={isAnalyzing} />
            )}
            
            <Button
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30"
              size="lg"
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang phân tích...
                </>
              ) : (
                "Phân tích"
              )}
            </Button>
          </div>

          {/* Right side - Results */}
          <div>
            <AnalysisResult result={result} />
          </div>
        </div>

        <ExampleImages onSelectExample={handleExampleSelect} disabled={isAnalyzing} />
      </div>
    </div>
  );
};

export default Index;