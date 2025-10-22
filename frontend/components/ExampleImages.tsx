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
  detected_image_url: "/assets/detected_surreal.jpg",
  labels: [
    { name: "Cat", confidence: 81.8 },
    { name: "Wristwatch", confidence: 65.2 },
    { name: "Honey Bee", confidence: 61.2 },
  ],
};

const EXAMPLE_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=300&h=300&fit=crop",
    isDemoImage: false,
  },
  {
    url: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=300&h=300&fit=crop",
    isDemoImage: false,
  },
  {
    url: "/assets/surreal.jpg",
    isDemoImage: true,
  },
  {
    url: "https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=300&h=300&fit=crop",
    isDemoImage: false,
  },
  {
    url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=300&h=300&fit=crop",
    isDemoImage: false,
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
      <h2 className="text-center text-xl font-semibold mb-6">Ảnh ví dụ</h2>
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