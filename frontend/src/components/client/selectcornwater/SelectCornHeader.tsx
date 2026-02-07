import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";

export function SelectCornHeader() {
  const navigate = useNavigate();

  return (
    <header className="mt-16 sm:mt-20 md:mt-25 top-0 left-0 right-0 bg-white z-10 shadow-sm">
      <div className="container mx-auto">
        <div className="flex items-center justify-center p-3 sm:p-4">
          <div className="absolute left-4 sm:left-6 md:left-8">
            <Button
              variant="ghost"
              size="icon"
              className="p-1 sm:p-2"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </Button>
          </div>
          <h1 className="text-lg sm:text-xl font-semibold text-orange-900">
            Select Concessions
          </h1>
        </div>
      </div>
    </header>
  );
}
