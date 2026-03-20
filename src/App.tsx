/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Car, Menu, X, ChevronDown, MessageCircle, Search, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { locations } from './data/locations';

const ZaloIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <img 
    src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" 
    alt="Zalo" 
    width={size} 
    height={size} 
    className={`object-contain ${className}`}
    referrerPolicy="no-referrer"
  />
);

const FacebookIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <img 
    src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" 
    alt="Facebook" 
    width={size} 
    height={size} 
    className={`object-contain ${className}`}
    referrerPolicy="no-referrer"
  />
);

const WhatsAppIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <img 
    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
    alt="WhatsApp" 
    width={size} 
    height={size} 
    className={`object-contain ${className}`}
    referrerPolicy="no-referrer"
  />
);

const LineIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <img 
    src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" 
    alt="Line" 
    width={size} 
    height={size} 
    className={`object-contain ${className}`}
    referrerPolicy="no-referrer"
  />
);

function LocationSelector({ 
  label, 
  icon: Icon, 
  value, 
  onChange 
}: { 
  label?: string; 
  icon?: any; 
  value: { province: string; district: string; ward: string };
  onChange: (val: { province: string; district: string; ward: string }) => void;
}) {
  const selectedProvince = locations.find(p => p.name === value.province);
  const selectedDistrict = selectedProvince?.districts.find(d => d.name === value.district);

  const isAirport = value.province.includes("Sân bay Tân Sơn Nhất");

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
          {Icon && <Icon size={12} className="text-red-600" />} {label}
        </label>
      )}
      
      <div className="grid grid-cols-1 gap-3">
        {/* Tỉnh/Thành */}
        <div className="relative group">
          <select 
            value={value.province}
            onChange={(e) => {
              const val = e.target.value;
              if (val.includes("Sân bay Tân Sơn Nhất")) {
                // Auto-select first district and ward for airport
                onChange({ 
                  province: val, 
                  district: "Ga Quốc Nội", 
                  ward: "Sảnh A" 
                });
              } else {
                onChange({ province: val, district: '', ward: '' });
              }
            }}
            className="w-full pl-4 pr-8 py-4 bg-[#f7fafc] border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-red-500/5 focus:border-red-500 focus:bg-white outline-none appearance-none transition-all"
          >
            <option value="">Chọn Tỉnh/Thành</option>
            {locations.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 pointer-events-none group-focus-within:text-red-500 transition-colors" />
        </div>

        {!isAirport && (
          <div className="grid grid-cols-2 gap-3">
            {/* Quận/Huyện */}
            <div className="relative group">
              <select 
                value={value.district}
                disabled={!value.province}
                onChange={(e) => onChange({ ...value, district: e.target.value, ward: '' })}
                className="w-full pl-4 pr-8 py-4 bg-[#f7fafc] border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-red-500/5 focus:border-red-500 focus:bg-white outline-none appearance-none transition-all disabled:opacity-50"
              >
                <option value="">Quận/Huyện</option>
                {selectedProvince?.districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 pointer-events-none group-focus-within:text-red-500 transition-colors" />
            </div>

            {/* Phường/Xã */}
            <div className="relative group">
              <select 
                value={value.ward}
                disabled={!value.district}
                onChange={(e) => onChange({ ...value, ward: e.target.value })}
                className="w-full pl-4 pr-8 py-4 bg-[#f7fafc] border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-red-500/5 focus:border-red-500 focus:bg-white outline-none appearance-none transition-all disabled:opacity-50"
              >
                <option value="">Phường/Xã</option>
                {selectedDistrict?.wards.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 pointer-events-none group-focus-within:text-red-500 transition-colors" />
            </div>
          </div>
        )}
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
    pickup: string;
    destination: string;
    roundedPrice: number;
  } | null>(null);

  const getCoordinates = async (address: string, fallbackAddress?: string): Promise<[number, number] | null> => {
    const fetchCoords = async (addr: string) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&limit=1`, {
          headers: {
            'User-Agent': 'NguyenVyLuxuryBookingApp/1.0'
          }
        });
        const data = await response.json();
        if (data && data.length > 0) {
          return [parseFloat(data[0].lat), parseFloat(data[0].lon)] as [number, number];
        }
        return null;
      } catch (err) {
        console.error("Geocoding error:", err);
        return null;
      }
    };

    let coords = await fetchCoords(address);
    if (!coords && fallbackAddress) {
      console.log(`Geocoding failed for "${address}", trying fallback: "${fallbackAddress}"`);
      coords = await fetchCoords(fallbackAddress);
    }
    return coords;
  };

  const getRouteDistance = async (start: [number, number], end: [number, number]): Promise<number | null> => {
    try {
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=false`, {
        headers: {
          'User-Agent': 'NguyenVyLuxuryBookingApp/1.0'
        }
      });
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
      roundedPrice
    };
  };

  const SPECIAL_LOCATIONS: Record<string, string> = {
    "Sân bay Tân Sơn Nhất": "Sân bay Tân Sơn Nhất, TP. Hồ Chí Minh, Việt Nam"
  };

  const normalizeDistrictName = (name: string) => {
    // Convert "Cao Lãnh (Thành phố)" -> "Thành phố Cao Lãnh"
    // Convert "Cao Lãnh (Huyện)" -> "Huyện Cao Lãnh"
    // Convert "Duyên Hải (Thị xã)" -> "Thị xã Duyên Hải"
    const match = name.match(/^(.*)\s\((Thành phố|Huyện|Thị xã)\)$/);
    if (match) {
      return `${match[2]} ${match[1]}`;
    }
    return name;
  };

  const formatGeocodeAddress = (loc: { province: string; district: string; ward: string }) => {
    // Check for special locations first
    for (const [key, fullAddress] of Object.entries(SPECIAL_LOCATIONS)) {
      if (loc.province.includes(key)) {
        return fullAddress;
      }
    }
    
    // Helper to strip emojis and trim
    const clean = (str: string) => str.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '').trim();
    
    const ward = clean(loc.ward);
    const district = normalizeDistrictName(clean(loc.district));
    const province = clean(loc.province).replace(/^TP\.\s*/, 'Thành phố ');
    
    // Format: phường/xã, quận/huyện/thành phố/thị xã, tỉnh/thành, Việt Nam
    return `${ward}, ${district}, ${province}, Việt Nam`;
  };

  const handleEstimate = async () => {
    // Clear previous results
    setError(null);
    setCalcResult(null);

    // Strict Validation
    if (!pickup.province) {
      setError("Vui lòng chọn Tỉnh/Thành cho điểm đón.");
      return;
    }
    if (!pickup.district) {
      setError("Vui lòng chọn Quận/Huyện cho điểm đón.");
      return;
    }
    if (!pickup.ward) {
      setError("Vui lòng chọn Phường/Xã cho điểm đón.");
      return;
    }

    if (!destination.province) {
      setError("Vui lòng chọn Tỉnh/Thành cho điểm đến.");
      return;
    }
    if (!destination.district) {
      setError("Vui lòng chọn Quận/Huyện cho điểm đến.");
      return;
    }
    if (!destination.ward) {
      setError("Vui lòng chọn Phường/Xã cho điểm đến.");
      return;
    }

    // Check for identical locations
    if (pickup.province === destination.province && 
        pickup.district === destination.district && 
        pickup.ward === destination.ward) {
      setError("Điểm đón và điểm đến không được trùng nhau.");
      return;
    }

    setIsLoading(true);

    const pickupAddr = formatGeocodeAddress(pickup);
    const destAddr = formatGeocodeAddress(destination);

    // Fallback addresses (District + Province)
    const pickupFallback = `${normalizeDistrictName(pickup.district)}, ${pickup.province.replace(/^TP\.\s*/, 'Thành phố ')}, Việt Nam`;
    const destFallback = `${normalizeDistrictName(destination.district)}, ${destination.province.replace(/^TP\.\s*/, 'Thành phố ')}, Việt Nam`;

    try {
      const startCoords = await getCoordinates(pickupAddr, pickupFallback);
      if (!startCoords) {
        setError(`Không tìm thấy vị trí điểm đón: "${pickupAddr}". Vui lòng thử chọn địa danh lân cận hoặc kiểm tra lại.`);
        setIsLoading(false);
        return;
      }

      const endCoords = await getCoordinates(destAddr, destFallback);
      if (!endCoords) {
        setError(`Không tìm thấy vị trí điểm đến: "${destAddr}". Vui lòng thử chọn địa danh lân cận hoặc kiểm tra lại.`);
        setIsLoading(false);
        return;
      }

      const distInMeters = await getRouteDistance(startCoords, endCoords);
      if (distInMeters === null) {
        setError("Lỗi tính toán tuyến đường: Không thể tìm thấy đường đi giữa hai địa điểm này. Có thể do khoảng cách quá xa hoặc địa hình không phù hợp.");
        setIsLoading(false);
        return;
      }

      const distInKm = distInMeters / 1000;
      const pricing = calculateFinalPrice(distInKm);
      
      setCalcResult({
        distance: pricing.distance,
        roundedPrice: pricing.roundedPrice,
        pickup: pickupAddr,
        destination: destAddr
      });
    } catch (err) {
      console.error("Estimation error:", err);
      setError("Đã có lỗi xảy ra trong quá trình tính toán. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
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
          isScrolled ? 'bg-white shadow-md py-1.5' : 'bg-white/90 backdrop-blur-sm py-2'
        }`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-1 rounded-lg">
              <Car className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-extrabold tracking-tighter text-slate-900 leading-none">
                NGUYỄN VY
              </h1>
              <p className="text-[8px] font-bold text-red-600 tracking-widest uppercase">Luxury Service</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-6 font-semibold text-sm">
              <a href="#" className="hover:text-red-600 transition-colors">Trang chủ</a>
              <a href="#booking" className="hover:text-red-600 transition-colors">Đặt xe</a>
              <a href="#" className="hover:text-red-600 transition-colors">Liên hệ</a>
            </nav>
            <div className="flex items-center gap-3">
              <a 
                href="tel:0937243749" 
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 text-sm"
              >
                <Phone size={16} fill="currentColor" />
                0937 243 749
              </a>
              <a 
                href="https://zalo.me/0937243749" 
                target="_blank"
                className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-all text-sm"
              >
                <ZaloIcon size={24} />
                Zalo
              </a>
            </div>
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
              <a href="https://zalo.me/0937243749" target="_blank" className="text-blue-600 flex items-center gap-2">
                <ZaloIcon size={32} /> Chat Zalo
              </a>
              <a href="https://www.facebook.com/Nguyenvyfamily" target="_blank" className="text-blue-800 flex items-center gap-2">
                <FacebookIcon size={32} /> Facebook
              </a>
              <a href="https://line.me/ti/p/QeBK3LeCL6" target="_blank" className="text-green-600 flex items-center gap-2">
                <LineIcon size={32} /> Line
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Hero Section */}
        <section className="relative pt-16 pb-20 overflow-hidden bg-[#f8fafc]">
          {/* Background Image with subtle overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1920" 
              alt="Luxury Car" 
              className="w-full h-full object-cover opacity-[0.07] grayscale"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Booking Form at the Top */}
            <div className="max-w-4xl mx-auto mb-12">
              <motion.div 
                id="booking"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 md:p-10 border border-slate-50 relative"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ff0000] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl z-10 whitespace-nowrap">
                  BÁO GIÁ TỰ ĐỘNG 24/7
                </div>

                <div className="mb-8 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-[#ff0000] p-3 rounded-2xl shadow-lg shadow-red-200">
                      <Car className="text-white w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-[#1a202c] tracking-tight">
                      Báo Giá Nhanh
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Nhập thông tin để nhận báo giá chính xác nhất</p>
                  </div>
                </div>
                
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">SỐ ĐIỆN THOẠI LIÊN HỆ</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors w-4 h-4" />
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="09xx xxx xxx"
                        className="w-full pl-12 pr-4 py-4 bg-[#f7fafc] border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 focus:bg-white transition-all font-bold text-base text-slate-900 placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                        <MapPin size={14} /> ĐIỂM ĐÓN KHÁCH
                      </label>
                      <LocationSelector 
                        label="" 
                        icon={null} 
                        value={pickup}
                        onChange={setPickup}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                        <Search size={14} /> ĐIỂM ĐẾN DỰ KIẾN
                      </label>
                      <LocationSelector 
                        label="" 
                        icon={null} 
                        value={destination}
                        onChange={setDestination}
                      />
                    </div>
                  </div>
                </form>

                <button 
                  type="button"
                  disabled={isLoading}
                  onClick={handleEstimate}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-black py-3.5 rounded-xl shadow-lg shadow-red-100 transition-all transform hover:-translate-y-0.5 active:scale-95 uppercase tracking-widest mt-4 flex items-center justify-center gap-2 text-[11px]"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Search size={16} strokeWidth={3} />
                  )}
                  {isLoading ? 'Đang tính...' : 'XEM BÁO GIÁ NGAY'}
                </button>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-3 p-2.5 bg-red-50 border border-red-100 text-red-600 text-[9px] rounded-lg font-bold flex items-center gap-2"
                  >
                    <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                    {error}
                  </motion.div>
                )}

                {calcResult && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2"
                  >
                    <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Quãng đường: {calcResult.distance} km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">TỔNG CỘNG:</span>
                      <span className="text-xl font-black text-red-600 tracking-tighter">{calcResult.roundedPrice.toLocaleString('vi-VN')}đ</span>
                    </div>
                    
                    <motion.button 
                      onClick={() => {
                        const message = `Chào Nguyễn Vy Luxury, tôi muốn đặt xe:\n- SĐT: ${phone}\n- Điểm đón: ${calcResult.pickup}\n- Điểm đến: ${calcResult.destination}\n- Quãng đường: ${calcResult.distance} km\n- TỔNG THANH TOÁN: ${calcResult.roundedPrice.toLocaleString('vi-VN')}đ`;
                        const encodedMessage = encodeURIComponent(message);
                        window.open(`https://zalo.me/0937243749?text=${encodedMessage}`, '_blank');
                      }}
                      animate={{ 
                        backgroundColor: ["#0068FF", "#ff0000", "#0068FF"],
                        x: [0, -2, 2, -2, 2, 0]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        repeatType: "loop"
                      }}
                      className="w-full text-white text-[11px] font-black py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      <ZaloIcon size={18} />
                      ĐẶT XE QUA ZALO 👈
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            </div>

            <div className="flex flex-col items-stretch justify-center gap-6 lg:gap-8 max-w-4xl mx-auto">
              {/* Fixed Routes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-full"
              >
                <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-6 md:p-10 border border-slate-50 h-full flex flex-col">
                  <div className="mb-8 text-center">
                    <h3 className="text-2xl font-black text-[#ff0000] tracking-tight uppercase mb-2">
                      TUYẾN CỐ ĐỊNH GIÁ RẺ
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Các tuyến đường phổ biến với giá ưu đãi đặc biệt</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                    {/* Route 1 */}
                    <div className="bg-[#f7fafc] p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-4 shadow-sm hover:shadow-md transition-all group">
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-3 bg-white px-5 py-2 rounded-full shadow-sm">
                        Sài Gòn <span className="text-red-600 bg-red-50 p-1 rounded-md"><Car size={14} /></span> Cần Thơ
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">GIÁ TRỌN GÓI</div>
                        <div className="text-3xl font-black text-[#1a202c]">1.400.000đ</div>
                      </div>
                      <motion.button 
                        onClick={() => {
                          const message = `Chào Nguyễn Vy Luxury, tôi muốn đặt xe tuyến cố định:\n- Lộ trình: Trung Tâm Sài Gòn ➡️ Trung Tâm Cần Thơ\n- Giá: 1.400.000đ`;
                          window.open(`https://zalo.me/0937243749?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                        animate={{ 
                          backgroundColor: ["#ff0000", "#cc0000", "#ff0000"],
                          x: [0, -2, 2, -2, 2, 0],
                          scale: [1, 1.02, 1]
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity,
                          repeatType: "loop"
                        }}
                        className="w-full text-white py-4 rounded-2xl font-black hover:bg-red-700 transition-all uppercase text-xs tracking-widest shadow-lg shadow-red-100"
                      >
                        " BOOK XE " 👈
                      </motion.button>
                    </div>

                    {/* Route 2 */}
                    <div className="bg-[#f7fafc] p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-4 shadow-sm hover:shadow-md transition-all group">
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-3 bg-white px-5 py-2 rounded-full shadow-sm">
                        Sài Gòn <span className="text-red-600 bg-red-50 p-1 rounded-md"><Car size={14} /></span> Sóc Trăng
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">GIÁ TRỌN GÓI</div>
                        <div className="text-3xl font-black text-[#1a202c]">1.800.000đ</div>
                      </div>
                      <motion.button 
                        onClick={() => {
                          const message = `Chào Nguyễn Vy Luxury, tôi muốn đặt xe tuyến cố định:\n- Lộ trình: Trung Tâm Sài Gòn ➡️ Trung Tâm Sóc Trăng\n- Giá: 1.800.000đ`;
                          window.open(`https://zalo.me/0937243749?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                        animate={{ 
                          backgroundColor: ["#ff0000", "#cc0000", "#ff0000"],
                          x: [0, -2, 2, -2, 2, 0],
                          scale: [1, 1.02, 1]
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity,
                          repeatType: "loop"
                        }}
                        className="w-full text-white py-4 rounded-2xl font-black hover:bg-red-700 transition-all uppercase text-xs tracking-widest shadow-lg shadow-red-100"
                      >
                        " BOOK XE " 👈
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Hero Text Card below Fixed Routes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="w-full"
              >
                <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-6 md:p-10 border border-slate-50 flex flex-col justify-center text-center">
                  <h2 className="text-3xl md:text-5xl font-black text-[#1a202c] leading-[1.1] tracking-tight mb-6">
                    Dịch Vụ Xe <span className="text-[#ff0000] italic">Hạng Sang</span><br />
                    Giá Bình Dân
                  </h2>
                  <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium">
                    Trải nghiệm hành trình đẳng cấp với đội ngũ tài xế chuyên nghiệp. Cam kết giá tốt nhất thị trường, phục vụ 24/7.
                  </p>
                  <div className="mt-8 flex justify-center gap-8">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-2">
                        <Star size={24} fill="currentColor" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chất lượng</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
                        <Phone size={24} fill="currentColor" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hỗ trợ 24/7</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}

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
                Dịch vụ cho thuê xe du lịch hàng đầu khu vực HỒ CHÍ MINH - CẦN THƠ - SÓC TRĂNG & CÁC TỈNH MIỀN TÂY. 
                Uy tín - Chất lượng - Tận tâm.
              </p>
            </div>
            <div>
              <h5 className="text-lg font-bold mb-6">Liên hệ</h5>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-red-500" /> 
                  <a href="tel:0937243749" className="hover:text-white transition-colors">Hotline: 0937 243 749</a>
                </li>
                <li className="flex items-center gap-3">
                  <ZaloIcon size={20} />
                  <a href="https://zalo.me/0937243749" target="_blank" className="hover:text-blue-400 transition-colors">Zalo: 0937 243 749</a>
                </li>
                <li className="flex items-center gap-3">
                  <WhatsAppIcon size={20} />
                  <a href="https://wa.me/84937243749" target="_blank" className="hover:text-green-400 transition-colors">WhatsApp: 0937 243 749</a>
                </li>
                <li className="flex items-center gap-3">
                  <FacebookIcon size={20} />
                  <a href="https://www.facebook.com/Nguyenvyfamily" target="_blank" className="hover:text-blue-500 transition-colors">Facebook: Nguyenvyfamily</a>
                </li>
                <li className="flex items-center gap-3">
                  <LineIcon size={20} />
                  <a href="https://line.me/ti/p/QeBK3LeCL6" target="_blank" className="hover:text-green-500 transition-colors">Line ID: Nguyễn Vy</a>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin size={18} className="text-red-500" /> HỒ CHÍ MINH - CẦN THƠ - SÓC TRĂNG & CÁC TỈNH MIỀN TÂY
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

      {/* Floating Contact Stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 items-end">
        {/* Phone */}
        <motion.a 
          href="tel:0937243749"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative group flex items-center justify-center"
        >
          <div className="bg-red-600 p-4 rounded-full shadow-2xl flex items-center justify-center relative">
            <Phone size={28} fill="currentColor" className="text-white" />
            <span className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-20"></span>
          </div>
          <span className="absolute right-16 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
            Gọi ngay: 0937 243 749
          </span>
        </motion.a>

        {/* Zalo */}
        <motion.a 
          href="https://zalo.me/0937243749"
          target="_blank"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative group flex items-center justify-center"
        >
          <ZaloIcon size={60} />
          <span className="absolute right-16 bg-white text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-blue-50">
            Chat Zalo
          </span>
        </motion.a>

        {/* Facebook */}
        <motion.a 
          href="https://www.facebook.com/Nguyenvyfamily"
          target="_blank"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative group flex items-center justify-center"
        >
          <FacebookIcon size={52} />
          <span className="absolute right-16 bg-white text-blue-800 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-blue-50">
            Facebook
          </span>
        </motion.a>

        {/* WhatsApp */}
        <motion.a 
          href="https://wa.me/84937243749"
          target="_blank"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative group flex items-center justify-center"
        >
          <WhatsAppIcon size={52} />
          <span className="absolute right-16 bg-white text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-green-50">
            WhatsApp
          </span>
        </motion.a>

        {/* Line */}
        <motion.a 
          href="https://line.me/ti/p/QeBK3LeCL6"
          target="_blank"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative group flex items-center justify-center"
        >
          <LineIcon size={52} />
          <span className="absolute right-16 bg-white text-green-500 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-green-50">
            Line
          </span>
        </motion.a>
      </div>
    </div>
  );
}
