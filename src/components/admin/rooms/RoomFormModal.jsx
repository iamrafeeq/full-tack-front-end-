import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createRoom, updateRoom, clearFormErrors } from "../../../redux/slice/roomSlice/roomSlice";
import { apiBase } from "../../../api/axios";
import { notifySuccess, notifyError } from "../../../utils/toast";
import Spinner from "../../Spinner";

const ROOM_TYPES = ["single", "double", "deluxe", "suite"];
const BED_TYPES  = ["single", "twin", "queen", "king"];
const AMENITIES  = ["AC", "WiFi", "TV", "Minibar", "Balcony", "RoomService", "Heater"];

function AmenitiesInput({ value, presets, onChange }) {
  const [input, setInput] = useState("");

  const add = (item) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    if (!value.map((v) => v.toLowerCase()).includes(trimmed.toLowerCase())) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };

  const remove = (item) => onChange(value.filter((v) => v !== item));

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); add(input); }
  };

  const custom = value.filter((v) => !presets.map((p) => p.toLowerCase()).includes(v.toLowerCase()));

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add custom amenity…"
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#C9A24B]"
        />
        <button type="button" onClick={() => add(input)}
          className="px-3 py-2 text-sm rounded-md bg-[#0B1F2A] text-white hover:opacity-90 whitespace-nowrap">
          Add
        </button>
      </div>
      {custom.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2.5 bg-gray-50 rounded-md border border-gray-200">
          {custom.map((a) => (
            <span key={a} className="inline-flex items-center gap-1 text-xs bg-[#C9A24B]/15 text-[#7a5c1e] px-2.5 py-1 rounded-full font-medium">
              {a}
              <button type="button" onClick={() => remove(a)}
                className="text-[#7a5c1e] hover:text-red-500 leading-none font-bold">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const EMPTY_FORM = {
  roomNumber: "", type: "single", floor: "", capacity: "",
  bedType: "single", price: "", discountPrice: "",
  description: "", smokingAllowed: false, amenities: [],
};

export default function RoomFormModal({ editRoom, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { createLoading, createError, updateLoading, updateError } =
    useSelector((state) => state.rooms);

  const [form, setForm] = useState(editRoom ? {
    roomNumber:     editRoom.roomNumber     || "",
    type:           editRoom.type           || "single",
    floor:          editRoom.floor          || "",
    capacity:       editRoom.capacity       || "",
    bedType:        editRoom.bedType        || "single",
    price:          editRoom.price          || "",
    discountPrice:  editRoom.discountPrice  || "",
    description:    editRoom.description   || "",
    smokingAllowed: editRoom.smokingAllowed || false,
    amenities:      editRoom.amenities     || [],
  } : EMPTY_FORM);

  const [errors, setErrors]     = useState({});
  const [files, setFiles]       = useState([]);    // File objects selected by user
  const [previews, setPreviews] = useState([]);    // Object URLs for thumbnail preview
  const fileInputRef = useRef(null);

  useEffect(() => { dispatch(clearFormErrors()); }, [dispatch]);
  useEffect(() => { if (apiError) notifyError(apiError); }, [apiError]);

  // Revoke object URLs when previews change or component unmounts
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const isEditing = !!editRoom;
  const loading   = isEditing ? updateLoading : createLoading;
  const apiError  = isEditing ? updateError   : createError;

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.roomNumber.trim())      e.roomNumber = "Room number is required.";
    if (!form.floor)                  e.floor      = "Floor is required.";
    if (!form.capacity)               e.capacity   = "Capacity is required.";
    if (!form.price)                  e.price      = "Price is required.";
    else if (Number(form.price) <= 0) e.price      = "Price must be greater than 0.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Field handlers ─────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files).slice(0, 5);
    setFiles(selected);
    setPreviews((prev) => {
      prev.forEach(URL.revokeObjectURL);
      return selected.map((f) => URL.createObjectURL(f));
    });
  };

  const removePreview = (index) => {
    URL.revokeObjectURL(previews[index]);
    const newFiles    = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Submit — sends FormData so images are included ─────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    fd.append("roomNumber",    form.roomNumber.trim());
    fd.append("type",          form.type);
    fd.append("floor",         String(Number(form.floor)));
    fd.append("capacity",      String(Number(form.capacity)));
    fd.append("bedType",       form.bedType);
    fd.append("price",         String(Number(form.price)));
    if (form.discountPrice) fd.append("discountPrice", String(Number(form.discountPrice)));
    if (form.description)   fd.append("description",   form.description.trim());
    fd.append("amenities",     JSON.stringify(form.amenities));
    fd.append("smokingAllowed", String(form.smokingAllowed));
    files.forEach((file) => fd.append("images", file));

    const action = isEditing
      ? updateRoom({ id: editRoom._id, roomData: fd })
      : createRoom(fd);

    dispatch(action).then((result) => {
      if (!result.error) {
        notifySuccess(isEditing ? "Room updated successfully." : "Room created successfully.");
        onSuccess?.();
        onClose();
      }
    });
  };

  const inputCls = (field) =>
    `w-full border rounded-md px-3 py-2 text-sm focus:outline-none transition-colors ${
      errors[field] ? "border-red-400" : "border-gray-300 focus:border-[#C9A24B]"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-serif text-[#0B1F2A]">
            {isEditing ? `Edit Room — ${editRoom.roomNumber}` : "Add New Room"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Row 1: Room Number + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Room Number *</label>
              <input name="roomNumber" value={form.roomNumber} onChange={handleChange}
                className={inputCls("roomNumber")} placeholder="e.g. 101" />
              {errors.roomNumber && <p className="text-red-500 text-xs mt-1">{errors.roomNumber}</p>}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Room Type *</label>
              <select name="type" value={form.type} onChange={handleChange} className={inputCls("type")}>
                {ROOM_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Floor + Capacity + Bed Type */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Floor *</label>
              <input type="number" name="floor" value={form.floor} onChange={handleChange}
                className={inputCls("floor")} placeholder="1" min="1" />
              {errors.floor && <p className="text-red-500 text-xs mt-1">{errors.floor}</p>}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Capacity *</label>
              <input type="number" name="capacity" value={form.capacity} onChange={handleChange}
                className={inputCls("capacity")} placeholder="2" min="1" />
              {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Bed Type *</label>
              <select name="bedType" value={form.bedType} onChange={handleChange} className={inputCls("bedType")}>
                {BED_TYPES.map((b) => (
                  <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Price + Discount Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Price / Night ($) *</label>
              <input type="number" name="price" value={form.price} onChange={handleChange}
                className={inputCls("price")} placeholder="150" min="1" />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Discount Price ($)</label>
              <input type="number" name="discountPrice" value={form.discountPrice} onChange={handleChange}
                className={inputCls("discountPrice")} placeholder="Optional" min="0" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={3} className={`${inputCls("description")} resize-none`}
              placeholder="Brief description of the room..." />
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-2">
              Amenities <span className="normal-case text-gray-400 font-normal">(select presets or add your own)</span>
            </label>
            {/* Preset toggles */}
            <div className="flex flex-wrap gap-2 mb-3">
              {AMENITIES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    form.amenities.includes(a)
                      ? "bg-[#0B1F2A] text-[#C9A24B] border-[#0B1F2A] font-medium"
                      : "border-gray-300 text-gray-500 hover:border-[#C9A24B]"
                  }`}
                >
                  {form.amenities.includes(a) ? "✓ " : "+ "}{a}
                </button>
              ))}
            </div>
            {/* Custom amenity input */}
            <AmenitiesInput
              value={form.amenities}
              presets={AMENITIES}
              onChange={(updated) => setForm((prev) => ({ ...prev, amenities: updated }))}
            />
          </div>

          {/* Smoking allowed */}
          <div className="flex items-center gap-3">
            <input type="checkbox" id="smokingAllowed" name="smokingAllowed"
              checked={form.smokingAllowed} onChange={handleChange}
              className="w-4 h-4 accent-[#C9A24B]" />
            <label htmlFor="smokingAllowed" className="text-sm text-gray-600">Smoking Allowed</label>
          </div>

          {/* ── Images ──────────────────────────────────────────────────────── */}
          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-2">
              Room Images{" "}
              <span className="normal-case font-normal text-gray-400">
                (jpg · png · webp · gif — up to 5 files, 5 MB each)
              </span>
            </label>

            {/* Existing images shown in edit mode while no new selection */}
            {isEditing && editRoom.images?.length > 0 && previews.length === 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-1.5">
                  Current images — choose new files to replace them all:
                </p>
                <div className="flex flex-wrap gap-2">
                  {editRoom.images.map((img, i) => (
                    <img
                      key={i}
                      src={img.startsWith("http") ? img : `${apiBase}/${img}`}
                      alt={`Current room image ${i + 1}`}
                      className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Thumbnails of newly selected files */}
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {previews.map((url, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${i + 1}`}
                      className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removePreview(i)}
                      aria-label="Remove image"
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Styled file-picker trigger */}
            <label className="inline-flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 hover:border-[#C9A24B] rounded-lg px-4 py-3 text-sm text-gray-500 hover:text-[#0B1F2A] transition-colors select-none">
              <span className="text-lg">📷</span>
              <span>
                {files.length > 0
                  ? `${files.length} image${files.length > 1 ? "s" : ""} selected`
                  : "Choose images"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                multiple
                onChange={handleFiles}
                className="sr-only"
              />
            </label>
          </div>

        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="border border-gray-300 text-[#0B1F2A] text-sm px-5 py-2 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="inline-flex items-center gap-1.5 justify-center bg-[#0B1F2A] text-white text-sm px-5 py-2 rounded-md hover:opacity-90 disabled:opacity-60">
            {loading ? <><Spinner size="sm" color="white" /> {isEditing ? "Save Changes" : "Add Room"}</> : isEditing ? "Save Changes" : "Add Room"}
          </button>
        </div>
      </div>
    </div>
  );
}
