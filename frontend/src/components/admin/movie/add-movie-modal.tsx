"use client";

import React, { useState, useEffect } from "react";
import type { MovieForm } from "./moive-management";
import {
  X,
  Plus,
  // Upload,
  Film,
  Users,
  Calendar,
  Clock,
  Globe,
  Shield,
} from "lucide-react";
import { notify } from "./././../../../lib/toast";

interface AddMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (movie: MovieForm) => Promise<void>;
}

const AddMovieModal: React.FC<AddMovieModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [formData, setFormData] = useState<MovieForm>({
    title: "",
    titleVn: "",
    genre: [],
    duration: 0,
    format: [],
    releaseDate: "",
    status: "Comingsoon",
    poster: "",
    banner: "",
    embedUrl: "",
    trailerUrl: "",
    description: "",
    director: "",
    cast: [],
    production: [],
    language: "English",
    ageRating: "PG-13",
  });

  const [newCastMember, setNewCastMember] = useState("");
  const [newProduction, setNewProduction] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [posterPreview, setPosterPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Thêm biến today để lấy ngày hiện tại ở định dạng yyyy-mm-dd
  const today = new Date().toISOString().split("T")[0];

  const genres = [
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "History",
    "Horror",
    "Music",
    "Mystery",
    "Romance",
  ];

  const ageRatings = [
    { value: "G", label: "G - General Audiences" },
    { value: "PG", label: "PG - Parental Guidance" },
    { value: "PG-13", label: "PG-13 - Parents Strongly Cautioned" },
    { value: "R", label: "R - Restricted" },
    { value: "NC-17", label: "NC-17 - Adults Only" },
  ];

  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Russian",
    "Japanese",
    "Korean",
    "Chinese",
    "Hindi",
    "Arabic",
    "Other",
  ];
  const formatOptions = ["2D", "IMAX", "3D"];

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = Boolean(
      formData.title.trim() ||
        formData.titleVn?.trim() ||
        formData.genre.length > 0 ||
        formData.duration > 0 ||
        formData.releaseDate ||
        formData.description?.trim() ||
        formData.director?.trim() ||
        (formData.cast && formData.cast.length > 0) ||
        formData.poster !== "" ||
        formData.banner !== "" || // Check if banner has changed
        formData.embedUrl !== "" || // Check if embedUrl has changed
        formData.trailerUrl !== "" || // Check if trailerUrl has changed
        (formData.production && formData.production.length > 0) // Check if production has changed
    );

    setHasUnsavedChanges(hasChanges);
  }, [formData]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = "Movie title is required";
      }
      if (!formData.genre || formData.genre.length === 0) {
        newErrors.genre = "At least one genre is required";
      }
      if (formData.duration <= 0) {
        newErrors.duration = "Duration must be greater than 0";
      }
      if (!formData.releaseDate) {
        newErrors.releaseDate = "Release date is required";
      }
      // Validate trailer URL nếu có nhập
      if (formData.embedUrl && !/^https?:\/\//.test(formData.embedUrl)) {
        newErrors.embedUrl = "Trailer URL must be a valid URL";
      }
      if (formData.trailerUrl && !/^https?:\/\//.test(formData.trailerUrl)) {
        newErrors.trailerUrl = "Trailer (YouTube URL) must be a valid URL";
      }
    }

    if (step === 2) {
      if (!formData.director?.trim()) {
        newErrors.director = "Director is required";
      }
      if (!formData.description?.trim()) {
        newErrors.description = "Description is required";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      notify.warning(
        `Please fix ${Object.keys(newErrors).length} validation error(s)`
      );
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(1) || !validateStep(2)) {
      notify.error("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const loadingToast = notify.loading("Adding new movie...");
      notify.dismiss(); // Dismiss all existing notifications
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Submit movie:", formData); // DEBUG: kiểm tra giá trị truyền đi
      await onAdd(formData);

      notify.dismiss(loadingToast);
      notify.dismiss(); // Dismiss the loading toast
      notify.success("Movie added successfully!"); // Single success notification

      handleClose();
    } catch (error) {
      console.error("Error adding movie:", error);
      notify.error("Failed to add movie. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) {
      notify.warning("Please wait for the current operation to complete");
      return;
    }

    // Reset form
    setFormData({
      title: "",
      titleVn: "",
      genre: [],
      duration: 0,
      format: [],
      releaseDate: "",
      status: "Comingsoon",
      poster: "",
      banner: "",
      embedUrl: "",
      trailerUrl: "",
      description: "",
      director: "",
      cast: [],
      production: [],
      language: "English",
      ageRating: "PG-13",
    });
    setNewCastMember("");
    setNewProduction("");
    setErrors({});
    setCurrentStep(1);
    setPosterPreview("");
    setBannerPreview("");
    setHasUnsavedChanges(false);

    onClose();
  };

  const addCastMember = () => {
    if (!newCastMember.trim()) {
      notify.warning("Please enter a cast member name");
      return;
    }

    if (formData.cast?.includes(newCastMember.trim())) {
      notify.warning(`"${newCastMember.trim()}" is already in the cast list`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      cast: [...(prev.cast || []), newCastMember.trim()],
    }));

    setNewCastMember("");
  };
  const addProduction = () => {
    if (!newProduction.trim()) {
      notify.warning("Please enter a production company name");
      return;
    }
    if (formData.production?.includes(newProduction.trim())) {
      notify.warning(
        `"${newProduction.trim()}" is already in the production list`
      );
      return;
    }
    setFormData((prev) => ({
      ...prev,
      production: [...(prev.production || []), newProduction.trim()],
    }));
    setNewProduction("");
  };

  const removeCastMember = (member: string) => {
    setFormData((prev) => ({
      ...prev,
      cast: prev.cast?.filter((c) => c !== member) || [],
    }));
  };
  const removeProduction = (company: string) => {
    setFormData((prev) => ({
      ...prev,
      production: prev.production?.filter((c) => c !== company) || [],
    }));
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Special handling for poster URL
    if (field === "poster" && typeof value === "string") {
      setPosterPreview(value);
    }
    // Special handling for banner URL
    if (field === "banner" && typeof value === "string") {
      setBannerPreview(value);
    }
    // Đảm bảo embedUrl được cập nhật đúng
    if (field === "embedUrl" && typeof value === "string") {
      setFormData((prev) => ({ ...prev, embedUrl: value }));
    }
  };

  // const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     if (file.size > 5 * 1024 * 1024) {
  //       // 5MB limit
  //       notify.error("File size too large. Please select a file under 5MB");
  //       return;
  //     }

  //     // Show loading notification for file upload
  //     const loadingToast = notify.loading("Uploading poster...");
  //     notify.dismiss(); // Dismiss all existing notifications

  //     // Simulate file upload
  //     setTimeout(() => {
  //       const mockUrl = `https://example.com/posters/${file.name}`;
  //       setPosterPreview(mockUrl);
  //       handleInputChange("poster", mockUrl);

  //       notify.dismiss(loadingToast);
  //       notify.success("Poster uploaded successfully!");
  //     }, 1500);
  //   }
  // };

  // const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     if (file.size > 5 * 1024 * 1024) {
  //       // 5MB limit
  //       notify.error("File size too large. Please select a file under 5MB");
  //       return;
  //     }
  //     const loadingToast = notify.loading("Uploading banner...");
  //     notify.dismiss();
  //     setTimeout(() => {
  //       const mockUrl = `https://example.com/banners/${file.name}`;
  //       setBannerPreview(mockUrl);
  //       handleInputChange("banner", mockUrl);
  //       notify.dismiss(loadingToast);
  //       notify.success("Banner uploaded successfully!");
  //     }, 1500);
  //   }
  // };

  const getStepIcon = (step: number) => {
    if (step < currentStep) return "✅";
    if (step === currentStep) return "🔄";
    return "⭕";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[95vh] overflow-y-auto relative z-50" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Movie</h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {currentStep} of 3 - Create your movie entry
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div
                className={`flex items-center space-x-2 ${
                  currentStep >= 1 ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <span className="text-lg">{getStepIcon(1)}</span>
                <span className="font-medium">Basic Info</span>
              </div>
              <div
                className={`flex items-center space-x-2 ${
                  currentStep >= 2 ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <span className="text-lg">{getStepIcon(2)}</span>
                <span className="font-medium">Details</span>
              </div>
              <div
                className={`flex items-center space-x-2 ${
                  currentStep >= 3 ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <span className="text-lg">{getStepIcon(3)}</span>
                <span className="font-medium">Review</span>
              </div>
            </div>

            {hasUnsavedChanges && (
              <div className="text-sm text-amber-600 font-medium">
                💾 Unsaved changes
              </div>
            )}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <Film className="inline w-4 h-4 mr-1" />
                      Movie Title *
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="Enter the movie title"
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.title ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.title}
                      </p>
                    )}
                  </div>
                  {/* Movie Title version vietnamese */}
                  <div>
                    <label
                      htmlFor="titleVn"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <Film className="inline w-4 h-4 mr-1" />
                      Movie Title * version vietnamese
                    </label>
                    <input
                      id="titleVn"
                      type="text"
                      value={formData.titleVn}
                      onChange={(e) =>
                        handleInputChange("titleVn", e.target.value)
                      }
                      placeholder="Nhập tên phim tiếng Việt"
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🎭 Genre *
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.genre.length > 0 &&
                          formData.genre.map((g) => (
                            <span
                              key={g}
                              className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                              {g}
                              <button
                                type="button"
                                className="ml-1 text-blue-600 hover:text-red-600"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    genre: prev.genre.filter((x) => x !== g),
                                  }))
                                }
                                disabled={isSubmitting}
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {genres.map((g) => (
                          <label
                            key={g}
                            className="flex items-center gap-1 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={formData.genre.includes(g)}
                              onChange={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  genre: prev.genre.includes(g)
                                    ? prev.genre.filter((x) => x !== g)
                                    : [...prev.genre, g],
                                }));
                                if (errors.genre)
                                  setErrors((prev) => ({ ...prev, genre: "" }));
                              }}
                              disabled={isSubmitting}
                            />
                            {g}
                          </label>
                        ))}
                      </div>
                      {errors.genre && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.genre}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="duration"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        <Clock className="inline w-4 h-4 mr-1" />
                        Duration (minutes) *
                      </label>
                      <input
                        id="duration"
                        type="number"
                        value={formData.duration || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "duration",
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        placeholder="120"
                        min="1"
                        max="500"
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          errors.duration ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.duration && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.duration}
                        </p>
                      )}
                    </div>
                    {/* Format phim */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🎞️ Format
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {formatOptions.map((fmt) => (
                          <label
                            key={fmt}
                            className="flex items-center gap-1 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={formData.format?.includes(fmt) || false}
                              onChange={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  format: prev.format?.includes(fmt)
                                    ? prev.format.filter((f) => f !== fmt)
                                    : [...(prev.format || []), fmt],
                                }));
                              }}
                              disabled={isSubmitting}
                            />
                            {fmt}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="releaseDate"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Release Date *
                    </label>
                    <input
                      id="releaseDate"
                      type="date"
                      value={formData.releaseDate}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleInputChange("releaseDate", value);
                        // Reset toDate if it's before new releaseDate
                        if (
                          formData.toDate &&
                          value &&
                          formData.toDate < value
                        ) {
                          handleInputChange("toDate", "");
                        }
                        if (value) {
                          const todayDate = new Date();
                          const releaseDate = new Date(value);
                          const diffTime =
                            releaseDate.getTime() - todayDate.getTime();
                          const diffDays = Math.ceil(
                            diffTime / (1000 * 60 * 60 * 24)
                          );
                          if (diffDays > 21) {
                            handleInputChange("status", "Comingsoon");
                          } else {
                            handleInputChange("status", "showing");
                          }
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (value && value < today) {
                          notify.warning("Không thể chọn ngày trong quá khứ");
                          handleInputChange("releaseDate", "");
                        }
                      }}
                      disabled={isSubmitting}
                      min={today}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.releaseDate
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.releaseDate && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.releaseDate}
                      </p>
                    )}
                  </div>
                  {/* To Date (Ended) */}
                  <div>
                    <label
                      htmlFor="toDate"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <Calendar className="inline w-4 h-4 mr-1" />
                      To Date (Ended) *
                    </label>
                    <input
                      id="toDate"
                      type="date"
                      value={formData.toDate || ""}
                      min={formData.releaseDate || today}
                      disabled={isSubmitting || !formData.releaseDate}
                      onChange={(e) => {
                        handleInputChange("toDate", e.target.value);
                        if (errors.toDate)
                          setErrors((prev) => ({ ...prev, toDate: "" }));
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (!formData.releaseDate) return;
                        if (value && value < formData.releaseDate) {
                          notify.warning(
                            "Ngày kết thúc không được trước ngày bắt đầu. Vui lòng nhập lại!"
                          );
                          handleInputChange("toDate", "");
                          setTimeout(() => {
                            document.getElementById("toDate")?.focus();
                          }, 0);
                          return;
                        }
                        if (value && formData.releaseDate) {
                          const release = new Date(formData.releaseDate);
                          const toDate = new Date(value);
                          const diff =
                            (toDate.getTime() - release.getTime()) /
                            (1000 * 60 * 60 * 24);
                          if (diff < 2) {
                            notify.warning(
                              "Ngày kết thúc phải sau ngày bắt đầu ít nhất 2 ngày. Vui lòng nhập lại!"
                            );
                            handleInputChange("toDate", "");
                            setTimeout(() => {
                              document.getElementById("toDate")?.focus();
                            }, 0);
                            return;
                          }
                        }
                        if (value && value < today) {
                          notify.warning("Không thể chọn ngày trong quá khứ");
                          handleInputChange("toDate", "");
                          setTimeout(() => {
                            document.getElementById("toDate")?.focus();
                          }, 0);
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.toDate ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {/* {formData.toDate && /^\d{4}-\d{2}-\d{2}$/.test(formData.toDate) && (
                      <div className="text-xs text-gray-500 mt-1">
                        To Date: {new Date(formData.toDate).toLocaleDateString("vi-VN")}
                      </div>
                    )} */}
                    {errors.toDate && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.toDate}
                      </p>
                    )}
                  </div>

                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      📊 Status
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {statusOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <label
                            key={option.value}
                            className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                              formData.status === option.value
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="status"
                              value={option.value}
                              checked={formData.status === option.value}
                              onChange={(e) => handleInputChange(
                                  "status",
                                  e.target.value as MovieForm["status"]
                              )}
                              disabled={true}
                              className="sr-only"
                            />
                            <IconComponent className="w-5 h-5 mr-2 text-gray-600" />
                            <span className="text-sm font-medium">
                              {option.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div> */}
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="poster"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      🖼️ Poster
                    </label>
                    <div className="space-y-3">
                      <input
                        id="poster"
                        type="url"
                        value={formData.poster}
                        onChange={(e) =>
                          handleInputChange("poster", e.target.value)
                        }
                        placeholder="Enter poster image URL"
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {/* <div className="text-center">
                        <span className="text-sm text-gray-500">or</span>
                      </div>
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            Click to upload poster
                          </p>
                          <p className="text-xs text-gray-400">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={isSubmitting}
                        />
                      </label> */}
                    </div>
                    {posterPreview && (
                      <div className="mt-3">
                        <img
                          src={posterPreview}
                          alt="Poster preview"
                          className="w-full max-w-xs h-48 object-cover rounded-lg border"
                          onError={() =>
                            notify.warning("Failed to load poster image")
                          }
                        />
                      </div>
                    )}
                  </div>
                  {/* Banner upload giống poster */}
                  <div>
                    <label
                      htmlFor="banner"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      🏳️ Banner
                    </label>
                    <div className="space-y-3">
                      <input
                        id="banner"
                        type="url"
                        value={formData.banner || ""}
                        onChange={(e) =>
                          handleInputChange("banner", e.target.value)
                        }
                        placeholder="Enter banner image URL"
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {/* <div className="text-center">
                        <span className="text-sm text-gray-500">or</span>
                      </div>
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            Click to upload banner
                          </p>
                          <p className="text-xs text-gray-400">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleBannerUpload}
                          disabled={isSubmitting}
                        />
                      </label> */}
                    </div>
                    {bannerPreview && (
                      <div className="mt-3">
                        <img
                          src={bannerPreview}
                          alt="Banner preview"
                          className="w-full max-w-xs h-32 object-cover rounded-lg border"
                          onError={() =>
                            notify.warning("Failed to load banner image")
                          }
                        />
                      </div>
                    )}
                  </div>

                  {/* Trailer nằm bên poster */}
                  <div>
                    <label
                      htmlFor="embedUrl"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      🎬 Trailer (YouTube Embed URL)
                    </label>
                    <input
                      id="embedUrl"
                      type="url"
                      value={formData.embedUrl || ""}
                      onChange={(e) =>
                        handleInputChange("embedUrl", e.target.value)
                      }
                      placeholder="https://www.youtube.com/embed/..."
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.embedUrl ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.embedUrl && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.embedUrl}
                      </p>
                    )}
                    {/* Preview nếu là YouTube embed */}
                    {formData.embedUrl &&
                      formData.embedUrl.includes("youtube.com/embed") && (
                        <div className="mt-3">
                          <iframe
                            width="100%"
                            height="200"
                            src={formData.embedUrl}
                            title="Trailer Preview"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="rounded-lg border"
                          ></iframe>
                        </div>
                      )}
                    {/* Thêm trường Trailer (YouTube URL) sau Embed URL */}
                    <div className="mt-4">
                      <label
                        htmlFor="trailerUrl"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        🎬 Trailer (YouTube URL)
                      </label>
                      <input
                        id="trailerUrl"
                        type="url"
                        value={formData.trailerUrl || ""}
                        onChange={(e) =>
                          handleInputChange("trailerUrl", e.target.value)
                        }
                        placeholder="https://www.youtube.com/watch?v=..."
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          errors.trailerUrl
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {formData.trailerUrl &&
                      (formData.trailerUrl.includes("youtube.com/watch?v=") ||
                        formData.trailerUrl.includes("youtu.be/")) ? (
                        <div className="mt-3">
                          <iframe
                            width="100%"
                            height="220"
                            src={(() => {
                              if (
                                formData.trailerUrl.includes(
                                  "youtube.com/watch?v="
                                )
                              ) {
                                const videoId = formData.trailerUrl
                                  .split("v=")[1]
                                  ?.split("&")[0];
                                return videoId
                                  ? `https://www.youtube.com/embed/${videoId}`
                                  : "";
                              } else if (
                                formData.trailerUrl.includes("youtu.be/")
                              ) {
                                const videoId = formData.trailerUrl
                                  .split("youtu.be/")[1]
                                  ?.split("?")[0];
                                return videoId
                                  ? `https://www.youtube.com/embed/${videoId}`
                                  : "";
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
                        formData.trailerUrl && (
                          <div className="mt-3">
                            <a
                              href={formData.trailerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              Xem trailer
                            </a>
                          </div>
                        )
                      )}
                      {errors.trailerUrl && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.trailerUrl}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Detailed Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="director"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      🎬 Director *
                    </label>
                    <input
                      id="director"
                      type="text"
                      value={formData.director || ""}
                      onChange={(e) =>
                        handleInputChange("director", e.target.value)
                      }
                      placeholder="Enter director name"
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.director ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.director && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.director}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="language"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        <Globe className="inline w-4 h-4 mr-1" />
                        Language
                      </label>
                      <select
                        id="language"
                        value={formData.language}
                        onChange={(e) =>
                          handleInputChange("language", e.target.value)
                        }
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {languages.map((lang) => (
                          <option key={lang} value={lang}>
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="ageRating"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        <Shield className="inline w-4 h-4 mr-1" />
                        Age Rating
                      </label>
                      <select
                        id="ageRating"
                        value={formData.ageRating}
                        onChange={(e) =>
                          handleInputChange("ageRating", e.target.value)
                        }
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {ageRatings.map((rating) => (
                          <option key={rating.value} value={rating.value}>
                            {rating.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* <div>
                    <label
                      htmlFor="rating"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <Star className="inline w-4 h-4 mr-1" />
                      Rating (0-10)
                    </label>
                    <input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={formData.rating || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "rating",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="8.5"
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.rating ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.rating && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.rating}
                      </p>
                    )}
                  </div> */}
                </div>

                <div className="space-y-4">
                  {/* Cast Members */}
                  <div>
                    <label
                      htmlFor="cast"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <Users className="inline w-4 h-4 mr-1" />
                      Cast Members
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.cast &&
                        formData.cast.map((member) => (
                          <span
                            key={member}
                            className="inline-flex items-center bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                          >
                            {member}
                            <button
                              type="button"
                              className="ml-1 text-purple-600 hover:text-red-600"
                              onClick={() => removeCastMember(member)}
                              disabled={isSubmitting}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCastMember}
                        onChange={(e) => setNewCastMember(e.target.value)}
                        placeholder="Add cast member"
                        disabled={isSubmitting}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCastMember();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addCastMember}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {/* Production Companies */}
                  <div>
                    <label
                      htmlFor="production"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <Globe className="inline w-4 h-4 mr-1" />
                      Production
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.production &&
                        formData.production.map((company) => (
                          <span
                            key={company}
                            className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                          >
                            {company}
                            <button
                              type="button"
                              className="ml-1 text-green-600 hover:text-red-600"
                              onClick={() => removeProduction(company)}
                              disabled={isSubmitting}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newProduction}
                        onChange={(e) => setNewProduction(e.target.value)}
                        placeholder="Add production company"
                        disabled={isSubmitting}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addProduction();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addProduction}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  📝 Description *
                </label>
                <textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Enter a detailed description of the movie..."
                  rows={4}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🎬 Movie Summary
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Title:</span>
                      <span className="font-medium">{formData.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Title (Vietnamese):</span>
                      <span className="font-medium">{formData.titleVn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Genre:</span>
                      <span className="font-medium">
                        {formData.genre.join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">
                        {formData.duration} minutes
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Format:</span>
                      <span className="font-medium">
                        {formData.format?.join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Release Date:</span>
                      <span className="font-medium">
                        {new Date(formData.releaseDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">To Date (Ended):</span>
                      <span className="font-medium">
                        {formData.toDate
                          ? new Date(formData.toDate).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium">{formData.status}</span>
                    </div> */}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Director:</span>
                      <span className="font-medium">{formData.director}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language:</span>
                      <span className="font-medium">{formData.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age Rating:</span>
                      <span className="font-medium">{formData.ageRating}</span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className="text-gray-600">Rating:</span>
                      <span className="font-medium">{formData.rating}/10</span>
                    </div> */}
                    {/* <div className="flex justify-between">
                      <span className="text-gray-600">Tickets Sold:</span>
                      <span className="font-medium">{formData.ticketsSold}</span>
                    </div> */}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600">Cast:</span>
                      <div className="mt-1">
                        {formData.cast && formData.cast.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {formData.cast.map((member, index) => (
                              <span
                                key={index}
                                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                              >
                                {member}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No cast members
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-600">Production:</span>
                      <div className="mt-1">
                        {formData.production &&
                        formData.production.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {formData.production.map((company, index) => (
                              <span
                                key={index}
                                className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                              >
                                {company}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No production companies
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-600">Poster:</span>
                      <div className="mt-2">
                        {posterPreview ? (
                          <img
                            src={posterPreview}
                            alt="Movie poster"
                            className="w-24 h-32 object-cover rounded border"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No poster
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Banner:</span>
                      <div className="mt-2">
                        {bannerPreview ? (
                          <img
                            src={bannerPreview}
                            alt="Movie banner"
                            className="w-24 h-32 object-cover rounded border"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No banner
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        Trailer (Embed URL):
                      </span>
                      <div className="mt-1">
                        {formData.embedUrl &&
                        formData.embedUrl.includes("youtube.com/embed") ? (
                          <iframe
                            width="100%"
                            height="220"
                            src={formData.embedUrl}
                            title="Trailer Embed"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="rounded-lg border"
                          ></iframe>
                        ) : formData.embedUrl ? (
                          <a
                            href={formData.embedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            {formData.embedUrl}
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No embed URL
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        Trailer (YouTube URL):
                      </span>
                      <div className="mt-1">
                        {formData.trailerUrl &&
                        (formData.trailerUrl.includes("youtube.com/watch?v=") ||
                          formData.trailerUrl.includes("youtu.be/")) ? (
                          <iframe
                            width="100%"
                            height="220"
                            src={(() => {
                              if (
                                formData.trailerUrl.includes(
                                  "youtube.com/watch?v="
                                )
                              ) {
                                const videoId = formData.trailerUrl
                                  .split("v=")[1]
                                  ?.split("&")[0];
                                return videoId
                                  ? `https://www.youtube.com/embed/${videoId}`
                                  : "";
                              } else if (
                                formData.trailerUrl.includes("youtu.be/")
                              ) {
                                const videoId = formData.trailerUrl
                                  .split("youtu.be/")[1]
                                  ?.split("?")[0];
                                return videoId
                                  ? `https://www.youtube.com/embed/${videoId}`
                                  : "";
                              }
                              return "";
                            })()}
                            title="Trailer Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="rounded-lg border"
                          ></iframe>
                        ) : formData.trailerUrl ? (
                          <a
                            href={formData.trailerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            {formData.trailerUrl}
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No trailer URL
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Description:</span>
                      <p className="mt-1 text-sm text-gray-700 line-clamp-4">
                        {formData.description || "No description provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      📋 Please review all information carefully before
                      submitting. You can edit the movie details after creation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center space-x-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Back
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>{isSubmitting ? "Adding Movie..." : "Add Movie"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMovieModal;
