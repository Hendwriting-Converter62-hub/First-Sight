
import React from 'react';
import { Heart, Facebook, Youtube, Instagram, Linkedin, MapPin, Phone, Mail, ArrowRight, Smartphone, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#1a1a2e] text-white pt-16 pb-8 border-t border-gray-800 relative z-10">
      {/* Newsletter Section - Active Look */}
      <div className="container mx-auto px-4 mb-16">
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden transform md:-translate-y-6 border border-white/10">
           {/* Decorative circles */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl pointer-events-none"></div>

           <div className="relative z-10 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold mb-2 text-white">{t('footer.loveSearch')}</h3>
              <p className="text-blue-50 text-sm md:text-base opacity-90 max-w-md">{t('footer.newsletterDesc')}</p>
           </div>
           <div className="relative z-10 w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder={t('footer.enterEmail')}
                className="px-5 py-3 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 w-full sm:w-80 shadow-inner bg-white/95 backdrop-blur"
              />
              <button className="bg-white text-primary px-8 py-3 rounded-full font-bold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                {t('footer.subscribe')} <ArrowRight size={18} />
              </button>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-white p-1.5 rounded-lg shadow-lg shadow-primary/20">
                <Heart className="text-primary w-6 h-6 fill-current" />
              </div>
              <h3 className="text-2xl font-bold tracking-wide">{t('common.appName')}</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed border-l-2 border-primary/30 pl-3">
              {t('footer.about')}
            </p>
            <div className="flex gap-3 pt-2">
              {[Facebook, Youtube, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all hover:scale-110 border border-gray-700 hover:border-primary shadow-sm">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white relative inline-block">
              {t('footer.links')}
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-primary rounded-full"></span>
            </h4>
            <ul className="space-y-3 text-sm">
              {['nav.home', 'nav.features', 'nav.howItWorks', 'nav.pricing'].map((key) => (
                <li key={key}>
                  <a href={`#${key.split('.')[1]}`} className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-primary transition-colors"></span>
                    {t(key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white relative inline-block">
              {t('footer.support')}
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-primary rounded-full"></span>
            </h4>
            <ul className="space-y-3 text-sm">
              {['footer.faq', 'footer.helpCenter', 'footer.privacy', 'footer.terms'].map((key) => (
                <li key={key}>
                  <a href="#" className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-primary transition-colors"></span>
                    {t(key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & App */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white relative inline-block">
              {t('footer.contact')}
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-primary rounded-full"></span>
            </h4>
            <ul className="space-y-4 mb-8 text-sm">
              <li className="flex items-start gap-3 text-gray-400 group">
                <div className="bg-gray-800 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                    <MapPin className="flex-shrink-0 text-primary" size={16} />
                </div>
                <span className="mt-1 group-hover:text-gray-300 transition-colors">গুলশান-১, ঢাকা-১২১২, বাংলাদেশ</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 group">
                <div className="bg-gray-800 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Phone className="flex-shrink-0 text-primary" size={16} />
                </div>
                <span className="group-hover:text-gray-300 transition-colors">+৮৮০ ১৬৩৪-৫৬৭৮৯০</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 group">
                <div className="bg-gray-800 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Mail className="flex-shrink-0 text-primary" size={16} />
                </div>
                <span className="group-hover:text-gray-300 transition-colors">info@firstsight.com</span>
              </li>
            </ul>

            <h5 className="text-sm font-semibold mb-3 text-gray-300">{t('footer.downloadApp')}</h5>
            <div className="flex gap-2">
               <button className="flex-1 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 p-2.5 rounded-lg flex items-center gap-2 transition-all group shadow-sm hover:shadow">
                  <Smartphone size={24} className="text-gray-400 group-hover:text-white transition-colors" />
                  <div className="text-left leading-tight">
                     <div className="text-[9px] text-gray-400 uppercase tracking-wider">Get it on</div>
                     <div className="text-xs font-bold text-white">Google Play</div>
                  </div>
               </button>
               <button className="flex-1 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 p-2.5 rounded-lg flex items-center gap-2 transition-all group shadow-sm hover:shadow">
                  <Smartphone size={24} className="text-gray-400 group-hover:text-white transition-colors" />
                  <div className="text-left leading-tight">
                     <div className="text-[9px] text-gray-400 uppercase tracking-wider">Download on</div>
                     <div className="text-xs font-bold text-white">App Store</div>
                  </div>
               </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-500 text-sm text-center md:text-left">
              <p>{t('footer.copyright')}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-1.5 text-gray-500 text-xs px-3 py-1 bg-gray-800/50 rounded-full border border-gray-700">
                    <ShieldCheck size={14} className="text-green-500" />
                    <span>SSL Secure Payment</span>
                </div>
                <div className="flex gap-3 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
                     {/* Simple CSS representation of cards if no image */}
                     <div className="h-6 w-10 bg-white rounded flex items-center justify-center overflow-hidden shadow-sm" title="Mastercard">
                        <div className="flex -space-x-1.5">
                            <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B]"></div>
                            <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B]"></div>
                        </div>
                     </div>
                     <div className="h-6 w-10 bg-white rounded flex items-center justify-center shadow-sm" title="Visa">
                         <span className="text-[10px] font-black text-[#1A1F71] italic tracking-tighter">VISA</span>
                     </div>
                     <div className="h-6 w-10 bg-[#e2136e] rounded flex items-center justify-center shadow-sm" title="bKash">
                         <span className="text-[8px] font-bold text-white">bKash</span>
                     </div>
                     <div className="h-6 w-10 bg-[#F7931E] rounded flex items-center justify-center shadow-sm" title="Nagad">
                         <span className="text-[8px] font-bold text-white">Nagad</span>
                     </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
