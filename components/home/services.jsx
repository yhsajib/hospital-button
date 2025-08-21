import { Phone, Users, Clock } from 'lucide-react';
import Link from "next/link";

const Services = () => {
  return (
    <section className="my-12 px-4 md:my-16 services-section">

      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">          
          <div className="rounded-lg bg-secondary p-6 text-primary shadow-lg">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
              <Phone size={24} />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Schedule your medical consultation</h3>
            <p className="mb-4 text-sm text-black-300">
            Real-time updates regarding your appointment queue number will be provided
            </p>
            <Link
              href="/appointment"
              className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-white transition-colors hover:bg-opacity-90"
            >
              Make Appointment
            </Link>
          </div>

          
          <div className="rounded-lg bg-primary p-6 text-white shadow-lg">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-primary">
              <Users size={24} />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Meet our consultants</h3>
            <p className="mb-4 text-sm text-gray-300">
            Review the details about our consultants, then select your preferred consultant
            </p>
            <Link
              href="/consultants"
              className="mt-4 inline-block rounded-md bg-secondary px-4 py-2 text-primary transition-colors hover:bg-opacity-90"
            >
              View Consultants
            </Link>
          </div>

          
          <div className="rounded-lg bg-secondary p-6 text-primary shadow-lg">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
              <Clock size={24} />
            </div>
            <h3 className="mb-2 text-xl font-semibold">24 Hours Service</h3>
            <p className="mb-4 text-sm">
              Our healthcare services are available 24 hours a day. Our doctors will take care of you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
