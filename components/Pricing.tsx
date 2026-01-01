
import React, { useState } from 'react';
import { Check, X, CreditCard, Lock, CheckCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface PricingProps {
  onNavigate: (page: string) => void;
}

interface PricingPlanProps {
  id: 'basic' | 'premium' | 'vip';
  name: string;
  price: string;
  features: { included: boolean; textKey: string }[];
  isPopular?: boolean;
  buttonTextKey: string;
  buttonVariant: 'outline' | 'primary';
  currentPlan?: boolean;
  onSelect: (id: 'basic' | 'premium' | 'vip') => void;
}

const PricingCard: React.FC<PricingPlanProps> = ({ id, name, price, features, isPopular, buttonTextKey, buttonVariant, currentPlan, onSelect }) => {
  const { t } = useLanguage();
  
  return (
    <div className={`
      relative bg-white rounded-xl p-8 shadow-lg transition-all duration-300 w-full max-w-sm mx-auto flex flex-col
      ${isPopular ? 'border-t-4 border-secondary transform lg:scale-105 z-10 hover:-translate-y-3' : 'hover:-translate-y-2'}
      ${currentPlan ? 'ring-2 ring-success' : ''}
    `}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-white px-6 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
          {t('pricing.popular')}
        </div>
      )}

      {currentPlan && (
        <div className="absolute top-4 right-4 text-success flex items-center gap-1 font-bold text-sm bg-success/10 px-2 py-1 rounded">
          <CheckCircle size={14} /> {t('pricing.currentPlan')}
        </div>
      )}
      
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-dark mb-2">{name}</h3>
        <div className="text-primary font-bold">
          <span className="text-4xl">{price}</span>
          <span className="text-gray-500 text-sm font-normal ml-1">/{t('pricing.month')}</span>
        </div>
      </div>
      
      <ul className="space-y-4 mb-8 flex-grow">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center text-gray-600 text-sm">
            {feature.included ? (
              <Check size={18} className="text-success mr-3 flex-shrink-0" />
            ) : (
              <X size={18} className="text-danger mr-3 flex-shrink-0 opacity-50" />
            )}
            <span className={feature.included ? '' : 'opacity-60'}>{t(feature.textKey)}</span>
          </li>
        ))}
      </ul>
      
      <button 
        className={`
          w-full py-3 rounded-lg font-bold transition-colors
          ${currentPlan
             ? 'bg-success text-white cursor-default'
             : buttonVariant === 'primary' 
               ? 'bg-primary text-white hover:bg-primary-dark' 
               : 'bg-transparent border-2 border-primary text-primary hover:bg-primary/10'
          }
        `}
        disabled={currentPlan}
        onClick={() => !currentPlan && onSelect(id)}
      >
        {currentPlan ? t('pricing.active') : t(buttonTextKey)}
      </button>
    </div>
  );
};

// Payment Modal Component
const PaymentModal: React.FC<{ 
  planName: string; 
  price: string; 
  onClose: () => void; 
  onConfirm: () => void;
  isLoading: boolean;
}> = ({ planName, price, onClose, onConfirm, isLoading }) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bkash' | 'nagad'>('card');
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{t('pricing.payment.title')}</h3>
            <p className="text-sm text-gray-500">{planName} - {price}/{t('pricing.month')}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('pricing.payment.method')}</label>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => setPaymentMethod('card')}
                className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <CreditCard size={24} />
                <span className="text-xs font-bold">{t('pricing.payment.card')}</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('bkash')}
                className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <span className="font-bold text-xl">bKash</span>
                <span className="text-xs font-bold">{t('pricing.payment.bkash')}</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('nagad')}
                className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === 'nagad' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <span className="font-bold text-xl">Nagad</span>
                <span className="text-xs font-bold">{t('pricing.payment.nagad')}</span>
              </button>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onConfirm(); }}>
            {paymentMethod === 'card' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{t('pricing.payment.cardNumber')}</label>
                  <div className="relative">
                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" required />
                    <CreditCard className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{t('pricing.payment.expiry')}</label>
                    <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">CVC</label>
                    <div className="relative">
                      <input type="text" placeholder="123" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" required />
                      <Lock className="absolute left-3 top-3.5 text-gray-400" size={16} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-2">{t('pricing.payment.mobileNumber')}</p>
                <input type="tel" placeholder="017XXXXXXXX" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none mb-2 text-center text-lg font-medium" />
              </div>
            )}

            <div className="mt-6">
              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full py-4 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('pricing.payment.processing')}
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    {t('pricing.payment.pay')} {price}
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                <Lock size={12} /> {t('pricing.payment.secure')}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Pricing: React.FC<PricingProps> = ({ onNavigate }) => {
  const { user, upgradePlan } = useAuth();
  const { t, language } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{id: 'basic' | 'premium' | 'vip', name: string, price: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = (id: 'basic' | 'premium' | 'vip') => {
    if (id === 'basic') return;

    if (!user) {
      if (window.confirm('Please login to upgrade plan. Do you want to go to login page?')) {
        onNavigate('login');
      }
      return;
    }

    const planDetails = plans.find(p => p.id === id);
    if (planDetails) {
      setSelectedPlan({ id: planDetails.id, name: t(`pricing.${planDetails.id}`), price: planDetails.price });
      setShowModal(true);
    }
  };

  const handlePaymentConfirm = async () => {
    if (!selectedPlan) return;
    
    setLoading(true);
    try {
      await upgradePlan(selectedPlan.id);
      alert(t('common.success'));
      setShowModal(false);
    } catch (error) {
      alert(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const currentPlanId = user?.plan || 'basic';

  const getPrice = (priceBn: string, priceEn: string) => {
      return language === 'en' ? priceEn : priceBn;
  }

  const plans: PricingPlanProps[] = [
    {
      id: 'basic',
      name: t('pricing.basic'),
      price: getPrice("০", "0"),
      buttonTextKey: "pricing.currentPlan",
      buttonVariant: "outline",
      currentPlan: currentPlanId === 'basic',
      onSelect: handleSelectPlan,
      features: [
        { included: true, textKey: "pricing.features.createProfile" },
        { included: true, textKey: "pricing.features.dailyMatches" },
        { included: true, textKey: "pricing.features.messaging" },
        { included: false, textKey: "pricing.features.premiumFilter" },
        { included: false, textKey: "pricing.features.profileViewers" },
        { included: false, textKey: "pricing.features.priorityMatching" },
      ]
    },
    {
      id: 'premium',
      name: t('pricing.premium'),
      price: getPrice("৩৯৯", "399"),
      isPopular: true,
      buttonTextKey: "pricing.upgrade",
      buttonVariant: "primary",
      currentPlan: currentPlanId === 'premium',
      onSelect: handleSelectPlan,
      features: [
        { included: true, textKey: "pricing.features.everythingBasic" },
        { included: true, textKey: "pricing.features.unlimitedMatches" },
        { included: true, textKey: "pricing.features.unlimitedMessages" },
        { included: true, textKey: "pricing.features.premiumFilter" },
        { included: true, textKey: "pricing.features.profileViewers" },
        { included: true, textKey: "pricing.features.priorityMatching" },
      ]
    },
    {
      id: 'vip',
      name: t('pricing.vip'),
      price: getPrice("৭৯৯", "799"),
      buttonTextKey: "pricing.becomeVip",
      buttonVariant: "outline",
      currentPlan: currentPlanId === 'vip',
      onSelect: handleSelectPlan,
      features: [
        { included: true, textKey: "pricing.features.everythingPremium" },
        { included: true, textKey: "pricing.features.vipBadge" },
        { included: true, textKey: "pricing.features.profileBoost" },
        { included: true, textKey: "pricing.features.videoCall" },
        { included: true, textKey: "pricing.features.exclusiveEvents" },
        { included: true, textKey: "pricing.features.personalAssistance" },
      ]
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-dark mb-3">{t('pricing.title')}</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">{t('pricing.subtitle')}</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 lg:gap-6 items-center">
          {plans.map((plan, index) => (
            <PricingCard key={index} {...plan} />
          ))}
        </div>

        {/* Sponsored Ad Section for Pricing */}
        <div className="mt-20 max-w-4xl mx-auto bg-gray-50 rounded-3xl p-8 border-2 border-dashed border-gray-200 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Featured Sponsor</span>
          </div>
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary group-hover:rotate-12 transition-transform duration-500">
               <ExternalLink size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">বিশেষ পার্টনার ডিল!</h3>
              <p className="text-gray-600 mb-6 max-w-xl mx-auto">First Sight সদস্যদের জন্য আমাদের বিশেষ সহযোগীদের পক্ষ থেকে থাকছে অভাবনীয় ছাড়। আজই লুফে নিন এই অফারটি!</p>
              <a 
                href="https://url-shortener.me/41OT" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-10 py-4 bg-dark text-white font-bold rounded-full hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                অফারটি দেখুন <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedPlan && (
        <PaymentModal 
          planName={selectedPlan.name} 
          price={selectedPlan.price}
          isLoading={loading}
          onClose={() => setShowModal(false)}
          onConfirm={handlePaymentConfirm}
        />
      )}
    </section>
  );
};

export default Pricing;
