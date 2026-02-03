
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Deal, Reward } from '../types';
import apiClient from '../src/api/client';

interface HomeProps {
  user: User;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const banners = [
    {
      id: 'bn1',
      title: 'Double Points Weekend',
      subtitle: 'รับคะแนนคูณ 2 ทุกการสั่งซื้อเครื่องดื่มตลอดสุดสัปดาห์นี้',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1200',
      buttonText: 'ดูรายละเอียด',
      color: 'from-dark-green/90 to-transparent'
    },
    {
      id: 'bn2',
      title: 'Jespark x Starbucks',
      subtitle: 'แลกรับส่วนลดพิเศษ 50% สำหรับเมนูใหม่ล่าสุด',
      image: 'https://images.unsplash.com/photo-1544787210-2213d4b2d501?auto=format&fit=crop&q=80&w=1200',
      buttonText: 'แลกเลย',
      color: 'from-primary-dark/90 to-transparent'
    },
    {
      id: 'bn3',
      title: 'New Store Opening',
      subtitle: 'พบกับสาขาใหม่ใจกลางเมือง พร้อมของแถมพิเศษเพียบ!',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1200',
      buttonText: 'เช็คสาขา',
      color: 'from-black/70 to-transparent'
    }
  ];

  const handleScroll = () => {
    if (scrollRef.current) {
      const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.offsetWidth);
      setCurrentBanner(index);
    }
  };

  const recommendedBrands = [
    { id: 'b1', name: 'Starbucks', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFpHP7ypyvvPB2HdiLPAN61U09KAClGg9egyPVrQ1mabu-2ie1R4AiGH7VYdXwOnMpJ1lbwmtMngvQ_oUJP8Vdl4NxsNicAcVlVd7TgLSIYQxjHmEuPD16VPVnXkBg0oAo2jJ50FnswlxpgIox4sRXGsn9fSD_MVsVDzhrKPYwOQtHP-H_JQu5fz5NruPNIESZoTQ7xlWMSP7MSYP9qzhByMValV1WVGaOdPMvS274PsA1HQ52QfDMTHz3O9itq2RPlOUESMH8Iuy7' },
    { id: 'b2', name: 'Burger King', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6LJYBHHFZSoQy3Wg_vzaY4q7StRQxRADyvCwr3oPbcE-wic6aYxSavAaRJj_hBIKpLbPaBP2n3OIZO5Nkhikp0Aeg9UXGfHt1bjUytNPxIl2tCpFhH50GI4iXzvzPqSopMwp-1XQwKL3xiYoiyo6nGyhaMBeC8iSrVYwWKH1ssDvhj_yKn2TmfdeMTgl6aWzo6zZ5o4_kPsTdioDBph4unqllG7hciiaLUJRt3r5n641neGh_VxTjy0_Sf4FEtssjdMk_DuWJedIk' },
    { id: 'b3', name: 'Zara', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsMksrSYzQxxwOhIaiOrdGpCMKOBnT_fX1_rEh7tm6S_TNG1Pvfa0sF9SfIY63tx81PqORGYeygBgOF2TS13v6tafJtlR7jHZQRsLRDNxMq67mr8GOpYalhfiPe2YXCizl369CBuUb31myVrpJmrmNFeTO9rukNVYsJcY7xCcv5-n5kSJmykWwBFU_QDXcyLZpMpKmP7z2kX91bmHNW_2aqfe3k808rHZSUiTEsyb2BnKlbiQto8gO5ENnstlqeJ4gsjlk0R4XsXnT' },
    { id: 'b4', name: 'Apple Store', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNwxxwP83tAK8CPoyX5fKQBD9KtnuPwOHFQRSOpR9xie_0Z5P9Ysby5kuTkWQDdhvIKEi5-ByLvLvxcb9ouB0zSrKHfclVUTSJM9sWJ50xEPsUIHAe4caMDAAj2LB9XPj33buwzF7g38-jazaemBjS4B6AZ4M3dqL6xWbG0LCAsBioWlY8DLdNu0yY94TqK4AsRlduGiw_W745tva3tD7TLz-aDdWVqyEcN70Xquib3HWPh5JdK2jv6v9_4Ne-LxEkXAfOVUephbCX' },
    { id: 'b5', name: 'Coffee House', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOkrrkrPaoAYrwTZjX7zCAYcHaou2cHClYHB6jcKvNOFfRr8-rB7ucRVWjNdwJiEh1IRYJVaBkPo-u5dFeVyi61Czwb92neJeBDKrBljIm4tSf6jdhEkCz7aXi8lheu55IAYyhoz2-IqW4Rgl804C1LeSDX4iiTyLcyINe17-Ik5s5VvA5KyKBJQatWdDM4OK2fOO0BXF7Xzc_uyKIZoVaQIXUphgGBslESzWaDUVGqbevHK9I8VqDk_43wkeQXULKtF4QMV6y_qMv' }
  ];

  const deals: Deal[] = [
    {
      id: '1',
      title: 'สดชื่นรับซัมเมอร์',
      subtitle: 'รับคะแนน x2 สำหรับเมนูชาเย็นทุกรายการ',
      tag: 'ยอดนิยม',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYUdalIHIIwvOgXgm-58V-uHRqDiaezZoWCHpRCUvpHE3DPaFQG7afxwDLueMMK3V5XfN0yFj2zxVU0tCyPsyz6BOyh3YBw1Heh52vBqUKfHIKKTDPec8huuKMwCMmrCb6n8ZfQ4v6WRePFZWDEFkBWWcB8zrVXuSNixXllbfO2EzmCmqByLhAOgOUlf0Fd8kZHJZG27JbN0FzzdB9Pw2PASH7ql11KUrJbMGCp_MR2rvmnyyK5O84cZEBTrL3CceEhibNXj6yZTMf'
    },
    {
      id: '2',
      title: 'โบนัสไอที',
      subtitle: 'รับฟรี 500 คะแนน เมื่อซื้ออุปกรณ์ไอที',
      tag: 'พาร์ทเนอร์',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNwxxwP83tAK8CPoyX5fKQBD9KtnuPwOHFQRSOpR9xie_0Z5P9Ysby5kuTkWQDdhvIKEi5-ByLvLvxcb9ouB0zSrKHfclVUTSJM9sWJ50xEPsUIHAe4caMDAAj2LB9XPj33buwzF7g38-jazaemBjS4B6AZ4M3dqL6xWbG0LCAsBioWlY8DLdNu0yY94TqK4AsRlduGiw_W745tva3tD7TLz-aDdWVqyEcN70Xquib3HWPh5JdK2jv6v9_4Ne-LxEkXAfOVUephbCX'
    }
  ];

  // โหลดรางวัลจาก API เท่านั้น (ไม่ใช้ mock)
  useEffect(() => {
    const loadRewards = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getRewards();
        setRewards(response.rewards || []);
      } catch (err: any) {
        console.error('Error loading rewards:', err);
        setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
        setRewards([]);
      } finally {
        setLoading(false);
      }
    };

    loadRewards();
  }, []);

  return (
    <div className="flex flex-col pb-24 animate-fade-in relative z-10">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-md">
        <div className="flex items-center p-4 pb-2 justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 rounded-full p-1 border-2 border-primary cursor-pointer" onClick={() => navigate('/profile')}>
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" 
                style={{ backgroundImage: `url(${user.avatar})` }}
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">ยินดีต้อนรับกลับ,</p>
              <h2 className="text-dark-green text-lg font-bold leading-tight">{user.name}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/notifications')}
              className="flex size-10 items-center justify-center rounded-full bg-gray-100/50 backdrop-blur-sm"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </div>
      </header>

      {/* Smart Search Bar */}
      <div className="px-4 py-2 sticky top-[68px] z-30 bg-white/60 backdrop-blur-md">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center bg-gray-100/80 backdrop-blur-sm rounded-2xl px-4 py-3 border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <span className="material-symbols-outlined text-gray-400 mr-2">search</span>
            <input 
              type="text" 
              placeholder="ค้นหาสินค้า ร้านค้า หรือดีลพิเศษ..." 
              className="bg-transparent border-none focus:ring-0 text-sm flex-1 ml-1 placeholder-gray-400 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="flex items-center justify-center text-gray-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-xl">photo_camera</span>
            </button>
          </div>
          <button className="bg-primary/10 text-primary size-[48px] rounded-2xl flex items-center justify-center border border-primary/20 backdrop-blur-sm active:scale-90 transition-transform">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
      </div>

      {/* Hero Banner Slider */}
      <div className="px-4 py-2 relative">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-4"
        >
          {banners.map((banner) => (
            <div 
              key={banner.id} 
              className="relative min-w-full snap-center h-48 rounded-2xl overflow-hidden shadow-lg"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${banner.image})` }}
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${banner.color}`} />
              <div className="relative h-full flex flex-col justify-center p-6 gap-2">
                <h3 className="text-white text-xl font-black leading-tight drop-shadow-md">{banner.title}</h3>
                <p className="text-white/80 text-xs font-bold leading-snug max-w-[200px] drop-shadow-sm">{banner.subtitle}</p>
                <button className="mt-2 w-fit bg-primary text-dark-green text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                  {banner.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination Dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {banners.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1 rounded-full transition-all duration-300 ${currentBanner === idx ? 'w-6 bg-primary' : 'w-2 bg-gray-300'}`}
            />
          ))}
        </div>
      </div>

      {/* Membership Card */}
      <div className="px-4 pt-2">
        <div className="relative overflow-hidden bg-gradient-to-br from-dark-green to-[#1a331a] rounded-2xl p-6 shadow-xl aspect-[1.6/1] flex flex-col justify-between">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #13ec13 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-primary font-bold tracking-[0.2em] text-xs mb-1">JESPARK {user.tier.toUpperCase()}</p>
              <p className="text-white/60 text-[10px] tracking-widest uppercase">เป็นสมาชิกตั้งแต่ปี {user.memberSince}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg">
              <span className="material-symbols-outlined text-primary scale-125">contactless</span>
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-1">
              <p className="text-white text-4xl font-extrabold tracking-tight">{user.points.toLocaleString()}</p>
              <p className="text-primary text-sm font-bold">คะแนน</p>
            </div>
            <p className="text-white/80 text-sm font-medium mt-1">คะแนนสะสมคงเหลือ</p>
          </div>
          <div className="relative z-10 flex justify-between items-end mt-4">
            <p className="text-white/90 font-semibold tracking-wider uppercase">{user.name}</p>
            <button 
              onClick={() => navigate('/scan')}
              className="flex items-center gap-2 bg-primary px-4 py-2 rounded-lg text-dark-green font-bold text-sm shadow-lg"
            >
              <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
              <span>แสดงคิวอาร์</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-4 gap-3">
          <button onClick={() => navigate('/scan')} className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-sm active:scale-95 transition-transform">
            <div className="size-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-600 text-xl">qr_code_scanner</span>
            </div>
            <span className="text-[10px] font-black text-dark-green uppercase tracking-wide">Scan</span>
          </button>
          <button onClick={() => navigate('/rewards')} className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-sm active:scale-95 transition-transform">
            <div className="size-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-600 text-xl">card_giftcard</span>
            </div>
            <span className="text-[10px] font-black text-dark-green uppercase tracking-wide">Rewards</span>
          </button>
          <button onClick={() => navigate('/wallet')} className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-sm active:scale-95 transition-transform">
            <div className="size-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-600 text-xl">account_balance_wallet</span>
            </div>
            <span className="text-[10px] font-black text-dark-green uppercase tracking-wide">Wallet</span>
          </button>
          <button onClick={() => navigate('/stores')} className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-sm active:scale-95 transition-transform">
            <div className="size-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-600 text-xl">location_on</span>
            </div>
            <span className="text-[10px] font-black text-dark-green uppercase tracking-wide">Stores</span>
          </button>
        </div>
      </div>

      {/* Recommended Brands */}
      <div className="px-4 pt-2 pb-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-dark-green text-xl font-bold tracking-tight">แบรนด์แนะนำ</h2>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-5 pb-2">
          {recommendedBrands.map((brand) => (
            <div key={brand.id} className="flex flex-col items-center gap-2 shrink-0 active:scale-90 transition-transform cursor-pointer">
              <div className="size-16 rounded-full overflow-hidden border border-gray-100 shadow-sm bg-white/80 backdrop-blur-sm">
                <div 
                  className="size-full bg-center bg-no-repeat bg-cover" 
                  style={{ backgroundImage: `url(${brand.logo})` }}
                />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter whitespace-nowrap">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Deals */}
      <div className="flex justify-between items-center px-4 pt-6 pb-2">
        <h2 className="text-dark-green text-xl font-bold tracking-tight">ดีลล่าสุด</h2>
        <button onClick={() => navigate('/rewards')} className="text-primary text-sm font-bold">ดูทั้งหมด</button>
      </div>
      <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory">
        <div className="flex px-4 pt-2 gap-4 pb-4">
          {deals.map((deal) => (
            <div key={deal.id} className="flex flex-col gap-3 rounded-xl min-w-[280px] snap-center">
              <div 
                className="w-full bg-center bg-no-repeat aspect-[16/9] bg-cover rounded-xl shadow-md border border-gray-100 overflow-hidden" 
                style={{ backgroundImage: `url(${deal.image})` }}
              >
                <div className="p-3">
                  <span className="bg-primary text-dark-green text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">{deal.tag}</span>
                </div>
              </div>
              <div>
                <h4 className="text-dark-green text-base font-bold leading-tight">{deal.title}</h4>
                <p className="text-gray-500 text-sm font-medium mt-1">{deal.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special For You */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-dark-green text-xl font-bold tracking-tight">สิทธิพิเศษสำหรับคุณ</h2>
      </div>
      
      {loading ? (
        <div className="px-4 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 bg-white/40 backdrop-blur-md p-3 rounded-xl border border-white/50 shadow-sm">
              <div className="size-20 bg-gray-200 animate-pulse rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2" />
                <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="px-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
            <p className="text-red-600 text-sm font-medium mt-2">{error}</p>
            <p className="text-gray-500 text-xs mt-1">แสดงข้อมูลสำรองแทน</p>
          </div>
        </div>
      ) : null}

      <div className="px-4 space-y-4 mt-2">
        {rewards.slice(0, 3).map((offer) => (
          <div key={String(offer.id)} className="flex items-center gap-4 bg-white/40 backdrop-blur-md p-3 rounded-xl border border-white/50 shadow-sm">
            <div 
              className="size-20 bg-center bg-cover rounded-lg shrink-0 border border-gray-100 bg-gray-100" 
              style={{ backgroundImage: offer.image ? `url(${offer.image})` : undefined }}
            />
            <div className="flex-1">
              <p className="text-dark-green text-sm font-bold">{offer.title}</p>
              <p className="text-gray-500 text-xs font-medium">{offer.description}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-primary font-bold text-sm">{offer.points} คะแนน</span>
                <button 
                  onClick={() => navigate('/rewards')}
                  className="bg-dark-green text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                  แลกคะแนน
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;