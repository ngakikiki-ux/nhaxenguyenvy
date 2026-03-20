/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Car, Menu, X, ChevronDown, MessageCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { locations } from './data/locations';

const destinations = [
  'CÀ MAU', 'BẠC LIÊU', 'HẬU GIANG', 'CẦN THƠ', 
  'KIÊN GIANG', 'AN GIANG', 'TRÀ VINH', 'VĨNH LONG',
  'BẾN TRE', 'TIỀN GIANG', 'LONG AN', 'ĐỒNG THÁP',
  'SÓC TRĂNG'
];

function LocationSelector({ 
  label, 
  icon: Icon, 
  value, 
  onChange 
}: { 
  label: string; 
  icon: any; 
  value: { province: string; district: string; ward: string };
  onChange: (val: { province: string; district: string; ward: string }) => void;
}) {
  const selectedProvince = locations.find(p => p.name === value.province);
  const selectedDistrict = selectedProvince?.districts.find(d => d.name === value.district);

  return (
    <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
      <label className="block text-[10px] font-black text-slate-500 uppercase ml-1 tracking-wider flex items-center gap-1">
        <Icon size={12} className="text-red-600" /> {label}
      </label>
      
      <div className="grid grid-cols-1 gap-2">
        {/* Tỉnh/Thành */}
        <div className="relative">
          <select 
            value={value.province}
            onChange={(e) => onChange({ province: e.target.value, district: '', ward: '' })}
            className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none appearance-none"
          >
            <option value="">Chọn Tỉnh/Thành</option>
            {locations.map(p => <option key={p.slug} value={p.name}>{p.name}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
        </div>

        {/* Quận/Huyện */}
        <div className="relative">
          <select 
            value={value.district}
            disabled={!value.province}
            onChange={(e) => onChange({ ...value, district: e.target.value, ward: '' })}
            className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none appearance-none disabled:opacity-50"
          >
            <option value="">Chọn Quận/Huyện</option>
            {selectedProvince?.districts.map(d => <option key={d.slug} value={d.name}>{d.name}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
        </div>

        {/* Phường/Xã */}
        <div className="relative">
          <select 
            value={value.ward}
            disabled={!value.district}
            onChange={(e) => onChange({ ...value, ward: e.target.value })}
            className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none appearance-none disabled:opacity-50"
          >
            <option value="">Chọn Phường/Xã/Thị trấn</option>
            {selectedDistrict?.wards.map(w => <option key={w.slug} value={w.name}>{w.name}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [phone, setPhone] = useState('');
  const [distance, setDistance] = useState<string>('');
  const [pickup, setPickup] = useState({ province: '', district: '', ward: '' });
  const [destination, setDestination] = useState({ province: '', district: '', ward: '' });

  const calculatePrice = (distStr: string) => {
    const x = parseFloat(distStr);
    if (isNaN(x) || x <= 0) return null;

    let rate = 0;
    if (x < 100) rate = 11000;
    else if (x < 130) rate = 10000;
    else rate = 9000;

    const basePrice = x * rate;
    const remainder = basePrice % 100000;
    const roundedPrice = remainder < 50000 ? basePrice - remainder : basePrice + (100000 - remainder);

    return {
      distance: x,
      rate,
      basePrice,
      roundedPrice
    };
  };

  const priceResult = calculatePrice(distance);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-md py-2' : 'bg-white/90 backdrop-blur-sm py-4'
        }`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-1.5 rounded-lg">
              <Car className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tighter text-slate-900 leading-none">
                NGUYỄN VY
              </h1>
              <p className="text-[10px] font-bold text-red-600 tracking-widest uppercase">Luxury Service</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <nav className="flex gap-6 font-semibold text-sm">
              <a href="#" className="hover:text-red-600 transition-colors">Trang chủ</a>
              <a href="#booking" className="hover:text-red-600 transition-colors">Đặt xe</a>
              <a href="#destinations" className="hover:text-red-600 transition-colors">Tuyến đường</a>
              <a href="#" className="hover:text-red-600 transition-colors">Liên hệ</a>
            </nav>
            <a 
              href="tel:0937243749" 
              className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
            >
              <Phone size={18} fill="currentColor" />
              0937 243 749
            </a>
          </div>

          <button 
            className="md:hidden text-slate-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
          >
            <nav className="flex flex-col gap-6 text-xl font-bold">
              <a href="#" onClick={() => setMobileMenuOpen(false)}>Trang chủ</a>
              <a href="#booking" onClick={() => setMobileMenuOpen(false)}>Đặt xe</a>
              <a href="#destinations" onClick={() => setMobileMenuOpen(false)}>Tuyến đường</a>
              <a href="tel:0937243749" className="text-red-600 flex items-center gap-2">
                <Phone fill="currentColor" /> 0937 243 749
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1920" 
              alt="Luxury Car" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <span className="inline-block bg-red-600 text-white px-4 py-1 rounded-md text-sm font-bold mb-4 uppercase tracking-widest">
                Dịch vụ 5 sao
              </span>
              <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                CHO THUÊ XE <br />
                <span className="text-red-500">NGUYỄN VY LUXURY</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-200 mb-8 max-w-lg">
                Chuyên cung cấp dịch vụ xe du lịch, xe đi tỉnh, xe đưa đón sân bay uy tín, chất lượng cao tại khu vực Miền Tây.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
                  <Phone className="text-red-500" />
                  <span className="font-semibold">Hỗ trợ 24/7</span>
                </div>
              </div>
            </motion.div>

            {/* Booking Form */}
            <motion.div 
              id="booking"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md mx-auto lg:mr-0"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Car className="text-red-600" /> Điền vào xem giá
              </h3>
              
              <button 
                type="button"
                onClick={() => {
                  let message = `Chào Nguyễn Vy Luxury, tôi muốn xem báo giá xe:\n- Số điện thoại: ${phone || 'Chưa nhập'}\n- Điểm đón: ${pickup.ward}, ${pickup.district}, ${pickup.province}\n- Điểm đến: ${destination.ward}, ${destination.district}, ${destination.province}`;
                  
                  if (priceResult) {
                    message += `\n\nTHÔNG TIN BÁO GIÁ:\n- Số km: ${priceResult.distance} km\n- Đơn giá: ${priceResult.rate.toLocaleString('vi-VN')}đ/km\n- Tiền gốc: ${priceResult.basePrice.toLocaleString('vi-VN')}đ\n- TỔNG THANH TOÁN: ${priceResult.roundedPrice.toLocaleString('vi-VN')}đ`;
                  }
                  
                  const encodedMessage = encodeURIComponent(message);
                  window.open(`https://zalo.me/0937243749?text=${encodedMessage}`, '_blank');
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl shadow-lg shadow-green-200 transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-wider mb-6 flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} fill="currentColor" />
                XEM BÁO GIÁ
              </button>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Số điện thoại</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Nhập số điện thoại"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <LocationSelector 
                    label="Điểm đón" 
                    icon={MapPin} 
                    value={pickup}
                    onChange={setPickup}
                  />
                  
                  <LocationSelector 
                    label="Điểm đến" 
                    icon={Search} 
                    value={destination}
                    onChange={setDestination}
                  />
                </div>
              </form>
              <p className="text-center text-[10px] text-slate-400 mt-4">
                * Nhấn để kết nối Zalo và nhận báo giá ngay lập tức.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Destinations Section */}
        <section id="destinations" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div 
              {...fadeInUp}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
                BẠN CẦN THUÊ XE ĐI ĐÂU?
              </h2>
              <div className="w-20 h-1.5 bg-red-600 mx-auto rounded-full mb-6"></div>
              <p className="text-slate-500 max-w-2xl mx-auto italic">
                Dưới đây là các tuyến đường phổ biến chúng tôi thường xuyên phục vụ. 
                Giá cả cạnh tranh, tài xế nhiệt tình, xe 4 chỗ và 7 chỗ đời mới.
              </p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {destinations.map((city, index) => (
                <motion.button
                  key={city}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05, backgroundColor: '#b91c1c' }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-red-600 text-white px-6 py-3 rounded-full font-bold text-sm md:text-base shadow-md hover:shadow-xl transition-all"
                >
                  {city}
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                { title: 'Giá rẻ nhất', desc: 'Cam kết mức giá cạnh tranh nhất thị trường, không phát sinh chi phí.' },
                { title: 'Tài xế chuyên nghiệp', desc: 'Đội ngũ tài xế nhiều năm kinh nghiệm, rành đường, lịch sự.' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  {...fadeInUp}
                  transition={{ delay: i * 0.2 }}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center"
                >
                  <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Car size={32} />
                  </div>
                  <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Car className="text-red-500 w-8 h-8" />
                <h1 className="text-2xl font-black tracking-tighter">NGUYỄN VY LUXURY</h1>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Dịch vụ cho thuê xe du lịch hàng đầu khu vực Miền Tây. 
                Uy tín - Chất lượng - Tận tâm.
              </p>
            </div>
            <div>
              <h5 className="text-lg font-bold mb-6">Liên hệ</h5>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-red-500" /> 0937 243 749
                </li>
                <li className="flex items-center gap-3">
                  <MapPin size={18} className="text-red-500" /> TP. Cần Thơ & Các tỉnh Miền Tây
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg font-bold mb-6">Dịch vụ</h5>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li>Thuê xe đi tỉnh</li>
                <li>Đưa đón sân bay</li>
                <li>Xe hoa cưới hỏi</li>
                <li>Hợp đồng tham quan</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-xs">
            <p>© 2024 Nguyễn Vy Luxury. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Buttons */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-4">
        <motion.a 
          href="tel:0937243749"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-red-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center relative group"
        >
          <Phone size={24} fill="currentColor" />
          <span className="absolute left-16 bg-red-600 text-white px-4 py-2 rounded-lg font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
            Gọi ngay: 0937 243 749
          </span>
          <span className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-20"></span>
        </motion.a>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <motion.a 
          href="https://zalo.me/0937243749"
          target="_blank"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-blue-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center relative group"
        >
          <MessageCircle size={28} fill="currentColor" />
          <span className="absolute right-16 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold whitespace-nowrap opacity-100 transition-opacity shadow-xl flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Chat Zalo ngay
          </span>
          <span className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-40"></span>
        </motion.a>
      </div>
    </div>
  );
}
