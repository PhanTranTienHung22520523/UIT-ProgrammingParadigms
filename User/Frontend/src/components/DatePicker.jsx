import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const customCss = `
  .rdp {
    --rdp-cell-size: 40px;
    --rdp-accent-color: #ef4444; /* Màu đỏ thương hiệu (brand-red) */
    --rdp-background-color: #fca5a5;
    border: 1px solid #374151; /* gray-700 */
    border-radius: 0.5rem;
    background-color: #1f2937; /* gray-800 */
  }
  .rdp-caption_label { font-weight: 700; color: #fff; }
  .rdp-nav_button { color: #fff; border-radius: 0.25rem; }
  .rdp-nav_button:hover { background-color: #4b5563; }
  .rdp-head_cell { color: #9ca3af; /* gray-400 */ font-weight: 600; }
  .rdp-day { color: #d1d5db; /* gray-300 */ }
  .rdp-day:hover { background-color: #4b5563 !important; }
  .rdp-day_selected { background-color: #ef4444 !important; color: #fff !important; }
  .rdp-day_today { color: #ef4444 !important; font-weight: 700; }
  .rdp-day_outside { color: #4b5563 !important; }
`;

export const DatePicker = ({ date, setDate, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  // Đóng picker khi người dùng click ra bên ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pickerRef]);

  const handleSelectDate = (selectedDate) => {
    setDate(selectedDate);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <style>{customCss}</style>
      <div className="relative">
        <CalendarIcon className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full pl-12 pr-4 py-3 bg-white/95 text-gray-900 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-brand-red flex items-center justify-between"
        >
          <span className={!date ? 'text-gray-500' : ''}>
            {date ? format(date, 'dd/MM/yyyy') : (placeholder || "Chọn một ngày")}
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-2 rounded-lg shadow-lg">
          <DayPicker
            mode="single"
            selected={date}
            onSelect={handleSelectDate}
            initialFocus
            captionLayout="dropdown-buttons"
            fromYear={1950}
            toYear={new Date().getFullYear()} // Chỉ cho phép chọn từ 1950 đến năm hiện tại
          />
        </div>
      )}
    </div>
  );
};