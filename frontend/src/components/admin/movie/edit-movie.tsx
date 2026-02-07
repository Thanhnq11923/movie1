import React, { useState, useEffect } from "react";
import { X, Edit, Plus, Users, Globe, Shield } from "lucide-react";
import { notify } from "./././../../../lib/toast";
import type { MovieForm } from "./moive-management";

interface EditMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: MovieForm;
  onUpdate: (movie: MovieForm) => void;
  modalRef: React.RefObject<HTMLDivElement>;
}

const genres = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery", "Romance"
];
const formatOptions = ["2D", "IMAX", "3D"];
const ageRatings = [
  { value: "G", label: "G - General Audiences" },
  { value: "PG", label: "PG - Parental Guidance" },
  { value: "PG-13", label: "PG-13 - Parents Strongly Cautioned" },
  { value: "R", label: "R - Restricted" },
  { value: "NC-17", label: "NC-17 - Adults Only" },
];
const languages = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese", "Russian", "Japanese", "Korean", "Chinese", "Hindi", "Arabic", "Other"
];
// const statusOptions = [
//   { value: "Comingsoon", label: "Coming Soon" },
//   { value: "showing", label: "Now Showing" },
//   { value: "ended", label: "Ended" },
// ];

// Thêm biến today để lấy ngày hiện tại ở định dạng yyyy-mm-dd
const today = new Date().toISOString().split("T")[0];

const EditMovieModal: React.FC<EditMovieModalProps> = ({
  isOpen,
  onClose,
  movie,
  onUpdate,
  modalRef,
}) => {
  const [formData, setFormData] = useState<MovieForm>({ ...movie });
  const [newCastMember, setNewCastMember] = useState("");
  const [newProduction, setNewProduction] = useState("");
  const [posterPreview, setPosterPreview] = useState(movie.poster || "");
  const [bannerPreview, setBannerPreview] = useState(movie.banner || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormData({ ...movie });
    setPosterPreview(movie.poster || "");
    setBannerPreview(movie.banner || "");
  }, [movie, isOpen]);

  useEffect(() => {
    setHasChanges(JSON.stringify(formData) !== JSON.stringify(movie));
  }, [formData, movie]);

  // Xóa mọi chỗ validate, hiển thị, truy cập rating, ticketsSold, revenue

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate định dạng yyyy-mm-dd cho releaseDate và toDate
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.releaseDate)) {
      notify.warning("Release Date phải đúng định dạng yyyy-mm-dd");
      return;
    }
    if (!dateRegex.test(formData.toDate || "")) {
      notify.warning("To Date phải đúng định dạng yyyy-mm-dd");
      return;
    }
    // Kiểm tra To Date phải lớn hơn Release Date ít nhất 2 ngày
    if (formData.releaseDate && formData.toDate) {
      const release = new Date(formData.releaseDate);
      const toDate = new Date(formData.toDate);
      const diff = (toDate.getTime() - release.getTime()) / (1000 * 60 * 60 * 24);
      if (diff <= 2) {
        notify.warning("Ngày kết thúc phải sau ngày bắt đầu ít nhất 2 ngày");
        return;
      }
    }
    setIsSubmitting(true);
    try {
      await onUpdate(formData);
      notify.success("Movie updated successfully!");
      onClose();
    } catch (error) {
      notify.error("Failed to update movie");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof MovieForm,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "poster") setPosterPreview(value);
    if (field === "banner") setBannerPreview(value);
  };

  const addCastMember = () => {
    if (!newCastMember.trim()) return notify.warning("Please enter a cast member name");
    if (formData.cast?.includes(newCastMember.trim())) return notify.warning(`"${newCastMember.trim()}" is already in the cast list`);
    setFormData((prev) => ({ ...prev, cast: [...(prev.cast || []), newCastMember.trim()] }));
    setNewCastMember("");
  };
  const removeCastMember = (member: string) => {
    setFormData((prev) => ({ ...prev, cast: prev.cast?.filter((c) => c !== member) || [] }));
  };
  const addProduction = () => {
    if (!newProduction.trim()) return notify.warning("Please enter a production company name");
    if (formData.production?.includes(newProduction.trim())) return notify.warning(`"${newProduction.trim()}" is already in the production list`);
    setFormData((prev) => ({ ...prev, production: [...(prev.production || []), newProduction.trim()] }));
    setNewProduction("");
  };
  const removeProduction = (company: string) => {
    setFormData((prev) => ({ ...prev, production: prev.production?.filter((c) => c !== company) || [] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Movie</h2>
            <p className="text-sm text-gray-600 mt-1">Update movie information for "{movie.title}"</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" disabled={isSubmitting}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cột trái: Thông tin cơ bản + Hình ảnh */}
            <div className="space-y-6">
              {/* Box: Thông tin cơ bản */}
              <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-4">Thông tin cơ bản</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Movie Title *</label>
                    <input type="text" value={formData.title} onChange={e => handleInputChange("title", e.target.value)} disabled={isSubmitting} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Movie Title (Vietnamese)</label>
                    <input type="text" value={formData.titleVn || ""} onChange={e => handleInputChange("titleVn", e.target.value)} disabled={isSubmitting} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🎭 Genre *</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.genre && formData.genre.map((g) => (
                        <span key={g} className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {g}
                          <button type="button" className="ml-1 text-blue-600 hover:text-red-600" onClick={() => handleInputChange("genre", formData.genre.filter((x) => x !== g))} disabled={isSubmitting}>&times;</button>
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {genres.map((g) => (
                        <label key={g} className="flex items-center gap-1 text-sm">
                          <input type="checkbox" checked={formData.genre.includes(g)} onChange={() => handleInputChange("genre", formData.genre.includes(g) ? formData.genre.filter((x) => x !== g) : [...formData.genre, g])} disabled={isSubmitting} />
                          {g}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🎞️ Format</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.format && formData.format.map((f) => (
                        <span key={f} className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {f}
                          <button type="button" className="ml-1 text-green-600 hover:text-red-600" onClick={() => handleInputChange("format", formData.format?.filter((x) => x !== f))} disabled={isSubmitting}>&times;</button>
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {formatOptions.map((fmt) => (
                        <label key={fmt} className="flex items-center gap-1 text-sm">
                          <input type="checkbox" checked={formData.format?.includes(fmt) || false} onChange={() => handleInputChange("format", formData.format?.includes(fmt) ? formData.format?.filter((f) => f !== fmt) : [...(formData.format || []), fmt])} disabled={isSubmitting} />
                          {fmt}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes) *</label>
                    <input type="number" value={formData.duration || ""} onChange={e => handleInputChange("duration", parseInt(e.target.value, 10) || 0)} min="1" max="500" disabled={isSubmitting} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Release Date *</label>
                    <input
                      type="date"
                      value={formData.releaseDate}
                      onChange={e => {
                        const value = e.target.value;
                        handleInputChange("releaseDate", value);
                        // Nếu toDate nhỏ hơn releaseDate thì reset toDate
                        if (formData.toDate && value && formData.toDate < value) {
                          handleInputChange("toDate", value);
                        }
                      }}
                      onBlur={e => {
                        const value = e.target.value;
                        if (value && value < today) {
                          notify.warning("Không thể chọn ngày trong quá khứ");
                          handleInputChange("releaseDate", "");
                        }
                      }}
                      min={today}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                    />
                    {formData.releaseDate && (
                      <>
                        <div className="text-xs text-gray-500 mt-1">
                          Fromdate: {new Date(formData.releaseDate).toLocaleDateString("vi-VN")}
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">To Date (Ended) *</label>
                    <input
                      type="date"
                      value={formData.toDate || formData.releaseDate}
                      onChange={e => handleInputChange("toDate", e.target.value)}
                      min={formData.releaseDate || today}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                    />
                    {formData.toDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        toDate: {new Date(formData.toDate).toLocaleDateString("vi-VN")}
                      </div>
                    )}
                  </div>
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📊 Status</label>
                    <div className="grid grid-cols-2 gap-3">
                      {statusOptions.map((option) => (
                        <label key={option.value} className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${formData.status === option.value ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-gray-50"}`}>
                          <input type="radio" name="status" value={option.value} checked={formData.status === option.value} onChange={e => handleInputChange("status", e.target.value as typeof formData.status) } disabled={true} className="sr-only" />
                          <span className="text-sm font-medium">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div> */}
                </div>
              </div>
              {/* Box: Hình ảnh */}
              <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-4">Hình ảnh</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🖼️ Poster</label>
                    <input type="url" value={formData.poster} onChange={e => handleInputChange("poster", e.target.value)} placeholder="Enter poster image URL" disabled={isSubmitting} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {posterPreview && <div className="mt-3"><img src={posterPreview} alt="Poster preview" className="w-full max-w-xs h-48 object-cover rounded-lg border" onError={() => notify.warning("Failed to load poster image")} /></div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🏳️ Banner</label>
                    <input type="url" value={formData.banner || ""} onChange={e => handleInputChange("banner", e.target.value)} placeholder="Enter banner image URL" disabled={isSubmitting} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {bannerPreview && <div className="mt-3"><img src={bannerPreview} alt="Banner preview" className="w-full max-w-xs h-32 object-cover rounded-lg border" onError={() => notify.warning("Failed to load banner image")} /></div>}
                  </div>
                </div>
              </div>
            </div>
            {/* Cột phải: Thông tin chi tiết + Trailer */}
            <div className="space-y-6">
              {/* Box: Thông tin chi tiết */}
              <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-4">Thông tin chi tiết</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🎬 Director *</label>
                    <input type="text" value={formData.director || ""} onChange={e => handleInputChange("director", e.target.value)} disabled={isSubmitting} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2"><Users className="inline w-4 h-4 mr-1" /> Cast Members</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.cast && formData.cast.map((member) => (
                        <span key={member} className="inline-flex items-center bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          {member}
                          <button type="button" className="ml-1 text-purple-600 hover:text-red-600" onClick={() => removeCastMember(member)} disabled={isSubmitting}>&times;</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={newCastMember} onChange={e => setNewCastMember(e.target.value)} placeholder="Add cast member" disabled={isSubmitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCastMember(); } }} />
                      <button type="button" onClick={addCastMember} disabled={isSubmitting} className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2"><Globe className="inline w-4 h-4 mr-1" /> Production</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.production && formData.production.map((company) => (
                        <span key={company} className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {company}
                          <button type="button" className="ml-1 text-green-600 hover:text-red-600" onClick={() => removeProduction(company)} disabled={isSubmitting}>&times;</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={newProduction} onChange={e => setNewProduction(e.target.value)} placeholder="Add production company" disabled={isSubmitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addProduction(); } }} />
                      <button type="button" onClick={addProduction} disabled={isSubmitting} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2"><Shield className="inline w-4 h-4 mr-1" /> Age Rating</label>
                    <select value={formData.ageRating || "PG-13"} onChange={e => handleInputChange("ageRating", e.target.value)} disabled={isSubmitting} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {ageRatings.map((rating) => (
                        <option key={rating.value} value={rating.value}>{rating.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select value={formData.language || "English"} onChange={e => handleInputChange("language", e.target.value)} disabled={isSubmitting} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {languages.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📝 Description *</label>
                    <textarea value={formData.description || ""} onChange={e => handleInputChange("description", e.target.value)} rows={4} disabled={isSubmitting} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none border-gray-300" />
                  </div>
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating (0-10)</label>
                    <input type="number" value={formData.rating} min="0" max="10" step="0.1" disabled readOnly className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div> */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tickets Sold</label>
                    <input type="number" value={formData.ticketsSold} onChange={e => handleInputChange("ticketsSold", Number(e.target.value))} min="0" disabled={isSubmitting} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div> */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Revenue</label>
                    <input type="number" value={formData.revenue} onChange={e => handleInputChange("revenue", Number(e.target.value))} min="0" disabled={isSubmitting} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div> */}
                </div>
              </div>
              {/* Box: Trailer */}
              <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-4">Trailer</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🎬 Trailer (YouTube Embed URL)</label>
                    <input type="url" value={formData.embedUrl || ""} onChange={e => handleInputChange("embedUrl", e.target.value)} placeholder="https://www.youtube.com/embed/..." disabled={isSubmitting} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {formData.embedUrl && formData.embedUrl.includes("youtube.com/embed") && <div className="mt-3"><iframe width="100%" height="200" src={formData.embedUrl} title="Trailer Preview" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="rounded-lg border"></iframe></div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🎬 Trailer (YouTube URL)</label>
                    <input type="url" value={formData.trailerUrl || ""} onChange={e => handleInputChange("trailerUrl", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." disabled={isSubmitting} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {/* Hiển thị video nếu là YouTube URL */}
                    {formData.trailerUrl && (formData.trailerUrl.includes("youtube.com/watch?v=") || formData.trailerUrl.includes("youtu.be/")) ? (
                      <div className="mt-3">
                        <iframe
                          width="100%"
                          height="220"
                          src={(() => {
                            // Chuyển watch?v=... hoặc youtu.be/... thành embed
                            if (formData.trailerUrl.includes("youtube.com/watch?v=")) {
                              const videoId = formData.trailerUrl.split("v=")[1]?.split("&")[0];
                              return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
                            } else if (formData.trailerUrl.includes("youtu.be/")) {
                              const videoId = formData.trailerUrl.split("youtu.be/")[1]?.split("?")[0];
                              return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
                            }
                            return "";
                          })()}
                          title="Trailer Video"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="rounded-lg border"
                        ></iframe>
                      </div>
                    ) : (
                      formData.trailerUrl && <div className="mt-3"><a href={formData.trailerUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Xem trailer</a></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Movie Summary */}
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎬 Movie Summary</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-gray-600">Title:</span><span className="font-medium">{formData.title}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Title (Vietnamese):</span><span className="font-medium">{formData.titleVn}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Genre:</span><span className="font-medium">{formData.genre?.join(", ")}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Format:</span><span className="font-medium">{formData.format?.join(", ")}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Duration:</span><span className="font-medium">{formData.duration} minutes</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Release Date:</span><span className="font-medium">{formData.releaseDate}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Status:</span><span className="font-medium">{formData.status}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Director:</span><span className="font-medium">{formData.director}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Language:</span><span className="font-medium">{formData.language}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Age Rating:</span><span className="font-medium">{formData.ageRating}</span></div>
                {/* <div className="flex justify-between"><span className="text-gray-600">Rating:</span><span className="font-medium">{formData.rating}/10</span></div> */}
                {/* <div className="flex justify-between"><span className="text-gray-600">Tickets Sold:</span><span className="font-medium">{formData.ticketsSold}</span></div> */}
                {/* <div className="flex justify-between"><span className="text-gray-600">Revenue:</span><span className="font-medium">{formData.revenue}</span></div> */}
              </div>
              <div className="space-y-3">
                <div><span className="text-gray-600">Cast:</span><div className="mt-1">{formData.cast && formData.cast.length > 0 ? (<div className="flex flex-wrap gap-1">{formData.cast.map((member, index) => (<span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{member}</span>))}</div>) : (<span className="text-gray-400 text-sm">No cast members</span>)}</div></div>
                <div><span className="text-gray-600">Production:</span><div className="mt-1">{formData.production && formData.production.length > 0 ? (<div className="flex flex-wrap gap-1">{formData.production.map((company, index) => (<span key={index} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{company}</span>))}</div>) : (<span className="text-gray-400 text-sm">No production companies</span>)}</div></div>
                <div><span className="text-gray-600">Poster:</span><div className="mt-2">{posterPreview ? (<img src={posterPreview} alt="Movie poster" className="w-24 h-32 object-cover rounded border" />) : (<span className="text-gray-400 text-sm">No poster</span>)}</div></div>
                <div><span className="text-gray-600">Banner:</span><div className="mt-2">{bannerPreview ? (<img src={bannerPreview} alt="Movie banner" className="w-24 h-32 object-cover rounded border" />) : (<span className="text-gray-400 text-sm">No banner</span>)}</div></div>
                <div><span className="text-gray-600">Trailer (Embed URL):</span><div className="mt-1">{formData.embedUrl ? (<a href={formData.embedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{formData.embedUrl}</a>) : (<span className="text-gray-400 text-sm">No embed URL</span>)}</div></div>
                <div><span className="text-gray-600">Trailer (YouTube URL):</span><div className="mt-1">{formData.trailerUrl ? (<a href={formData.trailerUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{formData.trailerUrl}</a>) : (<span className="text-gray-400 text-sm">No trailer URL</span>)}</div></div>
                <div><span className="text-gray-600">Description:</span><p className="mt-1 text-sm text-gray-700 line-clamp-4">{formData.description || "No description provided"}</p></div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting}>Cancel</button>
            <button type="submit" disabled={isSubmitting || !hasChanges} className="px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
              <Edit className="w-4 h-4" />
              <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMovieModal;
