import { AnalysisResult as AnalysisResultType } from "@/types/rekognition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AnalysisResultProps {
  result: AnalysisResultType | null;
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  if (!result || !result.detected_image_url) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Kết quả phân tích sẽ hiển thị ở đây
          </p>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Chưa có đánh nào được phân tích
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
              <img
                src={result.detected_image_url}
                alt="Detected objects"
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Kết quả phân tích sẽ hiển thị ở đây
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {result.labels && result.labels.length > 0 
                  ? `Chưa có đánh nào được phân tích` 
                  : 'Không phát hiện đối tượng nào'}
              </p>
              <Button variant="secondary" size="sm">
                Tìm hiểu thêm
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {result.labels && result.labels.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-3">
              Đối tượng phát hiện ({result.labels.length})
            </h3>
            <div className="space-y-2">
              {result.labels.map((label, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 rounded-md bg-secondary/50"
                >
                  <span className="text-sm">{label.name}</span>
                  <Badge variant="secondary">
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
