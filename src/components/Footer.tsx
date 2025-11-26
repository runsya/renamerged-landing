import { motion } from 'framer-motion';
import { MessageSquare, Github } from 'lucide-react';
import { APP_CONFIG } from '../config';

export default function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative py-10 px-4 border-t border-purple-500/20">
      <div className="absolute inset-0 bg-slate-950" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12"
        >
          {/* Left Column - Branding */}
          <div className="space-y-4">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Renamerged
            </h3>
            <p className="text-gray-400 text-base leading-relaxed max-w-md">
              Solusi manajemen Faktur Pajak #1 untuk profesional.
            </p>
            <div className="space-y-1">
              <p className="text-gray-500 text-sm">
                Version {APP_CONFIG.appVersion}
              </p>
              <p className="text-gray-500 text-sm">
                Copyright © 2025 Renamerged.id
              </p>
            </div>
          </div>

          {/* Right Column - Links & Action */}
          <div className="space-y-6 md:items-end md:text-right">
            <nav className="space-y-3">
              <button
                onClick={() => scrollToSection('features')}
                className="block text-gray-300 hover:text-purple-400 transition-colors md:ml-auto"
              >
                Fitur
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="block text-gray-300 hover:text-purple-400 transition-colors md:ml-auto"
              >
                Cara Kerja
              </button>
              <button
                onClick={() => scrollToSection('security')}
                className="block text-gray-300 hover:text-purple-400 transition-colors md:ml-auto"
              >
                Keamanan
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="block text-gray-300 hover:text-purple-400 transition-colors md:ml-auto"
              >
                FAQ
              </button>
            </nav>

            <div className="md:flex md:justify-end gap-3">
              <a
                href="https://github.com/iunoxid"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 rounded-lg hover:border-purple-400 hover:bg-purple-500/10 transition-all duration-300 text-white font-medium"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <a
                href="https://t.me/iunoin"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 rounded-lg hover:border-purple-400 hover:bg-purple-500/10 transition-all duration-300 text-white font-medium"
              >
                <MessageSquare className="w-4 h-4" />
                Lapor Bug / Request Fitur
              </a>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer - Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="pt-8 border-t border-purple-500/10"
        >
          <p className="text-gray-400 text-sm text-center">
            Disclaimer: Aplikasi ini adalah software independen dan tidak berafiliasi dengan DJP (Direktorat Jenderal Pajak).
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
