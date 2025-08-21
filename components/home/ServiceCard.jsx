import { Eye, Stethoscope, Microscope, Heart, Scissors } from 'lucide-react';
import Link from "next/link";

const ServiceCard = ({ icon, title, description, link }) => (
  <div className="flex h-full flex-col rounded-lg bg-background p-6 shadow-sm transition-transform hover:-translate-y-1">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20 text-secondary">
      {icon}
    </div>
    <h3 className="mb-3 text-xl font-semibold text-primary">{title}</h3>
    <p className="mb-6 flex-grow text-sm text-gray-600">{description}</p>
    <Link
      href={link}
      className="mt-auto inline-block text-sm font-medium text-secondary hover:underline"
    >
      Learn More →
    </Link>
  </div>
);

const ServiceGrid = () => {
  const services = [
    {
      id: "cabin-booking",
      icon: <Eye size={24} />,
      title: "Cabin Booking",
      description: "Book your hospital cabin effortlessly online, securing your comfort with real-time availability",
      link: "/room-booking"
    },
    {
      id: "medical-checkup",
      icon: <Stethoscope size={24} />,
      title: "Medical Update",
      description: "Get notification about any medical emergency or medical need.",
      link: "/medical-update"
    },
    {
      id: "online-pharmacy",
      icon: <Scissors size={24} />,
      title: "Online Pharmacy",
      description: "Order your prescribed medicines online, Make online payment and you patient will get them in few minutes.",
      link: "/online-pharmacy"
    },
    {
      id: "test-reports",
      icon: <Microscope size={24} />,
      title: "Online Test Report",
      description: "Access your test results anytime, anywhere, securely and instantly online.",
      link: "/test-reports"
    },
    {
      id: "patient-care",
      icon: <Heart size={24} />,
      title: "Patient-Centered",
      description: "Focused on patient needs with personalized care plans tailored to your unique health profile.",
      link: "/services/patient-care"
    }
  ];

  return (
    <section className="py-16 service-card">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <span className="mb-2 inline-block text-sm font-medium uppercase tracking-wider text-secondary">
            Medical Services
          </span>
          <h2 className="text-3xl font-bold text-primary md:text-4xl">
            We're Providing Best Services.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              icon={service.icon}
              title={service.title}
              description={service.description}
              link={service.link}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceGrid;
