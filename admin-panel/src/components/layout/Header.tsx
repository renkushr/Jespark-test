interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 lg:ml-72">
      <div className="flex items-center justify-between h-full">
        {/* Left: hamburger + search */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="p-2 hover:bg-slate-100 rounded-lg lg:hidden transition-colors">
            <span className="material-symbols-outlined text-slate-600">menu</span>
          </button>
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input
              type="text"
              placeholder="ค้นหา..."
              className="pl-10 pr-4 py-2 w-64 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {/* Mobile search */}
          <button className="p-2 hover:bg-slate-100 rounded-lg sm:hidden transition-colors">
            <span className="material-symbols-outlined text-slate-500 text-[22px]">search</span>
          </button>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-slate-500 text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-white"></span>
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block" />

          {/* User */}
          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-black">
              A
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">Admin</p>
              <p className="text-[10px] font-medium text-slate-400">Super Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
