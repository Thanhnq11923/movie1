import type React from "react";
import { useState } from "react";
import { X, Monitor, Users, Building, Plus } from "lucide-react";
import type { NewRoomData } from "./room-management";
import { notify, MESSAGES } from "./././../../../lib/toast"; // Import notification system

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRoom: (room: NewRoomData) => void;
}

const AddRoomModal: React.FC<AddRoomModalProps> = ({
  isOpen,
  onClose,
  onAddRoom,
}) => {
  const [formData, setFormData] = useState<NewRoomData>({
    name: "",
    capacity: 0,
    type: "Standard",
    equipment: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [newEquipment, setNewEquipment] = useState("");

  const availableEquipment = [
    "Projector",
    "4K Projector",
    "Sound System",
    "Dolby Atmos",
    "AC",
    "Recliner Seats",
    "Luxury Seats",
    "Premium Sound",
    "LED Screen",
    "Surround Sound",
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Room name is required";
    }

    if (!formData.capacity || formData.capacity <= 0) {
      newErrors.capacity = "Please enter a valid capacity";
    } else if (formData.capacity > 300) {
      newErrors.capacity = "Capacity cannot exceed 300 seats";
    }

    if (formData.equipment.length === 0) {
      newErrors.equipment = "Please select at least one equipment";
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
      await onAddRoom(formData);

      // Reset form
      setFormData({
        name: "",
        capacity: 0,
        type: "Standard",
        equipment: [],
      });
      setErrors({});
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error("Error adding room:", error);
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
    setHasChanges(true);

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNameChange = (value: string) => {
    handleInputChange("name", value);
  };

  const handleCapacityChange = (value: string) => {
    const numericValue = Number.parseInt(value, 10) || 0;
    handleInputChange("capacity", numericValue);
  };

  const handleTypeChange = (value: string) => {
    handleInputChange("type", value as "Standard" | "Premium" | "VIP");
  };

  const handleEquipmentChange = (equipment: string[]) => {
    handleInputChange("equipment", equipment);
  };

  const handleEquipmentToggle = (equipment: string) => {
    const currentEquipment = formData.equipment;
    if (currentEquipment.includes(equipment)) {
      handleEquipmentChange(
        currentEquipment.filter((item) => item !== equipment)
      );
    } else {
      handleEquipmentChange([...currentEquipment, equipment]);
    }
  };

  const handleAddCustomEquipment = () => {
    if (
      newEquipment.trim() &&
      !formData.equipment.includes(newEquipment.trim())
    ) {
      handleEquipmentChange([...formData.equipment, newEquipment.trim()]);
      setNewEquipment("");
    } else if (formData.equipment.includes(newEquipment.trim())) {
      notify.warning("This equipment is already in the list");
    } else {
      notify.warning("Please enter equipment name");
    }
  };

  const handleRemoveEquipment = (equipment: string) => {
    handleEquipmentChange(
      formData.equipment.filter((item) => item !== equipment)
    );
  };

  const handleClose = () => {
    if (isSubmitting) {
      notify.warning("Please wait for room creation to complete");
      return;
    }

    if (hasChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to close?"
      );
      if (!confirmed) {
        return;
      }
    }

    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Room</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create a new cinema room
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
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter room name (e.g., Room 1, Theater A)"
                  disabled={isSubmitting}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  value={formData.capacity || ""}
                  onChange={(e) => handleCapacityChange(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.capacity ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter seating capacity"
                  min="1"
                  max="300"
                  disabled={isSubmitting}
                />
              </div>
              {errors.capacity && (
                <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Maximum capacity: 300 seats
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Type *
              </label>
              <div className="relative">
                <Monitor className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-colors"
                  disabled={isSubmitting}
                >
                  <option value="Standard">
                    Standard - Basic cinema experience
                  </option>
                  <option value="Premium">
                    Premium - Enhanced audio/visual
                  </option>
                  <option value="VIP">
                    VIP - Luxury seating and amenities
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Equipment *
              </label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {availableEquipment.map((equipment) => (
                  <label
                    key={equipment}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.equipment.includes(equipment)}
                      onChange={() => handleEquipmentToggle(equipment)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-700">{equipment}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  placeholder="Add custom equipment"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddCustomEquipment())
                  }
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={handleAddCustomEquipment}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {formData.equipment.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Selected Equipment:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.equipment.map((equipment) => (
                      <span
                        key={equipment}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {equipment}
                        <button
                          type="button"
                          onClick={() => handleRemoveEquipment(equipment)}
                          className="ml-2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          disabled={isSubmitting}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {errors.equipment && (
                <p className="text-red-500 text-xs mt-1">{errors.equipment}</p>
              )}
            </div>

            {/* Room Preview */}
            {formData.name && formData.capacity > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Room Preview
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{formData.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Capacity:</span>
                    <span className="ml-2 font-medium">
                      {formData.capacity} seats
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-medium">{formData.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Equipment:</span>
                    <span className="ml-2 font-medium">
                      {formData.equipment.length} items
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="text-blue-700 text-sm">
                ℹ️ All new rooms will be created with "Active" status by
                default. You can change the status later from the room list.
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
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Building className="w-4 h-4" />
              <span>{isSubmitting ? "Creating..." : "Create Room"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoomModal;
