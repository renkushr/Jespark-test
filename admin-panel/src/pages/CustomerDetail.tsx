import { useParams, useNavigate } from 'react-router-dom';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/customers')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-800">รายละเอียดลูกค้า</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-white text-5xl">person</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">John Doe</h2>
              <p className="text-gray-500 text-sm">JES-2026-000001</p>
              <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-800 text-sm font-semibold rounded-full">
                Silver Member
              </span>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-gray-400">email</span>
                <span className="text-gray-700">john@example.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-gray-400">phone</span>
                <span className="text-gray-700">081-234-5678</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-gray-400">calendar_today</span>
                <span className="text-gray-700">สมัคร: 1 ม.ค. 2026</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">คะแนนปัจจุบัน</span>
                <span className="text-2xl font-bold text-primary">1,500</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">ยอดซื้อรวม</span>
                <span className="text-lg font-semibold text-gray-800">฿15,000</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark-green transition-colors">
                เพิ่มคะแนน
              </button>
              <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                แก้ไข
              </button>
            </div>
          </div>
        </div>

        {/* Activity Tabs */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button className="px-6 py-4 border-b-2 border-primary text-primary font-medium">
                  ประวัติการซื้อ
                </button>
                <button className="px-6 py-4 text-gray-500 hover:text-gray-700">
                  ประวัติคะแนน
                </button>
                <button className="px-6 py-4 text-gray-500 hover:text-gray-700">
                  การแลกของรางวัล
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-white">shopping_cart</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">ซื้อสินค้า</p>
                        <p className="text-sm text-gray-500">5 ก.พ. 2026, 14:30</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">฿1,250</p>
                      <p className="text-sm text-green-600">+125 คะแนน</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
