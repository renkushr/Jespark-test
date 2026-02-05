interface HeaderProps {
  onLogout: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Jespark Admin</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหา..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400">
              search
            </span>
          </div>
          
          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-semibold">Admin User</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
            title="Logout"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
