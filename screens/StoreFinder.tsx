
import React from 'react';
import { useNavigate } from 'react-router-dom';

const StoreFinder: React.FC = () => {
  const navigate = useNavigate();

  const stores = [
    { id: 1, name: 'Jespark Central Plaza', dist: '0.8km', addr: '123 Market Street, Downtown', status: 'Open', closing: '10:00 PM', primary: true },
    { id: 2, name: 'Jespark Westside', dist: '2.4km', addr: '456 West Avenue, District 4', status: 'Closes Soon', closing: '9:00 PM' },
    { id: 3, name: 'Jespark North Hub', dist: '5.1km', addr: '789 North Boulevard', status: 'Closed', next: '8:00 AM Tomorrow' }
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100 animate-fade-in overflow-hidden relative">
      {/* Search Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-10 pb-4 bg-gradient-to-b from-white via-white/80 to-transparent">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="bg-white p-2.5 rounded-full shadow-lg text-dark-green active:scale-90 transition-transform">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1 bg-white shadow-xl rounded-full flex items-center px-4 py-3 border border-gray-100">
            <span className="material-symbols-outlined text-gray-400">search</span>
            <input className="bg-transparent border-none focus:ring-0 text-sm flex-1 ml-2 placeholder-gray-400" placeholder="Search stores..." />
            <div className="border-l border-gray-200 pl-3 ml-2">
              <span className="material-symbols-outlined text-primary">tune</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar py-1">
          {['Open Now', 'Drive-thru', '24/7', 'Parking'].map((f, i) => (
            <button key={f} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-md ${i === 0 ? 'bg-dark-green text-primary' : 'bg-white text-gray-500'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Simulated Map Background */}
      <div className="flex-1 bg-[#e2e4e7] relative overflow-hidden">
        {/* Map Grid Patterns */}
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 2px, transparent 2px), linear-gradient(90deg, #fff 2px, transparent 2px)', backgroundSize: '60px 60px' }}></div>
        <div className="absolute top-[20%] left-[-10%] w-64 h-64 bg-green-200/40 rounded-full blur-3xl"></div>
        <div className="absolute top-[40%] left-[60%] -translate-x-1/2 -translate-y-full flex flex-col items-center animate-bounce">
           <div className="bg-white px-3 py-1.5 rounded-xl mb-1 shadow-2xl flex items-center gap-1 border border-primary/20">
              <span className="text-[10px] font-black">Central Plaza</span>
              <span className="material-symbols-outlined text-[12px] text-orange-400">star</span>
              <span className="text-[10px] font-bold">4.8</span>
           </div>
           <div className="relative">
             <span className="material-symbols-outlined text-5xl text-primary drop-shadow-lg" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
             <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white rounded-full p-[2px] shadow-inner">
               <span className="material-symbols-outlined text-sm text-dark-green font-bold">storefront</span>
             </div>
           </div>
        </div>
        <div className="absolute top-[30%] left-[20%] -translate-x-1/2 -translate-y-full">
           <span className="material-symbols-outlined text-4xl text-dark-green/30" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
        </div>
        <div className="absolute top-[60%] left-[80%] -translate-x-1/2 -translate-y-full">
           <span className="material-symbols-outlined text-4xl text-dark-green/30" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
        </div>
      </div>

      {/* Bottom Sheet List */}
      <div className="bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] h-[42vh] flex flex-col z-30">
        <div className="w-full flex justify-center py-4 shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full"></div>
        </div>
        <div className="px-6 pb-4 flex justify-between items-end shrink-0">
           <div>
             <h3 className="text-xl font-black tracking-tight">Nearby Stores</h3>
             <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">3 locations nearby</p>
           </div>
           <button className="text-primary text-[10px] font-black uppercase tracking-widest mb-1">View List</button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 space-y-4 pb-12 no-scrollbar">
           {stores.map(store => (
             <div key={store.id} className={`p-5 rounded-2xl border-2 transition-all ${store.primary ? 'bg-white border-primary shadow-lg shadow-primary/5' : 'bg-transparent border-gray-100 opacity-80'}`}>
                <div className="flex gap-4">
                  <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${store.primary ? 'bg-primary text-dark-green' : 'bg-gray-100 text-gray-400'}`}>
                    <span className="material-symbols-outlined">{store.status === 'Closed' ? 'store' : 'storefront'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-base truncate">{store.name}</h4>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${store.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{store.status}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 truncate">{store.addr} • {store.dist}</p>
                    <div className="flex gap-2 mt-4">
                      {store.primary ? (
                        <>
                          <button className="flex-1 bg-dark-green text-white text-[11px] font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg">
                            <span className="material-symbols-outlined text-sm">directions</span>
                            Directions
                          </button>
                          <button className="size-11 rounded-xl bg-gray-100 flex items-center justify-center text-dark-green">
                            <span className="material-symbols-outlined">call</span>
                          </button>
                        </>
                      ) : (
                        <button className="w-full bg-gray-50 border border-gray-100 py-2.5 rounded-xl text-xs font-bold">View Details</button>
                      )}
                    </div>
                  </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default StoreFinder;