"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { X, Edit } from "lucide-react";
import type { RoomData, NewRoomData } from "./room-management";
import { notify, MESSAGES } from "./././../../../lib/toast"; // Import notification system

interface EditRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  onUpdateRoom: (data: NewRoomData) => void;
  modalRef?: React.RefObject<HTMLDivElement>;
}

const EditRoomModal: React.FC<EditRoomModalProps> = ({
  isOpen,
  onClose,
  room,
  onUpdateRoom,
  modalRef,
}) => {
  const [formData, setFormData] = useState<NewRoomData>({
    roomName: room.roomName,
    capacity: room.capacity,
    type: room.type,
    equipment: room.equipment,
    cinemaId: room.cinemaId,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Check for changes whenever formData updates
  useEffect(() => {
    const hasChanges = formData.roomName !== room.roomName;
    setHasChanges(hasChanges);
  }, [formData, room]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.roomName.trim()) {
      newErrors.roomName = "Room name is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call parent function which handles loading and success notifications
      await onUpdateRoom(formData);

      // Modal will be closed by parent component
    } catch (error) {
      console.error("Error updating room:", error);
      notify.error(MESSAGES.ROOM.ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof NewRoomData,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleClose = () => {
    if (isSubmitting) {
      notify.warning("Please wait for the current operation to complete");
      return;
    }

    // Check for unsaved changes
    if (hasChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to close?"
      );
      if (!confirmed) {
        notify.info("Continue editing the room");
        return;
      }
    }

    onClose();
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
            <h2 className="text-2xl font-bold text-gray-900">Edit Room</h2>
            <p className="text-sm text-gray-600 mt-1">
              Update information for {room.roomName}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Unsaved Changes Warning */}
        {hasChanges && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="text-yellow-700 text-sm">
              💾 You have unsaved changes. Make sure to save before closing.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Name *
              </label>
              <input
                type="text"
                value={formData.roomName}
                onChange={(e) => handleInputChange("roomName", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.roomName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter room name"
                disabled={isSubmitting}
              />
              {errors.roomName && (
                <p className="text-red-500 text-xs mt-1">{errors.roomName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity (Read-only)
              </label>
              <input
                type="number"
                value={formData.capacity || ""}
                onChange={(e) =>
                  handleInputChange(
                    "capacity",
                    Number.parseInt(e.target.value) || 0
                  )
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.capacity ? "border-red-500" : "border-gray-300"
                } bg-gray-100`}
                placeholder="Enter seating capacity"
                min="1"
                max="300"
                disabled={true}
                readOnly
              />
              {errors.capacity && (
                <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Capacity cannot be modified
              </p>
            </div>

            {/* Room Status Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                Room Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Room ID:</span>
                  <span className="font-medium">{room._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Status:</span>
                  <span
                    className={`font-medium ${
                      room.status === "Active"
                        ? "text-green-600"
                        : room.status === "Maintenance"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {room.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Occupancy:</span>
                  <span className="font-medium">{room.occupancy}%</span>
                </div>
                {room.currentMovie && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Movie:</span>
                    <span className="font-medium">{room.currentMovie}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Room Type:</span>
                  <span className="font-medium">{room.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cinema ID:</span>
                  <span className="font-medium">{room.cinemaId}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !hasChanges}
              className="px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoomModal;
