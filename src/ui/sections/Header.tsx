import { m } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link as ScrollLink } from "react-scroll";

const navItems = [
  { href: '#hero', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#menu', label: 'Menu' },
  { href: '#branches', label: 'Branches' },
  { href: '#reservation', label: 'Reservation' },
  { href: '#contact', label: 'Contact' },
];

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        scrolled ? 'bg-slate-950/80 backdrop-blur border-b border-slate-800' : ''
      }`}
    >
      <div className="container-px mx-auto flex max-w-7xl items-center justify-between py-3">
        <a href="#hero" className="font-serif text-2xl">
          <span className="text-brand">YPA</span>Mubuzichoma
        </a>

        {/* Desktop Menu */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <ScrollLink
              key={item.href}
              to={item.href.slice(1)}
              smooth={true}
              duration={500}
              spy={true}
              activeClass="text-brand"
              className="text-sm text-slate-200 hover:text-brand cursor-pointer"
            >
              {item.label}
            </ScrollLink>
          ))}
          <a 
            href="/#/admin/test" 
            className="text-sm text-slate-200 hover:text-brand cursor-pointer"
          >
            Admin Test
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <m.div
            initial={false}
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="h-6 w-6"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-full w-full"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </m.div>
        </button>
      </div>

      {/* Mobile Menu */}
      <m.div
        initial={false}
        animate={{ height: open ? 'auto' : 0 }}
        className="md:hidden overflow-hidden border-t border-slate-800"
        id="mobile-nav"
        aria-hidden={!open}
      >
        <div className="container-px mx-auto max-w-7xl py-2">
          <div className="grid gap-2">
            {navItems.map((item) => (
              <ScrollLink
                key={item.href}
                to={item.href.slice(1)}
                smooth={true}
                duration={500}
                onClick={() => setOpen(false)}
                className="block rounded px-2 py-2 hover:bg-slate-800/50 cursor-pointer"
              >
                {item.label}
              </ScrollLink>
            ))}
            <a 
              href="/#/admin/test" 
              className="block rounded px-2 py-2 hover:bg-slate-800/50 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Admin Test
            </a>
          </div>
        </div>
      </m.div>
    </header>
  );
};
