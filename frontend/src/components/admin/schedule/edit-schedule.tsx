import React, { useState, useEffect } from "react";
import { X, Plus, Calendar, Clock, Film, Trash2 } from "lucide-react";
import type { MovieSchedule, ScheduleTime } from "../../../types/schedule";

interface EditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: MovieSchedule;
  onUpdate: (schedule: MovieSchedule) => void;
  movies: Array<{
    _id: string;
    versionMovieEnglish: string;
    largeImage?: string;
  }>;
  cinemas: Array<{
    _id: string;
    name: string;
    rooms: Array<{
      _id: string;
      roomName: string;
    }>;
  }>;
  modalRef: React.RefObject<HTMLDivElement>;
}

const formatOptions = ["2D", "3D", "IMAX"];

// Function to get today's date in yyyy-mm-dd format
function getToday() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const EditScheduleModal: React.FC<EditScheduleModalProps> = ({ 
  isOpen, 
  onClose, 
  schedule, 
  onUpdate, 
  movies, 
  cinemas, 
  modalRef 
}) => {
  const [movieId, setMovieId] = useState("");
  const [cinemaId, setCinemaId] = useState("");
  const [cinemaRoomId, setCinemaRoomId] = useState("");
  const [format, setFormat] = useState("");
  const [scheduleTimes, setScheduleTimes] = useState<ScheduleTime[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timesForDay, setTimesForDay] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && schedule) {
      setMovieId(schedule.movieId);
      setCinemaId(schedule.cinemaId);
      setCinemaRoomId(schedule.cinemaRoomId);
      setFormat(schedule.format);
      setScheduleTimes(schedule.scheduleTime || []);
      setDate("");
      setTime("");
      setTimesForDay([]);
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen, schedule]);

  const handleAddTime = () => {
    if (!time) return;
    if (timesForDay.includes(time)) return;
    setTimesForDay([...timesForDay, time]);
    setTime("");
  };

  const handleRemoveTime = (t: string) => {
    setTimesForDay(timesForDay.filter((ti) => ti !== t));
  };

  const handleAddScheduleTime = () => {
    if (!date || timesForDay.length === 0) {
      setError("Please select a date and at least 1 showtime!");
      return;
    }
    // Check if date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);
    if (selected < today) {
      setError("Cannot select past date!");
      return;
    }
    // Parse date into correct format fields
    const d = new Date(date);
    const day = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(); // MON
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(); // DEC
    const dateNum = d.getDate().toString(); // "2"
    const fulldate = d.toISOString().slice(0, 10); // yyyy-mm-dd

    // If date already exists, merge times and remove duplicates
    const idx = scheduleTimes.findIndex(st => st.fulldate === fulldate);
    if (idx > -1) {
      const oldTimes = scheduleTimes[idx].time;
      const newTimes = Array.from(new Set([...oldTimes, ...timesForDay]));
      const newScheduleTimes = [...scheduleTimes];
      newScheduleTimes[idx] = { ...newScheduleTimes[idx], time: newTimes };
      setScheduleTimes(newScheduleTimes);
    } else {
      setScheduleTimes([
        ...scheduleTimes,
        { date: dateNum, day, month, fulldate, time: timesForDay }
      ]);
    }
    setDate("");
    setTimesForDay([]);
    setError("");
  };

  const handleRemoveScheduleTime = (idx: number) => {
    setScheduleTimes(scheduleTimes.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieId || !cinemaId || !cinemaRoomId || !format || scheduleTimes.length === 0) {
      setError("Please fill in all required information!");
      return;
    }
    setIsSubmitting(true);
    onUpdate({
      _id: schedule._id,
      movieId,
      cinemaId,
      cinemaRoomId,
      format,
      scheduleTime: scheduleTimes,
    });
    setIsSubmitting(false);
    onClose();
  };

  const rooms = cinemas.find((c) => c._id === cinemaId)?.rooms || [];
  // Get selected movie
  const selectedMovie = movies.find((m) => m._id === movieId);

  if (!isOpen || !schedule) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        ref={modalRef} 
        className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[95vh] overflow-y-auto" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Edit Schedule</h2>
            <button 
              onClick={onClose} 
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Movie Poster */}
          {selectedMovie?.largeImage && (
            <div className="flex justify-center mb-4">
              <img
                src={selectedMovie.largeImage}
                alt={selectedMovie.versionMovieEnglish}
                className="w-24 h-32 object-cover rounded shadow border"
                style={{ minWidth: 96, minHeight: 128 }}
              />
            </div>
          )}

          {/* Basic Information */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Film className="h-5 w-5 text-gray-600" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Movie *</label>
                <select 
                  value={movieId} 
                  onChange={e => setMovieId(e.target.value)} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a movie</option>
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>{m.versionMovieEnglish}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cinema *</label>
                <select 
                  value={cinemaId} 
                  onChange={e => setCinemaId(e.target.value)} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a cinema</option>
                  {cinemas.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room *</label>
                <select 
                  value={cinemaRoomId} 
                  onChange={e => setCinemaRoomId(e.target.value)} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!cinemaId}
                >
                  <option value="">Select a room</option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>{r.roomName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format *</label>
                <select 
                  value={format} 
                  onChange={e => setFormat(e.target.value)} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select format</option>
                  {formatOptions.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Schedule Times */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              Schedule Times
            </h3>
            
            {/* Add New Schedule */}
            <div className="bg-gray-50 rounded p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-3">Add New Schedule</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => {
                      setDate(e.target.value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const selected = new Date(e.target.value);
                      selected.setHours(0, 0, 0, 0);
                      if (selected < today) {
                        setError("Cannot select past date!");
                      } else {
                        setError("");
                      }
                    }} 
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    min={getToday()} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={time}
                      onChange={e => {
                        let val = e.target.value.replace(/[^0-9]/g, "");
                        if (val.length > 4) val = val.slice(0, 4);
                        if (val.length >= 3) {
                          val = val.slice(0, 2) + ":" + val.slice(2);
                        }
                        const [hh, mm] = val.split(":");
                        if (hh && Number(hh) > 23) {
                          setError("Time must be between 00 and 23");
                        } else if (mm && Number(mm) > 59) {
                          setError("Minute must be between 00 and 59");
                        } else {
                          setError("");
                        }
                        setTime(val);
                      }}
                      onBlur={() => {
                        const val = time.replace(/[^0-9]/g, "");
                        if (val.length === 4) {
                          setTime(val.slice(0,2) + ":" + val.slice(2));
                        } else if (val.length === 3) {
                          setTime("0" + val[0] + ":" + val.slice(1));
                        } else if (val.length === 2) {
                          setTime(val + ":00");
                        } else if (val.length === 1) {
                          setTime("0" + val + ":00");
                        } else {
                          setTime("");
                        }
                      }}
                      className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="HH:MM"
                      maxLength={5}
                    />
                    <button 
                      type="button" 
                      onClick={handleAddTime} 
                      className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      disabled={!time}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <button 
                    type="button" 
                    onClick={handleAddScheduleTime} 
                    className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-medium ml-2"
                    disabled={!date || timesForDay.length === 0}
                  >
                    Add Schedule
                  </button>
                </div>
              </div>

              {/* Selected Times for Current Day */}
              {timesForDay.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected times for {date}:</p>
                  <div className="flex flex-wrap gap-2">
                    {timesForDay.map((t) => (
                      <span key={t} className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {t}
                        <button 
                          type="button" 
                          className="ml-1 text-blue-600 hover:text-blue-800" 
                          onClick={() => handleRemoveTime(t)}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Current Schedules */}
            {scheduleTimes.length > 0 && (
              <div className="bg-gray-50 rounded p-4">
                <h4 className="font-medium text-gray-900 mb-3">Current Schedules ({scheduleTimes.length})</h4>
                <div className="space-y-2">
                  {scheduleTimes.map((st, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{st.fulldate}:</span>
                        <span className="text-gray-600">{st.time.join(", ")}</span>
                      </div>
                      <button 
                        type="button" 
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors" 
                        onClick={() => handleRemoveScheduleTime(idx)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditScheduleModal; 