import { useState } from "react";

const categories = [
  "All",
  "Rooms",
  "Restaurant",
  "Spa",
  "Swimming Pool",
  "Event Hall",
];

const galleryImages = [
  {
    id: 1,
    category: "Rooms",
    image:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    category: "Rooms",
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    category: "Rooms",
    image:
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    category: "Spa",
    image:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 7,
    category: "Spa",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 8,
    category: "Swimming Pool",
    image:
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 9,
    category: "Swimming Pool",
    image:
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 10,
    category: "Event Hall",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 11,
    category: "Event Hall",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 12,
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
  },
];

function Gallery() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredImages =
    activeCategory === "All"
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory);

  return (
    <div className="bg-white text-[#1F2937]">
      <section className="relative h-[50vh] min-h-[350px] w-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80')",
          }}
        ></div>
        <div className="absolute inset-0 bg-[#0B1F2A]/70"></div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <h1 className="font-serif text-4xl sm:text-5xl">Our Gallery</h1>
          <p className="mt-4 max-w-xl text-gray-200">
            A visual tour of LuxuryStay's finest spaces.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-6 py-2.5 text-sm font-medium transition ${
                  activeCategory === category
                    ? "bg-[#0B1F2A] text-white"
                    : "bg-[#F8F8F8] text-[#0B1F2A] hover:bg-[#C9A24B]/20"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                className="group relative overflow-hidden rounded-xl shadow-md"
              >
                <img
                  src={img.image}
                  alt={img.category}
                  className="h-52 w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#0B1F2A]/70 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100">
                  <p className="p-4 text-sm font-medium text-white">
                    {img.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Gallery;