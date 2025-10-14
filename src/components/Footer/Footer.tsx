import {
  LucideGithub,
  LucideLinkedin,
  LucideX,
  LucideYoutube,
  LucideLayers,
} from 'lucide-react';

const socialLinks = [
  {
    name: 'GitHub',
    url: 'https://github.com/sametcelikbicak',
    icon: LucideGithub,
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/sametcelikbicak/',
    icon: LucideLinkedin,
  },
  {
    name: 'X',
    url: 'https://x.com/sametcelikbicak',
    icon: LucideX,
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@sametcelikbicak',
    icon: LucideYoutube,
  },
  {
    name: 'Stack Overflow',
    url: 'https://stackoverflow.com/users/10509056/samet-%c3%87el%c4%b0kbi%c3%87ak',
    icon: LucideLayers,
  },
];

function Footer() {
  return (
    <footer className="text-center text-text-secondary text-xs border-t border-gray-200 my-2">
      <div className="flex gap-4 justify-center my-3">
        {socialLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.name}
              className="text-2xl text-text-secondary hover:text-[var(--primary-color)] transition-colors"
            >
              <Icon />
            </a>
          );
        })}
      </div>
      <span>Made with ❤️ from developer to developers</span>
      <span className="ml-2">
        &copy; {new Date().getFullYear()} Samet ÇELİKBIÇAK. All rights reserved.
      </span>
    </footer>
  );
}

export default Footer;
