import { Link } from "react-router-dom";

const stats = [
  { value: "500+", label: "Luxury Rooms" },
  { value: "20+", label: "Years Experience" },
  { value: "50K+", label: "Happy Guests" },
  { value: "100+", label: "Staff Members" },
];

const whyChooseUs = [
  {
    title: "Luxury Experience",
    desc: "Every corner of LuxuryStay is designed to give you a truly premium stay.",
    icon: "✨",
  },
  {
    title: "Professional Staff",
    desc: "Our trained team ensures personalized care from arrival to departure.",
    icon: "🎩",
  },
  {
    title: "24/7 Service",
    desc: "Round the clock support so you never have to wait for assistance.",
    icon: "⏰",
  },
  {
    title: "Prime Location",
    desc: "Situated in the heart of the city with easy access to major attractions.",
    icon: "📍",
  },
];

const team = [
  {
    name: "Michael Anderson",
    role: "General Manager",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Sophia Bennett",
    role: "Guest Relations Director",
    image:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "David Wilson",
    role: "Executive Chef",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Emma Carter",
    role: "Head Concierge",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
  },
];

function About() {
  return (
    <div className="bg-white text-[#1F2937]">
      <section className="relative h-[50vh] min-h-[350px] w-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1600&q=80')",
          }}
        ></div>
        <div className="absolute inset-0 bg-[#0B1F2A]/70"></div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <h1 className="font-serif text-4xl sm:text-5xl">About LuxuryStay</h1>
          <p className="mt-4 max-w-xl text-gray-200">
            A legacy of comfort, elegance and genuine hospitality.
          </p>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80"
              alt="Our Story"
              className="h-full w-full object-cover transition duration-500 hover:scale-105"
            />
          </div>
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-[#C9A24B]">
              Our Story
            </p>
            <h2 className="font-serif text-3xl text-[#0B1F2A] sm:text-4xl">
              Two Decades Of Hospitality Excellence
            </h2>
            <p className="mt-6 leading-relaxed text-gray-600">
              LuxuryStay Hospitality began with a simple vision, to create a
              place where every guest feels genuinely cared for. Over the
              years we have grown into a name trusted for elegance, comfort
              and impeccable service.
            </p>
            <p className="mt-4 leading-relaxed text-gray-600">
              Today, our hotels stand as a symbol of refined living, blending
              modern luxury with timeless hospitality traditions.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#F8F8F8] px-6 py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-10 shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl">
            <span className="text-4xl">🎯</span>
            <h3 className="mt-5 font-serif text-2xl text-[#0B1F2A]">
              Our Mission
            </h3>
            <p className="mt-3 text-gray-600">
              To deliver exceptional hospitality experiences that exceed
              expectations, blending comfort, elegance and personalized
              service in every stay.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-10 shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl">
            <span className="text-4xl">🌟</span>
            <h3 className="mt-5 font-serif text-2xl text-[#0B1F2A]">
              Our Vision
            </h3>
            <p className="mt-3 text-gray-600">
              To be the most trusted name in luxury hospitality, recognized
              worldwide for our commitment to excellence and genuine care.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#0B1F2A] px-6 py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 text-center md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-serif text-4xl text-[#C9A24B] sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm uppercase tracking-wide text-gray-300">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-[#C9A24B]">
            Our Advantage
          </p>
          <h2 className="font-serif text-3xl text-[#0B1F2A] sm:text-4xl">
            Why Choose Us
          </h2>
          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-[#C9A24B] hover:shadow-lg"
              >
                <span className="text-4xl">{item.icon}</span>
                <h3 className="mt-5 font-serif text-xl text-[#0B1F2A]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8F8F8] px-6 py-24">
        <div className="mx-auto max-w-6xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-[#C9A24B]">
            Meet Our Team
          </p>
          <h2 className="font-serif text-3xl text-[#0B1F2A] sm:text-4xl">
            Management Team
          </h2>
          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div
                key={member.name}
                className="group overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-64 w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-5 text-left">
                  <h3 className="font-serif text-lg text-[#0B1F2A]">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm text-[#C9A24B]">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 py-28">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=80')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F2A] to-[#0B1F2A]/70"></div>
        <div className="relative z-10 mx-auto max-w-3xl text-center text-white">
          <h2 className="font-serif text-3xl sm:text-4xl">
            The Luxury Experience Awaits
          </h2>
          <p className="mt-4 text-gray-200">
            Step into a world where every detail is designed for your comfort
            and every moment is crafted to feel extraordinary.
          </p>
          <Link
            to="/rooms"
            className="mt-8 inline-block rounded-full bg-[#C9A24B] px-10 py-3 font-medium text-[#0B1F2A] transition hover:scale-105 hover:opacity-90"
          >
            Explore Rooms
          </Link>
        </div>
      </section>
    </div>
  );
}

export default About;