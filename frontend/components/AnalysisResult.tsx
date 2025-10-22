import { AnalysisResult as AnalysisResultType } from "@/types/rekognition";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AnalysisResultProps {
  result: AnalysisResultType | null;
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  if (!result || !result.processed_image_url) {
    return (
      <Card className="bg-slate-800/50 border-cyan-500/30 shadow-xl shadow-cyan-500/20">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-cyan-100 font-medium">
              Kết quả phân tích sẽ hiển thị ở đây
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Chọn ảnh và nhấn "Phân tích" để bắt đầu
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800/50 border-cyan-500/30 shadow-xl shadow-cyan-500/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Hiển thị processed image */}
            <div className="relative overflow-hidden rounded-lg bg-slate-900/50 border border-cyan-500/20">
              <img
                src={result.processed_image_url}
                alt="Detected objects"
                className="w-full h-auto object-contain"
              />
            </div>
            
            <div className="text-center py-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <p className="text-sm text-cyan-100 font-medium">
                  {result.labels && result.labels.length > 0 
                    ? `Đã phát hiện ${result.labels.length} đối tượng` 
                    : 'Không phát hiện đối tượng nào'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {result.labels && result.labels.length > 0 && (
        <Card className="bg-slate-800/50 border-cyan-500/30 shadow-xl shadow-cyan-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-cyan-50">
                Đối tượng phát hiện
              </h3>
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50">
                {result.labels.length} đối tượng
              </Badge>
            </div>
            <div className="space-y-2">
              {result.labels.map((label, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 px-4 rounded-lg bg-slate-700/50 border border-slate-600/50 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-cyan-50">{label.name}</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/50">
                    {label.confidence.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}