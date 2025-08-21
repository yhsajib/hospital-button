import { Mail, Phone, MapPin, Clock, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
         
          <div>
            <a href="/" className="mb-4 flex items-center gap-2">
              <div className="relative h-8 w-8">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="8" fill="#09352e" />
                  <path d="M16 8V24" stroke="#f8a485" strokeWidth="3" strokeLinecap="round" />
                  <path d="M8 16H24" stroke="#f8a485" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-xl font-bold">Hospital Button</span>
            </a>
            <p className="mb-6 text-sm text-gray-300">
              We provide the highest quality healthcare services with a focus on patient comfort and modern treatments.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary"
                aria-label="YouTube"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

         
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="/about" className="hover:text-secondary">
                  About Us
                </a>
              </li>
              <li>
                <a href="/services" className="hover:text-secondary">
                  Our Services
                </a>
              </li>
              <li>
                <a href="/doctors" className="hover:text-secondary">
                  Our Doctors
                </a>
              </li>
              <li>
                <a href="/blog" className="hover:text-secondary">
                  Latest News
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-secondary">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Contact Details</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin size={18} className="mt-1 shrink-0 text-white" />
                <span>Gulshan, Plot 18, Rd No 71, Dhaka 1212</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={18} className="shrink-0 text-white" />
                <a href="mailto:info@medipro.com" className="hover:text-secondary">
                  info@hospitalbutton.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={18} className="shrink-0 text-white" />
                <a href="tel:+1234567890" className="hover:text-secondary">
                  +8801717171717
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock size={18} className="mt-1 shrink-0 text-white" />
                <span>
                  8:00 - 17:00
                  <br />
                  Monday - Friday
                </span>
              </li>
            </ul>
          </div>

       
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Newsletter</h3>
            <p className="mb-4 text-sm text-gray-300">
              Stay informed and receive our latest news and special offers.
            </p>
            <form className="flex flex-col space-y-3">
              <input
                type="email"
                placeholder="Your Email Address"
                className="rounded bg-[#0c4139] p-2 text-white placeholder:text-gray-400"
                aria-label="Email Address"
              />
              <button
                type="submit"
                className="rounded bg-secondary px-4 py-2 font-medium text-primary transition-colors hover:bg-opacity-90"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      
      <div className="border-t border-[#0c4139] py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Hospital Button. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
