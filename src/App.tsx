/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Car, Menu, X, ChevronDown, MessageCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { locations } from './data/locations';

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
            {locations.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
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
            {selectedProvince?.districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
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
            {selectedDistrict?.wards.map(w => <option key={w} value={w}>{w}</option>)}
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calcResult, setCalcResult] = useState<{
    distance: number;
    rate: number;
    basePrice: number;
    roundedPrice: number;
  } | null>(null);

  const getCoordinates = async (address: string): Promise<[number, number] | null> => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      return null;
    } catch (err) {
      console.error("Geocoding error:", err);
      return null;
    }
  };

  const getRouteDistance = async (start: [number, number], end: [number, number]): Promise<number | null> => {
    try {
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=false`);
      const data = await response.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        return data.routes[0].distance; // in meters
      }
      return null;
    } catch (err) {
      console.error("Routing error:", err);
      return null;
    }
  };

  const calculateFinalPrice = (distInKm: number) => {
    let rate = 0;
    if (distInKm < 100) rate = 11000;
    else if (distInKm < 130) rate = 10000;
    else rate = 9000;

    const basePrice = distInKm * rate;
    const remainder = basePrice % 100000;
    const roundedPrice = remainder < 50000 ? basePrice - remainder : basePrice + (100000 - remainder);

    return {
      distance: Math.round(distInKm * 10) / 10,
      rate,
      basePrice,
      roundedPrice
    };
  };

  const handleEstimate = async () => {
    if (!pickup.province || !destination.province) {
      setError("Vui lòng chọn đầy đủ điểm đón và điểm đến.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCalcResult(null);

    const pickupAddr = `${pickup.ward}, ${pickup.district}, ${pickup.province}, Việt Nam`;
    const destAddr = `${destination.ward}, ${destination.district}, ${destination.province}, Việt Nam`;

    const startCoords = await getCoordinates(pickupAddr);
    const endCoords = await getCoordinates(destAddr);

    if (!startCoords || !endCoords) {
      setError("Không tìm thấy địa điểm. Vui lòng kiểm tra lại địa chỉ.");
      setIsLoading(false);
      return;
    }

    const distInMeters = await getRouteDistance(startCoords, endCoords);
    if (distInMeters === null) {
      setError("Không thể tính được quãng đường giữa hai địa điểm này.");
      setIsLoading(false);
      return;
    }

    const distInKm = distInMeters / 1000;
    const result = calculateFinalPrice(distInKm);
    setCalcResult(result);
    setIsLoading(false);
  };

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
            <div className="absolute inset-0 bg-black/50"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10 flex justify-center items-center">
            {/* Booking Form */}
            <motion.div 
              id="booking"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Car className="text-red-600" /> Điền vào xem giá
              </h3>
              
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

              <button 
                type="button"
                disabled={isLoading}
                onClick={handleEstimate}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-black py-4 rounded-xl shadow-lg shadow-green-200 transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-wider mt-6 mb-4 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <MessageCircle size={20} fill="currentColor" />
                )}
                {isLoading ? 'Đang tính toán...' : 'CLICK VÀO XEM BÁO GIÁ'}
              </button>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium">
                  {error}
                </div>
              )}

              {calcResult && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2"
                >
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Quãng đường dự kiến:</span>
                    <span className="font-bold">{calcResult.distance} km</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Đơn giá áp dụng:</span>
                    <span className="font-bold">{calcResult.rate.toLocaleString('vi-VN')}đ/km</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900 uppercase">TỔNG THANH TOÁN:</span>
                    <span className="text-lg font-black text-red-600">{calcResult.roundedPrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                  
                  <button 
                    onClick={() => {
                      const message = `Chào Nguyễn Vy Luxury, tôi muốn đặt xe:\n- Số điện thoại: ${phone || 'Chưa nhập'}\n- Điểm đón: ${pickup.ward}, ${pickup.district}, ${pickup.province}\n- Điểm đến: ${destination.ward}, ${destination.district}, ${destination.province}\n\nTHÔNG TIN BÁO GIÁ:\n- Quãng đường: ${calcResult.distance} km\n- Đơn giá: ${calcResult.rate.toLocaleString('vi-VN')}đ/km\n- TỔNG THANH TOÁN: ${calcResult.roundedPrice.toLocaleString('vi-VN')}đ`;
                      const encodedMessage = encodeURIComponent(message);
                      window.open(`https://zalo.me/0937243749?text=${encodedMessage}`, '_blank');
                    }}
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={16} fill="currentColor" />
                    GỬI YÊU CẦU QUA ZALO
                  </button>
                </motion.div>
              )}
              <p className="text-center text-[10px] text-slate-400 mt-4">
                * Nhấn để kết nối Zalo và nhận báo giá ngay lập tức.
              </p>
            </motion.div>
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
