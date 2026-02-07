/**
 * Props cho component TrailerModal
 */
interface TrailerModalProps {
  isOpen: boolean;              // Trạng thái mở/đóng modal
  embedUrl: string;           // URL của trailer
  onClose: () => void;          // Hàm đóng modal
}

/**
 * Component TrailerModal - Popup hiển thị trailer phim
 * Hiển thị video trailer trong một modal overlay
 */
export default function TrailerModal({ isOpen, embedUrl, onClose }: TrailerModalProps) {
  // Nếu modal không mở thì không render gì
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 "
      onClick={onClose} // Đóng modal khi click vào overlay
    >
      <div
        className="relative w-full max-w-6xl"
        onClick={(e) => e.stopPropagation()} // Ngăn việc đóng modal khi click vào video
      >
        {/* Container cho video với tỷ lệ 16:9 */}
        <div className="relative w-full h-0 pb-[56.25%] bg-black rounded-lg overflow-hidden">
          {/* Iframe YouTube */}
          <iframe
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Movie Trailer"
          />
        </div>
      </div>
    </div>
  );
}