import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import AvailabilityWidget from "../../components/public/AvailabilityWidget";

const Home = () => {
  const [activeFacility, setActiveFacility] = useState("Restaurant");

  const navLinks = [
    { name: "Home", to: "/" },
    { name: "About", to: "/about" },
    { name: "Rooms", to: "/rooms" },
      { name: "Gallery", to: "/gallery" },
    { name: "Contact", to: "/contact" },
  ];

  const rooms = [
    {
      id: 1,
      name: "Deluxe Ocean Suite",
      price: 320,
      desc: "Spacious suite with panoramic ocean views, king bed, and private balcony.",
      img: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: 2,
      name: "Royal Executive Room",
      price: 450,
      desc: "Elegant interiors with a private lounge, marble bath, and skyline views.",
      img: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: 3,
      name: "Presidential Penthouse",
      price: 780,
      desc: "The pinnacle of luxury with a private terrace, jacuzzi, and butler service.",
      img: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: 4,
      name: "Garden View Room",
      price: 260,
      desc: "Tranquil room overlooking manicured gardens with modern comforts.",
      img: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200&auto=format&fit=crop",
    },
  ];

  const facilities = {
    Restaurant: {
      title: "Fine Dining Restaurant",
      desc: "Savor world-class cuisine crafted by award-winning chefs in an ambiance of refined elegance. Our restaurant blends international flavors with locally sourced ingredients for an unforgettable culinary journey.",
      hours: "6:00 AM – 11:30 PM",
      info: "Reservations recommended. Private dining rooms available on request.",
      img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop",
    },
    Spa: {
      title: "Luxury Wellness Spa",
      desc: "Indulge in rejuvenating therapies and holistic treatments designed to restore balance to your body and mind, delivered by our expert wellness therapists.",
      hours: "9:00 AM – 9:00 PM",
      info: "Couples suites and signature hot-stone therapy available.",
      img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop",
    },
    Gym: {
      title: "State-of-the-Art Fitness Center",
      desc: "Stay on top of your fitness goals with our fully equipped gym featuring the latest cardio and strength training equipment, plus personal trainers on call.",
      hours: "24 Hours",
      info: "Complimentary for all in-house guests. Personal training sessions bookable at the front desk.",
      img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop",
    },
    "Swimming Pool": {
      title: "Infinity Swimming Pool",
      desc: "Unwind in our stunning infinity pool overlooking the skyline, complete with a poolside bar and private cabanas for the ultimate relaxation.",
      hours: "6:00 AM – 10:00 PM",
      info: "Towel service and poolside dining available all day.",
      img: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200&auto=format&fit=crop",
    },
    "Conference Hall": {
      title: "Grand Conference Hall",
      desc: "Host unforgettable events and business meetings in our elegant conference hall, equipped with cutting-edge AV technology and customizable seating.",
      hours: "8:00 AM – 10:00 PM",
      info: "Capacity up to 500 guests. Full event planning services available.",
      img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop",
    },
    Parking: {
      title: "Valet & Secure Parking",
      desc: "Enjoy peace of mind with our complimentary valet parking service and secure, monitored parking facilities available around the clock.",
      hours: "24 Hours",
      info: "Complimentary valet for all hotel guests. EV charging stations available.",
      img: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=1200&auto=format&fit=crop",
    },
  };

  const facilityTabs = Object.keys(facilities);

  const stats = [
    { number: "500+", label: "Luxury Rooms" },
    { number: "20+", label: "Years of Excellence" },
    { number: "50K+", label: "Happy Guests" },
    { number: "100+", label: "Dedicated Staff" },
  ];

  const galleryImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800&auto=format&fit=crop",
  ];

  const testimonials = [
    {
      name: "Sophia Williams",
      role: "Travel Blogger",
      text: "An extraordinary experience from check-in to check-out. The staff anticipated our every need and the suite was beyond stunning.",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
      stars: 5,
    },
    {
      name: "James Anderson",
      role: "Business Executive",
      text: "LuxuryStay redefined what a five-star hotel means to me. Impeccable service, breathtaking views, and world-class dining.",
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
      stars: 5,
    },
    {
      name: "Isabella Moore",
      role: "Honeymoon Guest",
      text: "Our honeymoon was pure magic thanks to the attentive staff and the most romantic penthouse suite we could imagine.",
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
      stars: 5,
    },
  ];

  return (
    <div className="bg-[#0B1F2A] text-white font-sans overflow-x-hidden">
      {/* HERO */}
      <section
        id="home"
        className="relative h-screen w-full flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1F2A]/80 via-[#0B1F2A]/60 to-[#0B1F2A]"></div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <p className="text-[#C9A24B] tracking-[0.3em] text-sm md:text-base font-medium mb-4 uppercase">
            Welcome To LuxuryStay Hotel
          </p>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-tight mb-6">
            An Unforgettable <span className="text-[#C9A24B]">Luxury</span>{" "}
            Experience Awaits
          </h1>
          <p className="text-gray-200 text-base md:text-lg max-w-2xl mx-auto mb-10 font-light">
            Discover timeless elegance, exceptional service, and breathtaking
            views at one of the world's most prestigious five-star
            destinations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/booking"
              className="px-8 py-3.5 bg-[#C9A24B] text-[#0B1F2A] font-semibold rounded-full tracking-wide transition-all duration-300 hover:bg-white hover:scale-105 shadow-lg text-center"
            >
              Book Now
            </Link>
            <Link
              to="/rooms"
              className="px-8 py-3.5 border border-white/70 text-white font-semibold rounded-full tracking-wide transition-all duration-300 hover:bg-white hover:text-[#0B1F2A] hover:scale-105 text-center"
            >
              Explore Rooms
            </Link>
          </div>
        </div>
      </section>

      <AvailabilityWidget />

      {/* ABOUT */}
      <section id="about" className="py-28 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop"
              alt="Luxury Hotel Lobby"
              className="rounded-2xl shadow-2xl w-full h-[480px] object-cover"
            />
            <div className="absolute -bottom-8 -right-6 bg-[#C9A24B] text-[#0B1F2A] rounded-2xl px-8 py-6 shadow-xl hidden sm:block">
              <p className="text-3xl font-serif font-bold">20+</p>
              <p className="text-xs font-semibold tracking-wide uppercase">
                Years of Excellence
              </p>
            </div>
          </div>

          <div>
            <p className="text-[#C9A24B] tracking-[0.3em] text-sm font-medium mb-3 uppercase">
              About LuxuryStay
            </p>
            <h2 className="font-serif text-3xl md:text-5xl leading-tight mb-6">
              Where Elegance Meets{" "}
              <span className="text-[#C9A24B]">Comfort</span>
            </h2>
            <p className="text-gray-300 leading-relaxed mb-6 font-light">
              For over two decades, LuxuryStay has stood as a beacon of
              refined hospitality, offering guests an unparalleled blend of
              timeless architecture, modern amenities, and personalized
              service. Every detail is meticulously curated to create an
              experience beyond expectation.
            </p>
            <p className="text-gray-400 leading-relaxed mb-8 font-light">
              From our award-winning restaurants to our tranquil spa
              retreats, every corner of LuxuryStay is designed to indulge
              your senses and elevate your stay into an unforgettable
              journey.
            </p>
            <button className="px-8 py-3.5 bg-transparent border border-[#C9A24B] text-[#C9A24B] font-semibold rounded-full tracking-wide transition-all duration-300 hover:bg-[#C9A24B] hover:text-[#0B1F2A]">
              Read More
            </button>
          </div>
        </div>
      </section>

      {/* FEATURED ROOMS */}
      <section id="rooms" className="py-28 px-6 bg-[#13293D]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-[#C9A24B] tracking-[0.3em] text-sm font-medium mb-3 uppercase">
              Accommodation
            </p>
            <h2 className="font-serif text-3xl md:text-5xl leading-tight">
              Our Featured Rooms & Suites
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="group bg-[#0B1F2A] rounded-2xl overflow-hidden shadow-xl transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl"
              >
                <div className="overflow-hidden h-56">
                  <img
                    src={room.img}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl mb-2">{room.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 font-light leading-relaxed">
                    {room.desc}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-[#C9A24B] font-semibold">
                      ${room.price}
                      <span className="text-gray-400 text-xs font-normal">
                        {" "}
                        /night
                      </span>
                    </p>
                    <Link
                      to="/rooms"
                      className="text-xs font-semibold tracking-wide px-4 py-2 border border-[#C9A24B] text-[#C9A24B] rounded-full transition-all duration-300 hover:bg-[#C9A24B] hover:text-[#0B1F2A]"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FACILITIES - LUXURY BACKGROUND SECTION */}
      <section
        id="facilities"
        className="relative py-28 px-6 bg-fixed bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2000&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-[#0B1F2A]/85"></div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-[#C9A24B] tracking-[0.3em] text-sm font-medium mb-3 uppercase">
              World-Class Amenities
            </p>
            <h2 className="font-serif text-3xl md:text-5xl leading-tight text-white">
              Hotel Facilities & Services
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {facilityTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFacility(tab)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 ${
                  activeFacility === tab
                    ? "bg-[#C9A24B] text-[#0B1F2A] shadow-lg scale-105"
                    : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Glass Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 md:p-10 transition-all duration-500">
            <div
              key={activeFacility}
              className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center animate-[fadeIn_0.5s_ease-in-out]"
            >
              <div className="overflow-hidden rounded-2xl h-[380px] shadow-lg">
                <img
                  src={facilities[activeFacility].img}
                  alt={facilities[activeFacility].title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
              </div>

              <div>
                <h3 className="font-serif text-2xl md:text-3xl text-[#0B1F2A] mb-4">
                  {facilities[activeFacility].title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6 font-light">
                  {facilities[activeFacility].desc}
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 border-t border-gray-200 pt-4">
                    <span className="text-[#C9A24B] font-semibold text-sm uppercase tracking-wide min-w-[140px]">
                      Service Hours
                    </span>
                    <span className="text-[#13293D] text-sm font-medium">
                      {facilities[activeFacility].hours}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 border-t border-gray-200 pt-4">
                    <span className="text-[#C9A24B] font-semibold text-sm uppercase tracking-wide min-w-[140px]">
                      Additional Info
                    </span>
                    <span className="text-[#13293D] text-sm font-medium">
                      {facilities[activeFacility].info}
                    </span>
                  </div>
                </div>

                <button className="mt-8 px-7 py-3 bg-[#0B1F2A] text-white font-semibold rounded-full tracking-wide text-sm transition-all duration-300 hover:bg-[#C9A24B] hover:text-[#0B1F2A] hover:scale-105">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="py-20 px-6 bg-[#0B1F2A] border-y border-white/10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="transition-transform duration-300 hover:scale-110"
            >
              <p className="font-serif text-4xl md:text-5xl text-[#C9A24B] mb-2">
                {stat.number}
              </p>
              <p className="text-gray-300 text-sm md:text-base tracking-wide uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="py-28 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-[#C9A24B] tracking-[0.3em] text-sm font-medium mb-3 uppercase">
            Moments
          </p>
          <h2 className="font-serif text-3xl md:text-5xl leading-tight">
            Explore Our Gallery
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((img, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-xl shadow-lg h-64"
            >
              <img
                src={img}
                alt={`Gallery ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-125 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-28 px-6 bg-[#13293D]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-[#C9A24B] tracking-[0.3em] text-sm font-medium mb-3 uppercase">
              Testimonials
            </p>
            <h2 className="font-serif text-3xl md:text-5xl leading-tight">
              What Our Guests Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-[#0B1F2A] rounded-2xl p-8 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-[#C9A24B]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.363 1.118l1.287 3.958c.3.922-.755 1.688-1.538 1.118l-3.367-2.447a1 1 0 00-1.176 0l-3.367 2.447c-.783.57-1.838-.196-1.538-1.118l1.287-3.958a1 1 0 00-.363-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.958z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 font-light italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={t.img}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#C9A24B]"
                  />
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section
        className="relative py-32 px-6 bg-fixed bg-cover bg-center text-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2000&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-[#0B1F2A]/80"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-[#C9A24B] tracking-[0.3em] text-sm font-medium mb-4 uppercase">
            Reserve Your Stay
          </p>
          <h2 className="font-serif text-3xl md:text-5xl leading-tight mb-8">
            Book Your Dream Stay Today
          </h2>
          <Link
            to="/booking"
            className="inline-block px-10 py-4 bg-[#C9A24B] text-[#0B1F2A] font-semibold rounded-full tracking-wide transition-all duration-300 hover:bg-white hover:scale-105 shadow-xl"
          >
            Book Now
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-[#0B1F2A] border-t border-white/10 pt-20 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-14">
          <div>
            <h3 className="font-serif text-2xl mb-4">
              Luxury<span className="text-[#C9A24B]">Stay</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              Experience unparalleled luxury and timeless elegance at one of
              the world's most prestigious five-star hotels.
            </p>
          </div>

          <div>
            <h4 className="text-[#C9A24B] font-semibold mb-4 tracking-wide text-sm uppercase">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <NavLink
                    to={link.to}
                    className="text-gray-400 text-sm font-light transition-all duration-300 hover:text-[#C9A24B] hover:pl-1"
                  >
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[#C9A24B] font-semibold mb-4 tracking-wide text-sm uppercase">
              Contact Us
            </h4>
            <ul className="space-y-3 text-gray-400 text-sm font-light">
              <li>123 Ocean Drive, Miami, FL</li>
              <li>+1 (234) 567-8900</li>
              <li>info@luxurystay.com</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#C9A24B] font-semibold mb-4 tracking-wide text-sm uppercase">
              Newsletter
            </h4>
            <p className="text-gray-400 text-sm font-light mb-4">
              Subscribe for exclusive offers and updates.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="bg-white/10 text-white text-sm px-4 py-2.5 rounded-l-lg w-full focus:outline-none placeholder-gray-500"
              />
              <button className="bg-[#C9A24B] text-[#0B1F2A] px-4 rounded-r-lg font-semibold text-sm transition-all duration-300 hover:bg-white">
                Go
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs font-light">
            © {new Date().getFullYear()} LuxuryStay Hotel. All Rights
            Reserved.
          </p>
          <div className="flex gap-4">
            {["Facebook", "Instagram", "Twitter"].map((s) => (
              <a
                key={s}
                href="#"
                className="text-gray-500 text-xs font-light transition-all duration-300 hover:text-[#C9A24B]"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;