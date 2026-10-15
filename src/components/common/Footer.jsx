import { Heart } from 'lucide-react';

function InstagramIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TelegramIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function WhatsAppIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export default function Footer() {
  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://instagram.com',
      icon: InstagramIcon,
      label: 'Instagram'
    },
    {
      name: 'Telegram',
      href: 'https://t.me',
      icon: TelegramIcon,
      label: 'Telegram'
    },
    {
      name: 'WhatsApp',
      href: 'https://wa.me',
      icon: WhatsAppIcon,
      label: 'WhatsApp'
    }
  ];

  return (
    <footer className="w-full border-t border-[#e3d8c6] bg-[#faf6ee]/90 backdrop-blur-xl py-6 px-4 md:px-12 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-row items-center justify-between gap-4">
        {/* Left: Gentle Branding in horizontal row */}
        <div className="flex flex-row items-center gap-2">
          <Heart className="w-4 h-4 text-[#800020] fill-[#800020]/20" />
          <span className="text-xs md:text-sm font-medium text-[#580016] font-serif">
            Dedicated with love for Aneska
          </span>
        </div>

        {/* Right: Social Links in a horizontal row */}
        <div className="flex flex-row items-center gap-2 md:gap-4">
          {socialLinks.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#faf6ee] hover:bg-[#ebe3d5] text-[#580016] text-xs md:text-sm font-medium border border-[#e3d8c6] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                title={item.name}
              >
                <Icon className="w-3.5 h-3.5 text-[#800020] group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">{item.name}</span>
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
