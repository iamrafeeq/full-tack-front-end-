import { useState } from "react";
import { FaStar } from "react-icons/fa";

export default function StarRating({ value = 0, onChange, readOnly = false, size = "text-xl" }) {
  const [hovered, setHovered] = useState(0);
  const active = readOnly ? value : (hovered || value);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`${size} transition-transform leading-none ${
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
          }`}
        >
          <FaStar className={star <= active ? "text-[#C9A24B]" : "text-gray-200"} />
        </button>
      ))}
    </div>
  );
}
