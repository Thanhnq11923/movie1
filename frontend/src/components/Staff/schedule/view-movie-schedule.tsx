import React from "react";

interface ViewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: any;
  movies: any[];
  cinemas: any[];
  modalRef: React.RefObject<HTMLDivElement>;
}

const ViewScheduleModal: React.FC<ViewScheduleModalProps> = ({ isOpen, onClose, schedule, movies, cinemas, modalRef }) => {
  if (!isOpen || !schedule) return null;
  const movie = movies.find((m) => m._id === schedule.movieId);
  const cinema = cinemas.find((c) => c._id === schedule.cinemaId);
  const room = cinema?.rooms?.find((r: any) => r._id === schedule.cinemaRoomId);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[95vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10">
          <span className="sr-only">Close</span>
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="flex flex-col md:flex-row gap-8 p-8 pt-12 md:pt-8">
          {/* Poster phim */}
          {movie?.largeImage && (
            <div className="flex-shrink-0 flex justify-center items-start w-full md:w-auto">
              <img
                src={movie.largeImage}
                alt={movie.versionMovieEnglish}
                className="w-32 h-48 object-cover rounded-xl shadow border"
                style={{ minWidth: 128, minHeight: 192 }}
              />
            </div>
          )}
          {/* Thông tin phim và lịch chiếu */}
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{movie?.versionMovieEnglish || "-"}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">{cinema?.name || "-"}</span>
                <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">Room: {room?.roomName || "-"}</span>
                <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">{schedule.format}</span>
                {movie?.status && (
                  <span className={
                    "inline-block px-3 py-1 rounded-full text-xs font-semibold " +
                    (movie.status === "showing"
                      ? "bg-green-200 text-green-800"
                      : movie.status === "comingsoon"
                      ? "bg-yellow-200 text-yellow-800"
                      : movie.status === "ended"
                      ? "bg-gray-200 text-gray-600"
                      : "bg-blue-100 text-blue-700")
                  }>
                    {movie.status}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-2">
              <div className="font-semibold text-gray-700 mb-2 text-base">Showtimes:</div>
              <div className="space-y-3">
                {schedule.scheduleTime.map((st: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900 min-w-[90px]">{st.fulldate}:</span>
                    {st.time.map((t: string, i: number) => (
                      <span key={i} className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-mono font-semibold border border-blue-100">
                        {t}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end p-6 border-t border-gray-100 mt-2">
          <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ViewScheduleModal; 