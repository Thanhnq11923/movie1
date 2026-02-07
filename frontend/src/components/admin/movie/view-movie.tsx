import React from "react";
import { X } from "lucide-react";
import type { MovieForm } from "./moive-management";

interface ViewMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: MovieForm;
  modalRef: React.RefObject<HTMLDivElement>;
}

const ViewMovieModal: React.FC<ViewMovieModalProps> = ({
  isOpen,
  onClose,
  movie,
  modalRef,
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      showing: "bg-green-100 text-green-800",
      upcoming: "bg-blue-100 text-blue-800",
    };

    const statusLabels: Record<string, string> = {
      showing: "Showing",
      upcoming: "Upcoming",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusConfig[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {statusLabels[status] || status}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 truncate max-w-[350px]">
              {movie.title || "Untitled Movie"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">View movie details</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-1 flex justify-center">
              <img
                src={movie.poster || "/placeholder.svg"}
                alt={movie.title || "Movie poster"}
                className="w-48 h-64 object-cover rounded-lg border shadow"
              />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 gap-3">
              {movie.genre && (
                <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                  <label className="block text-sm font-medium text-gray-700 w-32">
                    Genre:
                  </label>
                  <span className="text-gray-900 font-medium">
                    {movie.genre}
                  </span>
                </div>
              )}
              {movie.duration && (
                <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                  <label className="block text-sm font-medium text-gray-700 w-32">
                    Duration:
                  </label>
                  <span className="text-gray-900 font-medium">
                    {movie.duration} min
                  </span>
                </div>
              )}
              {movie.releaseDate && (
                <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                  <label className="block text-sm font-medium text-gray-700 w-32">
                    Release Date:
                  </label>
                  <span className="text-gray-900 font-medium">
                    {movie.releaseDate}
                  </span>
                </div>
              )}
              {movie.status && (
                <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                  <label className="block text-sm font-medium text-gray-700 w-32">
                    Status:
                  </label>
                  <span>{getStatusBadge(movie.status)}</span>
                </div>
              )}
              {movie.director && (
                <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                  <label className="block text-sm font-medium text-gray-700 w-32">
                    Director:
                  </label>
                  <span className="text-gray-900 font-medium">
                    {movie.director}
                  </span>
                </div>
              )}
              {movie.cast && movie.cast.length > 0 && (
                <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                  <label className="block text-sm font-medium text-gray-700 w-32">
                    Cast:
                  </label>
                  <span className="text-gray-900 font-medium">
                    {movie.cast.join(", ")}
                  </span>
                </div>
              )}
              {movie.language && (
                <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                  <label className="block text-sm font-medium text-gray-700 w-32">
                    Language:
                  </label>
                  <span className="text-gray-900 font-medium">
                    {movie.language}
                  </span>
                </div>
              )}
            </div>
          </div>

          {movie.description && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description:
              </label>
              <p className="text-gray-900 whitespace-pre-line bg-gray-50 rounded p-3 border mt-1">
                {movie.description}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewMovieModal;
