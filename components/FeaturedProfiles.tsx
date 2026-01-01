
import React from 'react';
import { MapPin, Briefcase, Heart, UserPlus, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FeaturedUser {
  id: string;
  name: string;
  age: number;
  location: string;
  occupation: string;
  image: string;
  isOnline?: boolean;
}

const FeaturedProfiles: React.FC = () => {
  const { t } = useLanguage();
  
  const profiles: FeaturedUser[] = [
    {
      id: '1',
      name: 'নুসরাত জাহান',
      age: 24,
      location: 'ঢাকা',
      occupation: 'ডাক্তার',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
      isOnline: true
    },
    {
      id: '2',
      name: 'রাকিব হাসান',
      age: 29,
      location: 'চট্টগ্রাম',
      occupation: 'সফটওয়্যার ইঞ্জিনিয়ার',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
      isOnline: false
    },
    {
      id: '3',
      name: 'সাদিয়া ইসলাম',
      age: 26,
      location: 'সিলেট',
      occupation: 'শিক্ষিকা',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
      isOnline: true
    },
    {
      id: '4',
      name: 'ইমরান খান',
      age: 31,
      location: 'খুলনা',
      occupation: 'ব্যাংকার',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
      isOnline: true
    }
  ];

  return (
    <section className="py-20 bg-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-dark mb-3">{t('featured.title')}</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">{t('featured.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {profiles.map((profile) => (
            <div key={profile.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={profile.image} 
                  alt={profile.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {profile.isOnline && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    {t('featured.online')}
                  </div>
                )}

                <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center gap-3">
                  <button className="bg-white text-primary p-2 rounded-full hover:bg-primary hover:text-white transition-colors shadow-lg" title="পছন্দ করুন">
                    <Heart size={20} />
                  </button>
                  <button className="bg-white text-primary p-2 rounded-full hover:bg-primary hover:text-white transition-colors shadow-lg" title="কানেক্ট করুন">
                    <UserPlus size={20} />
                  </button>
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{profile.name}, {profile.age}</h3>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <Briefcase size={14} className="mr-2 text-primary/70" />
                    {profile.occupation}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin size={14} className="mr-2 text-primary/70" />
                    {profile.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sponsored Ad Section */}
        <div className="mt-12 bg-white rounded-2xl p-6 shadow-sm border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
             <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <ExternalLink size={32} />
             </div>
             <div className="text-center md:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-2 inline-block">Sponsored</span>
                <h4 className="text-xl font-bold text-gray-800">আমাদের পার্টনারের বিশেষ অফার দেখুন</h4>
                <p className="text-gray-500 text-sm">আপনার ম্যাচমেকিং জার্নি আরও সহজ করতে আমাদের সহযোগীদের সেবা নিন।</p>
             </div>
          </div>
          <a 
            href="https://url-shortener.me/41OT" 
            target="_blank" 
            rel="noopener noreferrer"
            className="relative z-10 px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            অফারটি দেখুন
          </a>
        </div>

        <div className="text-center mt-12">
          <a href="#register" className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary-dark transition-colors border-b-2 border-primary pb-1">
            {t('featured.seeMore')}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProfiles;
