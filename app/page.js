import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { features, testimonials } from "@/lib/data";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle } from 'lucide-react';
import Services from "@/components/home/services";
import ServiceGrid from "@/components/home/ServiceCard";

export default function Home() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-32 hero-section">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge
                variant="outline"
                className="bg-emerald-100 border-emerald-300 px-4 py-2 text-emerald-700 text-sm font-medium"
              >
                Healthcare made simple
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Connect with doctors <br />
                <span className="gradient-title">anytime, anywhere</span>
              </h1>
              <p className="text-white text-lg md:text-xl max-w-md">
                Book appointments, consult via video, and manage your healthcare
                journey all in one secure platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Link href="/onboarding">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-emerald-300 hover:bg-gray-100"
                    >
                      Watch Video
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
                    <div className="relative pt-[56.25%]">
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Platform Overview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="relative h-[400px] lg:h-[500px] rounded-xl overflow-hidden">
              <Image
                src="/banner2.png"
                alt="Doctor consultation"
                fill
                priority
                className="object-cover md:pt-14 rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      <Services />    
      <ServiceGrid />

      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-12 lg:flex-row">
            
            <div className="relative w-full lg:w-1/2">
              <div className="relative mx-auto max-w-md">

                <div className="relative z-10 overflow-hidden rounded-lg shadow-lg">
                  <img
                    src="https://img.freepik.com/free-photo/doctor-nurses-special-equipment_23-2148980721.jpg"
                    alt="Medical staff discussing patient care"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="absolute -z-10 -top-4 -left-4 h-full w-full rounded-lg bg-secondary opacity-10" />
              </div>
            </div>

            
            <div className="w-full lg:w-1/2">
              <span className="mb-2 inline-block text-sm font-medium uppercase tracking-wider text-secondary">
                About 
              </span>
              <h2 className="mb-6 text-3xl font-bold text-primary md:text-4xl">
                Our Best Services & Popular Treatment Here.
              </h2>
              <p className="mb-8 text-black">
              Our platform combines traditional medical services with modern technology, allowing you to book appointments, select your preferred doctor, view real-time availability, and access test reports, all online. We offer comprehensive care, from consultation to admission, with the convenience of digital service.
              </p>

            
              <div className="mb-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-secondary" />
                    <div>
                      <h4 className="font-semibold text-primary">Patient Experience</h4>
                      <p className="text-sm text-gray-600">Personalized care focused on comfort and satisfaction.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-secondary" />
                    <div>
                      <h4 className="font-semibold text-primary">Medical Patient Department</h4>
                      <p className="text-sm text-gray-600">Specialized units for focused treatment.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-secondary" />
                    <div>
                      <h4 className="font-semibold text-primary">Emergency Treatment</h4>
                      <p className="text-sm text-gray-600">24/7 emergency care by skilled professionals.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-secondary" />
                    <div>
                      <h4 className="font-semibold text-primary">Modern Equipment</h4>
                      <p className="text-sm text-gray-600">State-of-the-art medical equipment for accurate diagnosis.</p>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/about"
                className="inline-flex rounded-md bg-secondary px-6 py-3 font-medium text-primary transition-colors hover:bg-opacity-90"
              >
                Read More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials with green medical accents */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="bg-emerald-100 text-emerald-700 border-emerald-300 px-4 py-1 text-sm font-medium mb-4"
            >
              Success Stories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              What Our Users Say
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Hear from patients and doctors who use our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-emerald-200 hover:border-emerald-300 transition-all"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                      <span className="text-emerald-700 font-bold">
                        {testimonial.initials}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-black">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-black">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-black">
                    &quot;{testimonial.quote}&quot;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
