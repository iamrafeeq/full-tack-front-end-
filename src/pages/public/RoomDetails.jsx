import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSingleRoom, clearSingleRoom } from "../../redux/slice/roomSlice/roomSlice";
import { apiBase } from "../../api/axios";

// Room type → image mapping (rooms in DB don't have image fields)
const TYPE_IMAGES = {
  single: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
  double: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
  deluxe: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80",
  suite:  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
};
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80";

// Map amenity keys (from DB) to display label + icon
const AMENITY_MAP = {
  AC:          { icon: "❄️",  label: "Air Conditioning" },
  WiFi:        { icon: "📶", label: "Free WiFi" },
  TV:          { icon: "📺", label: "Smart TV" },
  Minibar:     { icon: "🍹", label: "Minibar" },
  Balcony:     { icon: "🌿", label: "Balcony" },
  RoomService: { icon: "🛎️",  label: "Room Service" },
  Heater:      { icon: "🔥", label: "Heater" },
};

function RoomDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { singleRoom: room, singleLoading, singleError } = useSelector((state) => state.rooms);

  useEffect(() => {
    dispatch(fetchSingleRoom(id));
    // Clear when leaving the page so stale data doesn't flash on next visit
    return () => dispatch(clearSingleRoom());
  }, [dispatch, id]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (singleLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-[#C9A24B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Error / Not found ──────────────────────────────────────────────────────
  if (singleError || !room) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-6 text-center">
        <p className="text-6xl">🛏️</p>
        <h1 className="mt-6 font-serif text-3xl text-[#0B1F2A]">Room Not Found</h1>
        <p className="mt-3 max-w-md text-gray-500">
          {singleError || "The room you are looking for does not exist or may have been removed."}
        </p>
        <Link
          to="/rooms"
          className="mt-8 rounded-full bg-[#0B1F2A] px-8 py-3 font-medium text-white transition hover:scale-105 hover:opacity-90"
        >
          Back to Rooms
        </Link>
      </div>
    );
  }

  // Use first uploaded image if available, otherwise fall back to type placeholder
  const image = room.images?.[0]
    ? `${apiBase}/${room.images[0]}`
    : (TYPE_IMAGES[room.type] || DEFAULT_IMAGE);

  // Gallery — use all uploaded images, or repeat the main image as placeholder
  const gallery = room.images?.length > 0
    ? room.images.map((img) => `${apiBase}/${img}`)
    : [image, image, image];
  const price       = room.discountPrice || room.price;
  const isAvail     = room.status !== "maintenance";
  const isOccupied  = room.status === "occupied" || room.status === "cleaning";

  return (
    <div className="bg-white text-[#1F2937]">
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[400px] w-full">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${image}')` }} />
        <div className="absolute inset-0 bg-[#0B1F2A]/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <h1 className="font-serif text-4xl sm:text-5xl">Room {room.roomNumber}</h1>
          <p className="mt-2 text-lg capitalize text-[#C9A24B]">{room.type}</p>
          <span className={`mt-3 text-xs font-medium px-3 py-1 rounded-full capitalize ${
            room.status === "available"  ? "bg-green-400/20 text-green-300"
            : room.status === "occupied" ? "bg-orange-400/20 text-orange-300"
            : room.status === "cleaning" ? "bg-yellow-400/20 text-yellow-300"
            : room.status === "reserved" ? "bg-blue-400/20 text-blue-300"
            : "bg-red-400/20 text-red-300"
          }`}>
            {room.status === "occupied" ? "occupied now — bookable for future dates" : room.status}
          </span>
        </div>
      </section>

      {/* Body */}
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-3">

          {/* Left — details */}
          <div className="lg:col-span-2">
            {/* Quick stats */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-6">
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-400">Room Type</p>
                <p className="mt-1 font-medium capitalize text-[#0B1F2A]">{room.type}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-400">Floor</p>
                <p className="mt-1 font-medium text-[#0B1F2A]">Floor {room.floor}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-400">Capacity</p>
                <p className="mt-1 font-medium text-[#0B1F2A]">{room.capacity} Guests</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-400">Bed Type</p>
                <p className="mt-1 font-medium capitalize text-[#0B1F2A]">{room.bedType}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-400">Price</p>
                {room.discountPrice ? (
                  <p className="mt-1">
                    <span className="font-semibold text-[#C9A24B]">${room.discountPrice}<span className="text-xs text-gray-400">/night</span></span>
                    <span className="ml-2 text-xs text-gray-400 line-through">${room.price}</span>
                  </p>
                ) : (
                  <p className="mt-1 font-semibold text-[#C9A24B]">${room.price}<span className="text-xs text-gray-400">/night</span></p>
                )}
              </div>
            </div>

            {/* Description */}
            {room.description && (
              <>
                <h2 className="mt-8 font-serif text-2xl text-[#0B1F2A]">Description</h2>
                <p className="mt-4 leading-relaxed text-gray-600">{room.description}</p>
              </>
            )}

            {/* Amenities */}
            {room.amenities?.length > 0 && (
              <>
                <h2 className="mt-10 font-serif text-2xl text-[#0B1F2A]">Amenities</h2>
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {room.amenities.map((key) => {
                    const amenity = AMENITY_MAP[key] || { icon: "✔️", label: key };
                    return (
                      <div
                        key={key}
                        className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3 transition hover:border-[#C9A24B]"
                      >
                        <span className="text-xl">{amenity.icon}</span>
                        <span className="text-sm text-gray-600">{amenity.label}</span>
                      </div>
                    );
                  })}
                  {room.smokingAllowed && (
                    <div className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3">
                      <span className="text-xl">🚬</span>
                      <span className="text-sm text-gray-600">Smoking Allowed</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Gallery — shows uploaded images */}
            {gallery.length > 0 && (
              <>
                <h2 className="mt-10 font-serif text-2xl text-[#0B1F2A]">Gallery</h2>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {gallery.map((img, i) => (
                    <div key={i} className="overflow-hidden rounded-xl">
                      <img
                        src={img}
                        alt={`Room ${room.roomNumber} — photo ${i + 1}`}
                        className="h-40 w-full object-cover transition duration-500 hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Hotel policies */}
            <h2 className="mt-10 font-serif text-2xl text-[#0B1F2A]">Hotel Policies</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[#F8F8F8] p-5">
                <p className="text-sm font-medium text-[#0B1F2A]">Check-in / Check-out</p>
                <p className="mt-2 text-sm text-gray-500">Check-in from 2:00 PM, Check-out until 12:00 PM.</p>
              </div>
              <div className="rounded-xl bg-[#F8F8F8] p-5">
                <p className="text-sm font-medium text-[#0B1F2A]">Cancellation Policy</p>
                <p className="mt-2 text-sm text-gray-500">Free cancellation up to 48 hours before check-in.</p>
              </div>
            </div>
          </div>

          {/* Right — booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-xl">
              <img
                src={image}
                alt={`Room ${room.roomNumber}`}
                className="h-40 w-full rounded-xl object-cover"
              />
              <p className="mt-5 font-serif text-xl text-[#0B1F2A]">Room {room.roomNumber}</p>
              <p className="mt-1 text-sm capitalize text-gray-400">{room.type} · {room.bedType} bed · {room.capacity} guests</p>
              <p className="mt-3 text-2xl font-semibold text-[#C9A24B]">
                ${price}
                <span className="text-sm text-gray-400">/night</span>
              </p>

              {isAvail ? (
                <Link
                  to={`/booking?room=${room._id}`}
                  className="mt-6 block rounded-full bg-[#C9A24B] py-3 text-center font-medium text-[#0B1F2A] transition hover:scale-105 hover:opacity-90"
                >
                  {isOccupied ? "Book for Future Dates" : "Book Now"}
                </Link>
              ) : (
                <div className="mt-6 rounded-full bg-gray-100 py-3 text-center text-sm font-medium text-gray-400">
                  Under Maintenance
                </div>
              )}

              <Link
                to="/rooms"
                className="mt-3 block text-center text-sm text-gray-400 underline hover:text-[#0B1F2A]"
              >
                Browse all rooms
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

export default RoomDetails;
