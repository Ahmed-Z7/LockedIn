import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { title: 'Product', items: ['Features', 'Pricing', 'Security', 'Roadmap'] },
    { title: 'Company', items: ['About', 'Blog', 'Careers', 'Contact'] },
    { title: 'Resources', items: ['Documentation', 'API', 'Community', 'Support'] },
    { title: 'Legal', items: ['Privacy', 'Terms', 'Cookies', 'License'] },
  ];

  return (
    <footer className="relative border-t border-indigo-500/20 bg-gradient-to-b from-transparent to-indigo-950/20">
      <div className="container py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg blur"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-lg p-2">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                AuraLearn
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Empowering students with AI-driven learning solutions.
            </p>
          </motion.div>

          {/* Links sections */}
          {footerLinks.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
            >
              <h4 className="font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item}>
                    <motion.a
                      href="#"
                      className="text-sm text-gray-400 hover:text-indigo-400 transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      {item}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent mb-8" />

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400"
        >
          <p>
            &copy; {currentYear} AuraLearn. All rights reserved. Crafted with
            <span className="text-indigo-400 mx-1">✨</span>
            for learners everywhere.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            {['Twitter', 'GitHub', 'LinkedIn', 'Discord'].map((social) => (
              <motion.a
                key={social}
                href="#"
                className="hover:text-indigo-400 transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                {social}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
