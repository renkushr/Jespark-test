
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Deal, Reward } from '../types';
import apiClient from '../src/api/client';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

interface HomeProps {
  user: User;
}

interface ApiBanner {
  id: number; title: string; subtitle: string; image_url: string;
  button_text: string; link_type: string; gradient_color: string;
}
interface ApiBrand {
  id: number; name: string; logo_url: string; link_url: string;
}
interface ApiDeal {
  id: number; title: string; subtitle: string; tag: string;
  image_url: string; link_url: string;
}

const FALLBACK_BANNERS = [
  { id: 0, title: 'Double Points Weekend', subtitle: 'รับคะแนนคูณ 2 ทุกการสั่งซื้อ', image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1200', button_text: 'ดูรายละเอียด', link_type: 'rewards', gradient_color: 'from-dark-green/90 to-transparent' },
];
const FALLBACK_BRANDS: ApiBrand[] = [];
const FALLBACK_DEALS: ApiDeal[] = [];

const Home: React.FC<HomeProps> = ({ user }) => {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [banners, setBanners] = useState<ApiBanner[]>(FALLBACK_BANNERS);
  const [recommendedBrands, setRecommendedBrands] = useState<ApiBrand[]>(FALLBACK_BRANDS);
  const [deals, setDeals] = useState<ApiDeal[]>(FALLBACK_DEALS);

  const handleScroll = () => {
    if (scrollRef.current) {
      const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.offsetWidth);
      setCurrentBanner(index);
    }
  };

  const navTo = (linkType: string) => {
    const map: Record<string, string> = { rewards: '/rewards', stores: '/stores', wallet: '/wallet', scan: '/scan' };
    navigate(map[linkType] || '/rewards');
  };

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [bRes, brRes, dRes] = await Promise.all([
          fetch(`${API_BASE}/content/banners`).then(r => r.json()).catch(() => ({ banners: [] })),
          fetch(`${API_BASE}/content/brands`).then(r => r.json()).catch(() => ({ brands: [] })),
          fetch(`${API_BASE}/content/deals`).then(r => r.json()).catch(() => ({ deals: [] })),
        ]);
        if (bRes.banners?.length) setBanners(bRes.banners);
        if (brRes.brands?.length) setRecommendedBrands(brRes.brands);
        if (dRes.deals?.length) setDeals(dRes.deals);
      } catch (e) {
        console.error('Failed to load content:', e);
      }
    };
    loadContent();
  }, []);

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
            <button type="button" onClick={() => navigate('/scan')} className="flex items-center justify-center text-gray-400 hover:text-primary transition-colors">
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
                style={{ backgroundImage: `url(${banner.image_url})` }}
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient_color}`} />
              <div className="relative h-full flex flex-col justify-center p-6 gap-2">
                <h3 className="text-white text-xl font-black leading-tight drop-shadow-md">{banner.title}</h3>
                <p className="text-white/80 text-xs font-bold leading-snug max-w-[200px] drop-shadow-sm">{banner.subtitle}</p>
                <button 
                  onClick={() => navTo(banner.link_type)}
                  className="mt-2 w-fit bg-primary text-dark-green text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                >
                  {banner.button_text}
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
      {recommendedBrands.length > 0 && (
      <div className="px-4 pt-2 pb-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-dark-green text-xl font-bold tracking-tight">แบรนด์แนะนำ</h2>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-5 pb-2">
          {recommendedBrands.map((brand) => (
            <div key={brand.id} role="button" tabIndex={0} onClick={() => navigate(brand.link_url || '/rewards')} onKeyDown={(e) => e.key === 'Enter' && navigate(brand.link_url || '/rewards')} className="flex flex-col items-center gap-2 shrink-0 active:scale-90 transition-transform cursor-pointer">
              <div className="size-16 rounded-full overflow-hidden border border-gray-100 shadow-sm bg-white/80 backdrop-blur-sm">
                <div 
                  className="size-full bg-center bg-no-repeat bg-cover" 
                  style={{ backgroundImage: `url(${brand.logo_url})` }}
                />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter whitespace-nowrap">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Latest Deals */}
      {deals.length > 0 && (
      <>
      <div className="flex justify-between items-center px-4 pt-6 pb-2">
        <h2 className="text-dark-green text-xl font-bold tracking-tight">ดีลล่าสุด</h2>
        <button onClick={() => navigate('/rewards')} className="text-primary text-sm font-bold">ดูทั้งหมด</button>
      </div>
      <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory">
        <div className="flex px-4 pt-2 gap-4 pb-4">
          {deals.map((deal) => (
            <div key={deal.id} role="button" tabIndex={0} onClick={() => navigate(deal.link_url || '/rewards')} onKeyDown={(e) => e.key === 'Enter' && navigate(deal.link_url || '/rewards')} className="flex flex-col gap-3 rounded-xl min-w-[280px] snap-center cursor-pointer">
              <div 
                className="w-full bg-center bg-no-repeat aspect-[16/9] bg-cover rounded-xl shadow-md border border-gray-100 overflow-hidden" 
                style={{ backgroundImage: `url(${deal.image_url})` }}
              >
                {deal.tag && (
                  <div className="p-3">
                    <span className="bg-primary text-dark-green text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">{deal.tag}</span>
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-dark-green text-base font-bold leading-tight">{deal.title}</h4>
                <p className="text-gray-500 text-sm font-medium mt-1">{deal.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      </>
      )}

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