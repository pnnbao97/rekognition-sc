import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
}

export function ImageUploader({ onImageSelect, disabled }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        onImageSelect(file);
      } else {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn file ảnh hợp lệ (JPG, PNG, ...)",
          variant: "destructive",
        });
      }
    },
    [onImageSelect, toast]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-12 transition-colors ${
        isDragging
          ? "border-primary bg-primary/10"
          : "border-border hover:border-muted-foreground"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        id="file-input"
      />
      <div className="text-center space-y-4">
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <div>
          <p className="text-foreground mb-1">
            Kéo và thả ảnh vào đây hoặc nhấp để chọn tệp
          </p>
          <p className="text-sm text-muted-foreground">
            Hỗ trợ: JPG, PNG,...
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => document.getElementById("file-input")?.click()}
          disabled={disabled}
        >
          Tải ảnh lên
        </Button>
      </div>
    </div>
  );
}