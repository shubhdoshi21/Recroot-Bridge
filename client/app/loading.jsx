import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <Card className="light-mode-card w-full overflow-hidden">
      <div className="p-6 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
        <p className="text-gray-500 mt-4">Loading...</p>
      </div>
    </Card>
  );
}
