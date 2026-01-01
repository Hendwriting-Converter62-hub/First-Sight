
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { User } from '../types';

interface RegistrationFormProps {
  onNavigate: (page: string) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    religion: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agree: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      // Create user object matching the User interface (excluding id)
      const userData: Omit<User, 'id'> = {
        fullName: formData.fullName,
        age: formData.age,
        gender: formData.gender,
        religion: formData.religion,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      };

      const success = await register(userData);
      
      if (success) {
        onNavigate('profile');
      } else {
        setError(t('register.emailExists'));
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 bg-blue-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-dark mb-3">{t('register.title')}</h2>
          <p className="text-gray-600 text-lg">{t('register.subtitle')}</p>
        </div>
        
        <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-dark font-medium mb-2">{t('register.fullName')} *</label>
                <input 
                  type="text" 
                  id="fullName" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                  placeholder={t('register.fullName')}
                  required 
                />
              </div>
              <div>
                <label htmlFor="age" className="block text-dark font-medium mb-2">{t('register.age')} *</label>
                <input 
                  type="number" 
                  id="age" 
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                  placeholder={t('register.age')} 
                  min="18" 
                  max="70" 
                  required 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="gender" className="block text-dark font-medium mb-2">{t('register.gender')} *</label>
                <select 
                  id="gender" 
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white" 
                  required
                >
                  <option value="">{t('register.genderSelect')}</option>
                  <option value="male">{t('register.male')}</option>
                  <option value="female">{t('register.female')}</option>
                  <option value="other">{t('register.other')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="religion" className="block text-dark font-medium mb-2">{t('register.religion')} *</label>
                <select 
                  id="religion" 
                  name="religion"
                  value={formData.religion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white" 
                  required
                >
                  <option value="">{t('register.religionSelect')}</option>
                  <option value="islam">{t('register.islam')}</option>
                  <option value="hinduism">{t('register.hinduism')}</option>
                  <option value="christianity">{t('register.christianity')}</option>
                  <option value="buddhism">{t('register.buddhism')}</option>
                  <option value="other">{t('register.other')}</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-dark font-medium mb-2">{t('register.email')} *</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                  placeholder={t('register.email')} 
                  required 
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-dark font-medium mb-2">{t('register.phone')} *</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                  placeholder={t('register.phone')} 
                  required 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-dark font-medium mb-2">{t('register.password')} *</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                  placeholder={t('register.password')} 
                  required 
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-dark font-medium mb-2">{t('register.confirmPassword')} *</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                  placeholder={t('register.confirmPassword')} 
                  required 
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="agree" 
                name="agree"
                checked={formData.agree}
                onChange={handleChange}
                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary" 
                required 
              />
              <label htmlFor="agree" className="ml-2 text-gray-700">
                {t('register.agree')}
              </label>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 bg-primary text-white text-lg font-bold rounded-lg shadow-lg hover:bg-primary-dark transition-all transform hover:-translate-y-1 hover:shadow-xl ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? t('register.submitting') : t('register.submit')}
            </button>
            
            <div className="text-center mt-6">
              <p className="text-gray-600">
                {t('register.haveAccount')} {' '}
                <button 
                  type="button" 
                  onClick={() => onNavigate('login')}
                  className="text-primary font-semibold hover:underline"
                >
                  {t('register.loginLink')}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default RegistrationForm;