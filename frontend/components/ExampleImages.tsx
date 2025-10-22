"use client";
import { AnalysisResult } from "@/types/rekognition";

interface ExampleImagesProps {
  onSelectExample: (imageUrl: string, demoResult?: AnalysisResult) => void;
  disabled?: boolean;
}

// ✅ Đưa ra ngoài component
const DEMO_RESULT: AnalysisResult = {
  job_id: "demo",
  status: "COMPLETED",
  original_image_url: "/assets/surreal.jpg",
  processed_image_url: "/assets/detected_surreal.jpg",
  labels: [
    { name: "Cat", confidence: 81.8 },
    { name: "Wristwatch", confidence: 65.2 },
    { name: "Honey Bee", confidence: 61.2 },
  ],
};

const EXAMPLE_IMAGES = [
  {
    url: "/assets/surreal.jpg",
    isDemoImage: true,
  },
  {
    url: "https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?w=300&h=300&fit=crop",
    isDemoImage: false,
  },
  {
    url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=300&h=300&fit=crop",
    isDemoImage: false,
  },
  {
    url: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=300&h=300&fit=crop",
    isDemoImage: false, // thiên nhiên - núi non
  },
  {
    url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&h=300&fit=crop",
    isDemoImage: false, // đô thị ban đêm
  },
  {
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop",
    isDemoImage: false, // chân dung
  },
  {
    url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=300&h=300&fit=crop",
    isDemoImage: false, // biển và núi
  },
  {
    url: "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=300&h=300&fit=crop",
    isDemoImage: false, // kiến trúc
  },
  {
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
    isDemoImage: false, // chân dung phụ nữ
  },
  {
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&h=300&fit=crop",
    isDemoImage: false, // phong cảnh băng tuyết
  },
  {
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=300&h=300&fit=crop",
    isDemoImage: false, // phong cảnh rừng cây
  },
];


export function ExampleImages({ onSelectExample, disabled }: ExampleImagesProps) {
  const handleImageClick = async (url: string, isDemoImage: boolean) => {
    if (disabled) return;

    try {
      if (isDemoImage) {
        onSelectExample(url, DEMO_RESULT);
      } else {
        const response = await fetch(url);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = () => {
          onSelectExample(reader.result as string);
        };
        reader.readAsDataURL(blob);
      }
    } catch (error) {
      console.error("Error loading example image:", error);
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-center text-white text-xl font-semibold mb-6">Ảnh ví dụ</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {EXAMPLE_IMAGES.map((example, index) => (
          <button
            key={index}
            onClick={() => handleImageClick(example.url, example.isDemoImage)}
            disabled={disabled}
            className="aspect-square rounded-lg overflow-hidden bg-card hover:ring-2 hover:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed relative group"
          >
            <img
              src={example.url}
              alt={`Example ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {example.isDemoImage && (
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-xs font-semibold bg-primary text-primary-foreground px-2 py-1 rounded">
                  Demo
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}