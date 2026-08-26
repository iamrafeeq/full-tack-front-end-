import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  submitContact,
  clearSubmitState,
} from "../../redux/slice/contactUs/contactusSlice";
import Spinner from "../../components/Spinner";
import { notifySuccess, notifyError } from "../../utils/toast";

const businessHours = [
  { day: "Monday - Friday", time: "8:00 AM - 10:00 PM" },
  { day: "Saturday", time: "9:00 AM - 11:00 PM" },
  { day: "Sunday", time: "9:00 AM - 9:00 PM" },
];

const faqs = [
  {
    question: "What time is check-in and check-out?",
    answer:
      "Check-in starts at 2:00 PM and check-out is until 12:00 PM. Early check-in and late check-out can be arranged based on availability.",
  },
  {
    question: "Do you offer airport pickup?",
    answer:
      "Yes, we offer airport pickup and drop-off services. Please contact our front desk at least 24 hours in advance to arrange transportation.",
  },
  {
    question: "Is breakfast included in the room price?",
    answer:
      "Most of our room packages include complimentary breakfast. Please check your selected room details for specific inclusions.",
  },
  {
    question: "Can I cancel or modify my reservation?",
    answer:
      "Reservations can be modified or cancelled up to 48 hours before check-in without any charges. Please contact us directly for assistance.",
  },
];

function Contact() {
  const dispatch = useDispatch();
  const { submitLoading, submitError, submitSuccess } = useSelector(
    (s) => s.contact,
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    if (!submitSuccess) return;
    notifySuccess("Message sent! We'll get back to you shortly.");
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    dispatch(clearSubmitState());
  }, [submitSuccess, dispatch]);

  useEffect(() => { if (submitError) notifyError(submitError); }, [submitError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(submitContact(formData));
  };

  return (
    <div className="bg-white text-[#1F2937]">
      <section className="relative h-[50vh] min-h-[350px] w-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1600&q=80')",
          }}
        ></div>
        <div className="absolute inset-0 bg-[#0B1F2A]/70"></div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <h1 className="font-serif text-4xl sm:text-5xl">Contact Us</h1>
          <p className="mt-4 max-w-xl text-gray-200">
            We would love to hear from you. Reach out anytime.
          </p>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:border-[#C9A24B] hover:shadow-lg">
            <span className="text-3xl">📍</span>
            <h3 className="mt-4 font-serif text-lg text-[#0B1F2A]">Address</h3>
            <p className="mt-2 text-sm text-gray-500">
              123 Ocean Drive, Downtown District, New York, NY 10001
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:border-[#C9A24B] hover:shadow-lg">
            <span className="text-3xl">📞</span>
            <h3 className="mt-4 font-serif text-lg text-[#0B1F2A]">Phone</h3>
            <p className="mt-2 text-sm text-gray-500">+1 (212) 555-0198</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:border-[#C9A24B] hover:shadow-lg">
            <span className="text-3xl">✉️</span>
            <h3 className="mt-4 font-serif text-lg text-[#0B1F2A]">Email</h3>
            <p className="mt-2 text-sm text-gray-500">
              reservations@luxurystay.com
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#F8F8F8] px-6 py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-8 shadow-md sm:p-10">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.3em] text-[#C9A24B]">
              Get In Touch
            </p>
            <h2 className="font-serif text-2xl text-[#0B1F2A] sm:text-3xl">
              Send Us A Message
            </h2>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#C9A24B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#C9A24B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#C9A24B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#C9A24B] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#C9A24B] focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="inline-flex items-center gap-1.5 justify-center w-full rounded-full bg-[#0B1F2A] py-3 font-medium text-white transition hover:scale-105 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed sm:w-auto sm:px-10"
              >
                {submitLoading ? <><Spinner size="sm" color="white" /> Sending…</> : "Send Message"}
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-8">
            <div className="overflow-hidden rounded-2xl shadow-md">
              <div className="flex h-64 w-full items-center justify-center bg-[#0B1F2A]/10 text-sm text-gray-500">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.021788914375!2d67.07429189999999!3d24.8631054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33ea3db108f41%3A0x42acc4507358b160!2sAptech%20Learning%2C%20Shahrah%20e%20Faisal%20Center!5e0!3m2!1sen!2s!4v1787727186902!5m2!1sen!2s"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="Hotel Location Map"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-md">
              <h3 className="font-serif text-xl text-[#0B1F2A]">
                Business Hours
              </h3>
              <div className="mt-5 space-y-3">
                {businessHours.map((item) => (
                  <div
                    key={item.day}
                    className="flex items-center justify-between border-b border-gray-100 pb-3 text-sm"
                  >
                    <span className="text-gray-600">{item.day}</span>
                    <span className="font-medium text-[#0B1F2A]">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-[#C9A24B]">
              Have Questions
            </p>
            <h2 className="font-serif text-3xl text-[#0B1F2A] sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-medium text-[#0B1F2A]">
                    {faq.question}
                  </span>
                  <span className="text-[#C9A24B]">
                    {openFaq === index ? "-" : "+"}
                  </span>
                </button>
                {openFaq === index && (
                  <p className="px-6 pb-5 text-sm text-gray-500">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
