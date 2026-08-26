import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllRooms } from "../../redux/slice/roomSlice/roomSlice";
import { fetchRoomFeedback } from "../../redux/slice/feedback/feedbackSlice";
import { apiBase } from "../../api/axios";
import { notifyError } from "../../utils/toast";
import SkeletonCard from "../../components/SkeletonCard";

// Fallback image per room type (rooms in DB don't have image fields)
const TYPE_IMAGES = {
  single: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80",
  double: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80",
  deluxe: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",
  suite:  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80",
};
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80";

const TYPE_FILTERS = ["all", "single", "double", "deluxe", "suite"];

function Rooms() {
  const dispatch = useDispatch();
  const { rooms, loading, error } = useSelector((state) => state.rooms);
  const { roomFeedback } = useSelector((state) => state.feedback);

  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [capacity,   setCapacity]   = useState("all");
  const [sortBy,     setSortBy]     = useState("default");

  useEffect(() => {
    dispatch(fetchAllRooms());
  }, [dispatch]);

  useEffect(() => { if (error) notifyError(error); }, [error]);

  // Fetch ratings for every room once the room list is loaded
  useEffect(() => {
    if (rooms.length > 0) {
      rooms.forEach((r) => dispatch(fetchRoomFeedback(r._id)));
    }
  }, [rooms.length, dispatch]);

  const filtered = rooms
    .filter((r) =>
      r.roomNumber?.toLowerCase().includes(search.toLowerCase()) ||
      r.type?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((r) => typeFilter === "all" || r.type === typeFilter)
    .filter((r) => capacity   === "all" || r.capacity >= Number(capacity))
    .sort((a, b) => {
      const aPrice = a.discountPrice || a.price;
      const bPrice = b.discountPrice || b.price;
      if (sortBy === "lowToHigh")  return aPrice - bPrice;
      if (sortBy === "highToLow")  return bPrice - aPrice;
      return 0;
    });

  return (
    <div className="bg-white text-[#1F2937]">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] w-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-[#0B1F2A]/70" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <h1 className="font-serif text-4xl sm:text-5xl">Luxury Rooms</h1>
          <p className="mt-4 text-gray-200">Choose your perfect stay.</p>
        </div>
      </section>

      {/* Filters */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow-xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">Search Room</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Room number or type..."
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#C9A24B] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">Room Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#C9A24B] focus:outline-none"
              >
                {TYPE_FILTERS.map((t) => (
                  <option key={t} value={t}>
                    {t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">Capacity</label>
              <select
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#C9A24B] focus:outline-none"
              >
                <option value="all">Any</option>
                <option value="2">2+ Guests</option>
                <option value="3">3+ Guests</option>
                <option value="4">4+ Guests</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">Sort By Price</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#C9A24B] focus:outline-none"
              >
                <option value="default">Default</option>
                <option value="lowToHigh">Low to High</option>
                <option value="highToLow">High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Room cards */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({length: 3}, (_, i) => <SkeletonCard key={i} hasImage={true} />)}
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <p className="text-center text-gray-500 py-12">No rooms match your filters.</p>
          )}

          {/* Cards */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((room) => {
                // Use first uploaded image if available, otherwise fall back to type placeholder
                const image    = room.images?.[0]
                  ? (room.images[0].startsWith("http") ? room.images[0] : `${apiBase}/${room.images[0]}`)
                  : (TYPE_IMAGES[room.type] || DEFAULT_IMAGE);
                const price       = room.discountPrice || room.price;
                const isAvail     = room.status !== "maintenance"; // maintenance = truly off-limits
                const isOccupied  = room.status === "occupied" || room.status === "cleaning";

                return (
                  <div
                    key={room._id}
                    className="group overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={image}
                        alt={`Room ${room.roomNumber}`}
                        className="h-56 w-full object-cover transition duration-500 group-hover:scale-110"
                      />
                      {/* Status badge — operational status only, not a booking gate */}
                      <span className={`absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                        room.status === "available"    ? "bg-green-100 text-green-700"
                        : room.status === "occupied"   ? "bg-orange-100 text-orange-700"
                        : room.status === "cleaning"   ? "bg-yellow-100 text-yellow-700"
                        : room.status === "reserved"   ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-600"   // maintenance
                      }`}>
                        {room.status === "occupied" ? "occupied now" : room.status}
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-serif text-xl text-[#0B1F2A]">
                            Room {room.roomNumber}
                          </h3>
                          <span className="text-xs tracking-wide text-gray-400 capitalize">
                            {room.type} · Floor {room.floor}
                          </span>
                        </div>
                        <div className="text-right">
                          {room.discountPrice ? (
                            <>
                              <p className="font-semibold text-[#C9A24B]">${room.discountPrice}<span className="text-xs text-gray-400">/night</span></p>
                              <p className="text-xs text-gray-400 line-through">${room.price}</p>
                            </>
                          ) : (
                            <p className="font-semibold text-[#C9A24B]">${room.price}<span className="text-xs text-gray-400">/night</span></p>
                          )}
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-gray-500">
                        {room.capacity} Guests · {room.bedType} bed
                      </p>

                      {/* Guest rating */}
                      {(() => {
                        const fb = roomFeedback[room._id];
                        if (!fb || fb.totalCount === 0) return null;
                        return (
                          <div className="mt-2 flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <span
                                key={n}
                                className={`text-sm leading-none ${n <= Math.round(fb.averageRating) ? "text-[#C9A24B]" : "text-gray-200"}`}
                              >★</span>
                            ))}
                            <span className="text-sm font-medium text-[#0B1F2A]">{fb.averageRating}</span>
                            <span className="text-xs text-gray-400">
                              ({fb.totalCount} {fb.totalCount === 1 ? "review" : "reviews"})
                            </span>
                          </div>
                        );
                      })()}

                      {/* Amenity pills (first 3) */}
                      {room.amenities?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                          {room.amenities.slice(0, 3).map((a) => (
                            <span key={a} className="rounded-full bg-[#3AC4FA]/10 px-3 py-1 text-[#0B1F2A]">{a}</span>
                          ))}
                          {room.amenities.length > 3 && (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-500">+{room.amenities.length - 3}</span>
                          )}
                        </div>
                      )}

                      <div className="mt-5 flex gap-3">
                        <Link
                          to={`/rooms/${room._id}`}
                          className="flex-1 rounded-full border border-[#0B1F2A] py-2.5 text-center text-sm font-medium text-[#0B1F2A] transition hover:bg-[#0B1F2A] hover:text-white"
                        >
                          View Details
                        </Link>
                        {isAvail ? (
                          <Link
                            to={`/booking?room=${room._id}`}
                            className="flex-1 rounded-full bg-[#C9A24B] py-2.5 text-center text-sm font-medium text-[#0B1F2A] transition hover:scale-105 hover:opacity-90"
                          >
                            {isOccupied ? "Book Future" : "Book Now"}
                          </Link>
                        ) : (
                          <span className="flex-1 rounded-full bg-gray-200 py-2.5 text-center text-sm font-medium text-gray-400 cursor-not-allowed">
                            Maintenance
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Rooms;
