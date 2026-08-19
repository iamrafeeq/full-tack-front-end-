import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-[#0B1F2A] text-white px-8 py-8 mt-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-serif text-[#C9A24B]">LuxuryStay</h2>

        <div className="flex gap-6 text-sm">
          <Link to="/" className="hover:text-[#C9A24B]">
            Home
          </Link>
          <Link to="/rooms" className="hover:text-[#C9A24B]">
            Rooms
          </Link>
          <Link to="/contact" className="hover:text-[#C9A24B]">
            Contact
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        © {new Date().getFullYear()} LuxuryStay Hospitality. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;