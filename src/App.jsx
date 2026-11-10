import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, deleteDoc, onSnapshot, collection } from 'firebase/firestore';

// ==========================================
// FIREBASE CLIENT INITIALIZATION
// ==========================================
let firebaseConfig = {};

try {
  // Mendukung Vercel ENV (Berdasarkan panduan Firebase terbaru)
  if (typeof __firebase_config !== 'undefined') {
    firebaseConfig = JSON.parse(__firebase_config);
  } else {
    firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
  }
} catch (e) {
  console.error("Gagal membaca konfigurasi Firebase");
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'kafe-jeda-prod';

// --- ICONS (Lucide equivalents) ---
const Icons = {
  Home: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Grid: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>,
  Bell: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  Coffee: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>,
  QrCode: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>,
  Receipt: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17V7"/></svg>,
  Chart: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
  Settings: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  Menu: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
  X: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  Plus: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  Minus: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14"/></svg>,
  Trash: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  ShoppingCart: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>,
  Check: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 6 9 17l-5-5"/></svg>,
  Printer: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>,
  Clock: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Refresh: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
};

// --- UTILS ---
const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

// --- GLOBAL STYLES (Print) ---
const GlobalStyles = () => (
  <style>{`
    @media print {
      body * { visibility: hidden; }
      #printable-receipt, #printable-receipt * { visibility: visible; }
      #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 10px; font-family: monospace; }
      .no-print { display: none !important; }
    }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

const Button = ({ children, onClick, variant = 'primary', className = '', disabled=false, type="button" }) => {
  const base = "px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#4a3b32] text-white hover:bg-[#3e2723]",
    secondary: "bg-[#eaddd7] text-[#4a3b32] hover:bg-[#d7ccc8]",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border-2 border-[#4a3b32] text-[#4a3b32] hover:bg-[#f5f0eb]",
    ghost: "bg-transparent text-stone-600 hover:bg-stone-100",
  };
  return <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 no-print">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
          <h3 className="font-bold text-lg text-stone-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors"><Icons.X size={20}/></button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
};


// ==========================================
// MAIN APPLICATION
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('kafeJedaSettings');
    return saved ? JSON.parse(saved) : {
      name: 'KAFE JEDA', address: 'Jl. Kopi Kenangan No. 123, Jakarta', phone: '0812-3456-7890',
      taxRate: 10, serviceCharge: 5, isOpen: true
    };
  });
  
  const [view, setView] = useState('dashboard');
  const [customerToken, setCustomerToken] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [receiptToPrint, setReceiptToPrint] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const confirmAction = (title, msg, onConfirm) => {
    setConfirmDialog({ title, msg, onConfirm });
  };

  // 1. Inisialisasi Firebase Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Gagal Authentikasi Firebase:", error);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Listener Database (Realtime Sync Firebase)
  useEffect(() => {
    if (!user) return;
    setIsLoading(true);

    const unsubProducts = onSnapshot(
      collection(db, 'artifacts', appId, 'public', 'data', 'products'),
      (snap) => setProducts(snap.docs.map(d => ({id: d.id, ...d.data()}))),
      (error) => console.error("Error products:", error)
    );

    const unsubTables = onSnapshot(
      collection(db, 'artifacts', appId, 'public', 'data', 'tables'),
      (snap) => setTables(snap.docs.map(d => ({id: d.id, ...d.data()}))),
      (error) => console.error("Error tables:", error)
    );

    const unsubOrders = onSnapshot(
      collection(db, 'artifacts', appId, 'public', 'data', 'orders'),
      (snap) => {
        const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
        // Sortir di memori karena Firebase butuh indeks kompleks untuk query
        data.sort((a, b) => new Date(b.time) - new Date(a.time));
        setOrders(data);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error orders:", error);
        setIsLoading(false);
      }
    );

    return () => { unsubProducts(); unsubTables(); unsubOrders(); };
  }, [user]);

  // Cek token meja (Customer Mode)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('meja');
    if (token) setCustomerToken(token);
  }, []);

  useEffect(() => {
    localStorage.setItem('kafeJedaSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (receiptToPrint) {
      setTimeout(() => { window.print(); setReceiptToPrint(null); }, 300);
    }
  }, [receiptToPrint]);

  // --- CUSTOMER MODE ---
  if (customerToken) {
    if (isLoading) return <div className="h-screen flex items-center justify-center font-bold">Memuat Menu...</div>;

    const table = tables.find(t => t.token === customerToken);
    if (!table || !table.active) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-stone-100 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-sm w-full">
            <Icons.X size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-stone-800 mb-2">QR Tidak Valid</h2>
            <p className="text-stone-500 mb-6">QR Code ini tidak dikenali atau meja sedang tidak aktif.</p>
            <Button onClick={() => setCustomerToken(null)} className="w-full">Kembali ke Kasir</Button>
          </div>
        </div>
      );
    }

    return (
      <CustomerApp 
        table={table} products={products} settings={settings} orders={orders} user={user}
        onSubmitOrder={async (newOrder) => {
          if(!user) return;
          try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', newOrder.id), newOrder);
            showToast('Pesanan berhasil dikirim ke dapur!', 'success');
          } catch (e) {
            showToast('Gagal mengirim pesanan: ' + e.message, 'error');
          }
        }}
        onExit={() => setCustomerToken(null)} 
      />
    );
  }

  // --- CASHIER MODE ---
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  if (isLoading) {
    return <div className="h-screen flex flex-col items-center justify-center bg-[#f5f0eb] font-bold text-[#4a3b32]"><Icons.Refresh size={48} className="animate-spin mb-4" /> Memuat Sistem Kafe Jeda...</div>;
  }

  return (
    <div className="flex h-screen bg-[#f5f0eb] font-sans text-stone-800 overflow-hidden">
      <GlobalStyles />

      {/* --- SIDEBAR --- */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#3e2723] text-stone-300 transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 no-print`}>
        <div className="p-5 flex items-center justify-between border-b border-[#5a4238]">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{settings.name}</h1>
            <p className="text-xs text-[#a89b94]">Kasir & Manajemen</p>
          </div>
          <button className="md:hidden text-stone-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <Icons.X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Icons.Home },
            { id: 'pos', label: 'Kasir / POS', icon: Icons.Grid },
            { id: 'orders', label: 'Pesanan Masuk', icon: Icons.Bell, badge: pendingOrdersCount },
            { id: 'menu', label: 'Menu Produk', icon: Icons.Coffee },
            { id: 'tables', label: 'Meja & QR', icon: Icons.QrCode },
            { id: 'transactions', label: 'Transaksi', icon: Icons.Receipt },
            { id: 'reports', label: 'Laporan', icon: Icons.Chart },
            { id: 'settings', label: 'Pengaturan', icon: Icons.Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all ${
                view === item.id 
                  ? 'bg-[#eaddd7] text-[#3e2723] font-semibold shadow-sm' 
                  : 'hover:bg-[#5a4238] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className={view === item.id ? 'text-[#3e2723]' : 'text-[#a89b94]'} />
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* --- OVERLAY MOBILE --- */}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden no-print" onClick={() => setIsMobileMenuOpen(false)}></div>}

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative no-print">
        <header className="bg-white px-4 py-3 shadow-sm flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg" onClick={() => setIsMobileMenuOpen(true)}>
              <Icons.Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-stone-800 capitalize tracking-tight">
              {view === 'pos' ? 'Point of Sale' : view.replace('-', ' ')}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-stone-800">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${settings.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {settings.isOpen ? 'Toko Buka' : 'Toko Tutup'}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-stone-50">
          <div className="p-4 md:p-6 h-full max-w-7xl mx-auto">
            {view === 'dashboard' && <ViewDashboard orders={orders} products={products} />}
            {view === 'pos' && <ViewPOS products={products} tables={tables} settings={settings} user={user} showToast={showToast} setReceiptToPrint={setReceiptToPrint} />}
            {view === 'orders' && <ViewOrders orders={orders} user={user} showToast={showToast} setReceiptToPrint={setReceiptToPrint} />}
            {view === 'menu' && <ViewMenu products={products} user={user} confirmAction={confirmAction} showToast={showToast} />}
            {view === 'tables' && <ViewTables tables={tables} user={user} confirmAction={confirmAction} showToast={showToast} simulateScan={(token) => setCustomerToken(token)} />}
            {view === 'transactions' && <ViewTransactions orders={orders} setReceiptToPrint={setReceiptToPrint} />}
            {view === 'reports' && <ViewReports orders={orders} />}
            {view === 'settings' && <ViewSettings settings={settings} setSettings={setSettings} showToast={showToast} />}
          </div>
        </main>
      </div>

      {/* --- GLOBAL UI ELEMENTS --- */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-xl shadow-lg font-medium animate-in slide-in-from-bottom-5 z-[200] no-print flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-stone-800 text-white'
        }`}>
          {toast.type === 'success' && <Icons.Check size={18} />}
          {toast.msg}
        </div>
      )}

      <Modal isOpen={!!confirmDialog} onClose={() => setConfirmDialog(null)} title={confirmDialog?.title || 'Konfirmasi'}>
        <p className="text-stone-600 mb-6">{confirmDialog?.msg}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setConfirmDialog(null)}>Batal</Button>
          <Button variant="primary" onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }}>Ya, Lanjutkan</Button>
        </div>
      </Modal>

      <div id="printable-receipt" className="hidden">
        {receiptToPrint && <PrintableReceipt order={receiptToPrint} settings={settings} tables={tables} />}
      </div>
    </div>
  );
}

// ==========================================
// VIEWS (CASHIER MODE)
// ==========================================

const ViewDashboard = ({ orders, products }) => {
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.time.startsWith(today) && o.status !== 'cancelled');
  const revenueToday = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const processingOrders = orders.filter(o => o.status === 'processing' || o.status === 'ready');

  const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
      <div className={`p-4 rounded-xl ${colorClass}`}><Icon size={28} /></div>
      <div>
        <p className="text-sm font-medium text-stone-500">{title}</p>
        <h3 className="text-2xl font-bold text-stone-800">{value}</h3>
        {subtitle && <p className="text-xs text-stone-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pendapatan Hari Ini" value={formatCurrency(revenueToday)} subtitle={`${todayOrders.length} transaksi selesai`} icon={Icons.Receipt} colorClass="bg-green-100 text-green-700" />
        <StatCard title="Pesanan Baru (QR)" value={pendingOrders.length} subtitle="Perlu diproses segera" icon={Icons.Bell} colorClass="bg-amber-100 text-amber-700" />
        <StatCard title="Sedang Diproses" value={processingOrders.length} subtitle="Di dapur / bar" icon={Icons.Clock} colorClass="bg-blue-100 text-blue-700" />
        <StatCard title="Total Menu Aktif" value={products.filter(p=>p.available).length} subtitle="Siap dipesan" icon={Icons.Coffee} colorClass="bg-purple-100 text-purple-700" />
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 max-w-3xl">
        <h3 className="text-lg font-bold text-stone-800 mb-4">Pesanan Terbaru</h3>
        <div className="space-y-3">
          {orders.slice(0, 5).map(order => (
            <div key={order.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border">
              <div>
                <p className="font-semibold text-sm">{order.id} <span className="text-stone-400 font-normal">({order.type.toUpperCase()})</span></p>
                <p className="text-xs text-stone-500">{new Date(order.time).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} - {order.items.length} item</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-[#4a3b32]">{formatCurrency(order.total)}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                  order.status === 'completed' ? 'bg-green-100 text-green-700' :
                  order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>{order.status}</span>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-center text-stone-500 text-sm py-4">Belum ada pesanan masuk di database.</p>}
        </div>
      </div>
    </div>
  );
};

const ViewPOS = ({ products, tables, settings, user, showToast, setReceiptToPrint }) => {
  const [cart, setCart] = useState([]);
  const [activeCat, setActiveCat] = useState('Semua');
  const [orderType, setOrderType] = useState('dine-in');
  const [selectedTable, setSelectedTable] = useState('');
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cashGiven, setCashGiven] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const categories = ['Semua', ...new Set(products.map(p => p.category))];
  const activeProducts = products.filter(p => p.available && (activeCat === 'Semua' || p.category === activeCat));

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = subtotal * (settings.taxRate / 100);
  const service = orderType === 'dine-in' ? subtotal * (settings.serviceCharge / 100) : 0;
  const total = subtotal + tax + service;

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? {...i, qty: i.qty + 1} : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = i.qty + delta;
        return newQty > 0 ? {...i, qty: newQty} : i;
      }
      return i;
    }).filter(i => i.qty > 0));
  };

  const processPayment = async () => {
    if (!user) return showToast('Error auth', 'error');
    if (orderType === 'dine-in' && !selectedTable) {
      showToast('Pilih meja terlebih dahulu', 'error'); return;
    }
    const cashValue = parseInt(cashGiven.replace(/\D/g, '')) || 0;
    if (paymentMethod === 'Cash' && cashValue < total) {
      showToast('Nominal uang tunai kurang', 'error'); return;
    }

    setIsProcessing(true);
    const newOrder = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      tableId: orderType === 'dine-in' ? selectedTable : null,
      type: orderType,
      status: 'completed',
      items: cart,
      subtotal, tax, service, total,
      time: new Date().toISOString(),
      paymentMethod,
      paymentStatus: 'paid',
      cashReceived: paymentMethod === 'Cash' ? cashValue : null,
      change: paymentMethod === 'Cash' ? cashValue - total : 0
    };

    try {
      await setDoc(doc(getFirestore(), 'artifacts', typeof __app_id !== 'undefined' ? __app_id : 'kafe-jeda-prod', 'public', 'data', 'orders', newOrder.id), newOrder);
      showToast('Transaksi berhasil disimpan (Firebase)!', 'success');
      setReceiptToPrint(newOrder);
      setCart([]); setSelectedTable(''); setCashGiven(''); setIsPaymentModalOpen(false);
    } catch (e) {
      showToast('Gagal menyimpan transaksi: ' + e.message, 'error');
    }
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 overflow-hidden -m-4 md:-m-6 p-4 md:p-6">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col h-full bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-3 border-b flex gap-2 overflow-x-auto scrollbar-hide bg-stone-50">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCat(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-colors ${activeCat === cat ? 'bg-[#4a3b32] text-white' : 'bg-white text-stone-600 border hover:bg-stone-100'}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 bg-stone-100/50">
          {activeProducts.map(p => (
            <div key={p.id} onClick={() => addToCart(p)} className="bg-white rounded-xl shadow-sm hover:shadow-md cursor-pointer overflow-hidden border border-stone-100 flex flex-col group active:scale-95 transition-transform">
              <div className="h-32 bg-stone-200 relative overflow-hidden flex items-center justify-center">
                {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" /> : <Icons.Coffee size={40} className="text-stone-400 opacity-50"/>}
                <div className="absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded text-xs font-bold text-[#4a3b32]">{p.category}</div>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h4 className="font-bold text-stone-800 text-sm leading-tight mb-1">{p.name}</h4>
                <p className="text-[#d97706] font-bold mt-auto text-sm">{formatCurrency(p.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-stone-100 flex flex-col h-[50vh] lg:h-full shrink-0">
        <div className="p-4 border-b bg-stone-50 rounded-t-2xl flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2"><Icons.ShoppingCart size={20}/> Keranjang</h3>
          {cart.length > 0 && <button onClick={() => setCart([])} className="text-xs text-red-500 hover:underline">Kosongkan</button>}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 opacity-50">
              <Icons.ShoppingCart size={48} className="mb-2" />
              <p>Keranjang kosong</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b border-stone-100 pb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-stone-800">{item.name}</h4>
                  <p className="text-xs text-stone-500">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-3 bg-stone-100 rounded-lg p-1">
                  <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-white rounded text-stone-600"><Icons.Minus size={16}/></button>
                  <span className="font-bold w-4 text-center text-sm">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-white rounded text-stone-600"><Icons.Plus size={16}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-stone-50 rounded-b-2xl">
          <div className="flex gap-2 mb-4">
             <button onClick={() => setOrderType('dine-in')} className={`flex-1 py-2 text-sm font-bold rounded-lg border ${orderType === 'dine-in' ? 'bg-[#4a3b32] text-white border-[#4a3b32]' : 'bg-white text-stone-600'}`}>Dine In</button>
             <button onClick={() => setOrderType('takeaway')} className={`flex-1 py-2 text-sm font-bold rounded-lg border ${orderType === 'takeaway' ? 'bg-[#4a3b32] text-white border-[#4a3b32]' : 'bg-white text-stone-600'}`}>Take Away</button>
          </div>
          {orderType === 'dine-in' && (
            <div className="mb-4">
              <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)} className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-sm font-medium outline-none focus:border-[#4a3b32]">
                <option value="">-- Pilih Meja --</option>
                {tables.filter(t => t.active).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
          <div className="space-y-1 mb-4 text-sm text-stone-600">
            <div className="flex justify-between font-bold text-lg text-stone-800 border-t pt-2 mt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>
          </div>
          <Button className="w-full py-3 text-lg" disabled={cart.length === 0} onClick={() => setIsPaymentModalOpen(true)}>Bayar Sekarang</Button>
        </div>
      </div>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Proses Pembayaran">
        <div className="text-center mb-6">
          <p className="text-sm text-stone-500">Total Pembayaran</p>
          <p className="text-4xl font-bold text-[#4a3b32]">{formatCurrency(total)}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          {['Cash', 'QRIS'].map(method => (
            <button key={method} onClick={() => setPaymentMethod(method)} className={`p-3 rounded-xl border-2 font-bold transition-all ${paymentMethod === method ? 'border-[#4a3b32] bg-[#4a3b32]/10 text-[#4a3b32]' : 'border-stone-200 text-stone-500'}`}>
              {method}
            </button>
          ))}
        </div>

        {paymentMethod === 'Cash' && (
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Uang Diterima</label>
              <input type="text" value={cashGiven} onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setCashGiven(val ? formatCurrency(parseInt(val)).replace('Rp', '').trim() : '');
              }} className="w-full p-3 text-lg font-bold text-right border rounded-xl outline-none focus:border-[#4a3b32]" placeholder="0" />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
               {[50000, 100000, total].map(nom => (
                 <button key={nom} onClick={() => setCashGiven(formatCurrency(nom).replace('Rp', '').trim())} className="px-3 py-1.5 bg-stone-100 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-stone-200">
                   {nom === total ? 'Uang Pas' : formatCurrency(nom)}
                 </button>
               ))}
            </div>

            <div className="bg-stone-50 p-4 rounded-xl flex justify-between items-center border">
              <span className="font-medium text-stone-600">Kembalian</span>
              <span className={`text-xl font-bold ${parseInt(cashGiven.replace(/\D/g, '')) - total >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {cashGiven ? formatCurrency(Math.max(0, parseInt(cashGiven.replace(/\D/g, '')) - total)) : 'Rp 0'}
              </span>
            </div>
          </div>
        )}

        <Button className="w-full py-4 text-lg" disabled={isProcessing} onClick={processPayment}>
          {isProcessing ? 'Memproses...' : <><Icons.Check size={20} /> Selesaikan Transaksi</>}
        </Button>
      </Modal>
    </div>
  );
};

const ViewOrders = ({ orders, user, showToast, setReceiptToPrint }) => {
  const activeOrders = orders.filter(o => ['pending', 'processing', 'ready'].includes(o.status));

  const updateStatus = async (id, newStatus, extraData = {}) => {
    if (!user) return;
    try {
      const db = getFirestore();
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'kafe-jeda-prod';
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', id), { status: newStatus, ...extraData }, { merge: true });
      showToast(`Pesanan diperbarui menjadi ${newStatus}`, 'success');
    } catch (e) {
      showToast('Gagal update status: ' + e.message, 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-6">
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border font-bold text-sm flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Menunggu ({activeOrders.filter(o=>o.status==='pending').length})</div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border font-bold text-sm flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Diproses ({activeOrders.filter(o=>o.status==='processing').length})</div>
      </div>

      {activeOrders.length === 0 ? (
         <div className="bg-white p-12 rounded-2xl shadow-sm border text-center text-stone-500">
           <Icons.Bell size={48} className="mx-auto mb-4 opacity-50" />
           <p className="text-lg">Belum ada pesanan aktif saat ini.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeOrders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
              <div className="p-4 border-b bg-stone-50 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-stone-800">{order.id}</h3>
                  <p className="text-xs font-semibold text-stone-600 bg-stone-200 px-2 py-0.5 rounded inline-block mt-1">
                    {order.type === 'qr' ? 'QR Code' : 'Dine In'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-[#4a3b32]">{order.tableId ? `Meja ${order.tableId.replace('t', '0')}` : '-'}</p>
                </div>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto max-h-60 bg-stone-50/50">
                <ul className="space-y-2">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex justify-between text-sm border-b border-stone-100 pb-2">
                      <div><span className="font-bold mr-2">{item.qty}x</span> {item.name}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 border-t bg-white">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-stone-500">Total Tagihan</span>
                  <span className="font-bold text-lg">{formatCurrency(order.total)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {order.status === 'pending' && (
                    <>
                      <Button variant="danger" onClick={() => updateStatus(order.id, 'cancelled')}>Tolak</Button>
                      <Button variant="primary" onClick={() => updateStatus(order.id, 'processing')}>Terima & Proses</Button>
                    </>
                  )}
                  {order.status === 'processing' && (
                    <Button variant="primary" className="col-span-2" onClick={() => updateStatus(order.id, 'ready')}>Siap Saji</Button>
                  )}
                  {order.status === 'ready' && (
                    <Button variant="outline" className="col-span-2" onClick={() => {
                        updateStatus(order.id, 'completed', { paymentStatus: 'paid', paymentMethod: 'Kasir QR' }); 
                        setReceiptToPrint({...order, paymentStatus: 'paid', paymentMethod: 'Kasir QR'});
                    }}>Bayar & Selesai</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ViewMenu = ({ products, user, confirmAction, showToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return showToast('Error Auth', 'error');
    setIsSaving(true);
    
    const formData = new FormData(e.target);
    const newId = editItem ? editItem.id : `p${Date.now()}`;
    const productData = {
      id: newId,
      name: formData.get('name'),
      category: formData.get('category'),
      price: parseInt(formData.get('price')),
      available: formData.get('available') === 'on',
      image: formData.get('image') || null,
      desc: formData.get('desc'),
    };

    try {
      const db = getFirestore();
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'kafe-jeda-prod';
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', newId), productData);
      showToast('Menu berhasil disimpan (Firebase)', 'success');
      setIsModalOpen(false);
    } catch (e) {
      showToast('Gagal menyimpan: ' + e.message, 'error');
    }
    setIsSaving(false);
  };

  const handleDelete = (id) => {
    confirmAction('Hapus Menu', 'Yakin ingin menghapus menu ini dari database?', async () => {
      if(!user) return;
      try {
        const db = getFirestore();
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'kafe-jeda-prod';
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id));
        showToast('Menu dihapus', 'success');
      } catch(e) {
        showToast('Gagal menghapus: ' + e.message, 'error');
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center bg-stone-50">
        <h3 className="font-bold text-lg">Daftar Menu (Database)</h3>
        <Button onClick={() => { setEditItem(null); setIsModalOpen(true); }}><Icons.Plus size={18}/> Tambah Menu</Button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-stone-100 text-stone-600 sticky top-0">
            <tr>
              <th className="p-4 font-semibold">Produk</th>
              <th className="p-4 font-semibold">Kategori</th>
              <th className="p-4 font-semibold">Harga</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-stone-200 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                    {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <Icons.Coffee className="text-stone-400 opacity-50" />}
                  </div>
                  <div>
                    <p className="font-bold text-stone-800">{p.name}</p>
                    <p className="text-xs text-stone-500 truncate max-w-[200px]">{p.desc}</p>
                  </div>
                </td>
                <td className="p-4">{p.category}</td>
                <td className="p-4 font-semibold text-[#d97706]">{formatCurrency(p.price)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.available ? 'Tersedia' : 'Habis'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => { setEditItem(p); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-2">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Icons.Trash size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit Menu' : 'Tambah Menu Baru'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Produk</label>
            <input name="name" defaultValue={editItem?.name} required className="w-full p-2.5 border rounded-lg outline-none focus:border-[#4a3b32]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <input name="category" defaultValue={editItem?.category || 'Kopi'} required className="w-full p-2.5 border rounded-lg outline-none focus:border-[#4a3b32]" placeholder="Kopi, Snack, dll" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Harga (Rp)</label>
              <input name="price" type="number" defaultValue={editItem?.price} required className="w-full p-2.5 border rounded-lg outline-none focus:border-[#4a3b32]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL Gambar (Opsional)</label>
            <input name="image" defaultValue={editItem?.image} className="w-full p-2.5 border rounded-lg outline-none focus:border-[#4a3b32]" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi Singkat</label>
            <textarea name="desc" defaultValue={editItem?.desc} className="w-full p-2.5 border rounded-lg outline-none focus:border-[#4a3b32]" rows="2"></textarea>
          </div>
          <div className="flex items-center gap-2">
            <input name="available" type="checkbox" id="avail" defaultChecked={editItem ? editItem.available : true} className="w-4 h-4" />
            <label htmlFor="avail" className="text-sm font-medium">Tersedia untuk dipesan</label>
          </div>
          <div className="pt-4 border-t flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Menyimpan...' : 'Simpan ke Database'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const ViewTables = ({ tables, user, showToast, simulateScan }) => {
  const [qrModal, setQrModal] = useState(null);

  const addTable = async () => {
    if (!user) return showToast('Tunggu koneksi Firebase', 'error');

    const numStr = (tables.length + 1).toString().padStart(2, '0');
    const newId = `t${Date.now()}`;
    const newTable = {
      id: newId,
      number: numStr,
      name: `Meja ${numStr}`,
      token: `JEDA-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      active: true
    };
    
    try {
      const db = getFirestore();
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'kafe-jeda-prod';
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tables', newId), newTable);
      showToast('Meja baru disimpan di DB', 'success');
    } catch(e) {
      showToast('Gagal: ' + e.message, 'error');
    }
  };

  const toggleTable = async (t) => {
    if (!user) return;
    try {
      const db = getFirestore();
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'kafe-jeda-prod';
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tables', t.id), { active: !t.active }, { merge: true });
    } catch(e) {
      showToast('Gagal: ' + e.message, 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-stone-800">Manajemen Meja</h3>
        <Button onClick={addTable}><Icons.Plus size={18}/> Tambah Meja</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map(t => (
          <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200 flex flex-col items-center text-center relative overflow-hidden group">
            <div className={`absolute top-0 w-full h-1 ${t.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <h4 className="font-black text-2xl mt-2 text-[#4a3b32]">{t.name}</h4>
            <p className="text-xs text-stone-500 font-mono mt-1 bg-stone-100 px-2 py-1 rounded">Token: {t.token}</p>
            
            <div className="mt-4 flex gap-2 w-full">
              <Button variant="outline" className="flex-1 text-xs py-1.5" onClick={() => setQrModal(t)}>Lihat QR</Button>
              <Button variant="secondary" className="flex-1 text-xs py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none" onClick={() => simulateScan(t.token)}>Test Scan</Button>
            </div>
            <button onClick={() => toggleTable(t)} className="mt-3 text-xs font-semibold text-stone-500 hover:text-stone-800 underline">
              {t.active ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={!!qrModal} onClose={() => setQrModal(null)} title={`QR Code - ${qrModal?.name}`}>
        {qrModal && (
          <div className="flex flex-col items-center p-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border mb-4">
               <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + window.location.pathname + '?meja=' + qrModal.token)}`} alt="QR" className="w-48 h-48" />
            </div>
            <p className="text-sm text-center text-stone-600 mb-6 max-w-xs">
              Cetak QR ini. Pelanggan cukup scan untuk memesan (Data akan masuk otomatis ke Firebase).
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

const ViewTransactions = ({ orders, setReceiptToPrint }) => {
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b bg-stone-50"><h3 className="font-bold text-lg">Riwayat Transaksi (DB)</h3></div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-stone-100 text-stone-600 sticky top-0">
            <tr>
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Waktu</th>
              <th className="p-4 font-semibold">Total</th>
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {completedOrders.map(o => (
              <tr key={o.id} className="hover:bg-stone-50">
                <td className="p-4 font-bold text-stone-800">{o.id}</td>
                <td className="p-4">{new Date(o.time).toLocaleString('id-ID')}</td>
                <td className="p-4 font-bold text-[#d97706]">{formatCurrency(o.total)}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${o.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {o.status === 'completed' ? 'Selesai' : 'Batal'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => setReceiptToPrint(o)} className="p-2 text-stone-600 hover:bg-stone-200 rounded-lg"><Icons.Printer size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ViewReports = ({ orders }) => {
  const completed = orders.filter(o => o.status === 'completed');
  const totalRev = completed.reduce((sum, o) => sum + o.total, 0);
  
  const itemCounts = {};
  completed.forEach(o => {
    o.items.forEach(i => { itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty; });
  });
  const bestSellers = Object.entries(itemCounts).sort((a,b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
           <p className="text-stone-500 font-medium mb-1">Total Pendapatan (Dari Database)</p>
           <h2 className="text-4xl font-black text-[#4a3b32]">{formatCurrency(totalRev)}</h2>
        </div>
        <div className="text-right">
           <p className="text-stone-500 font-medium mb-1">Transaksi Sukses</p>
           <h3 className="text-2xl font-bold">{completed.length}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <h3 className="font-bold text-lg mb-4">Produk Terlaris</h3>
            <ul className="space-y-3">
              {bestSellers.map(([name, qty], i) => (
                <li key={name} className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#4a3b32] text-white flex items-center justify-center text-xs font-bold">{i+1}</span>
                    <span className="font-semibold">{name}</span>
                  </div>
                  <span className="font-bold text-[#d97706]">{qty} terjual</span>
                </li>
              ))}
            </ul>
         </div>
      </div>
    </div>
  );
};

const ViewSettings = ({ settings, setSettings, showToast }) => {
  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setSettings(prev => ({
      ...prev,
      name: formData.get('name'), address: formData.get('address'), phone: formData.get('phone'),
      taxRate: parseFloat(formData.get('taxRate')), serviceCharge: parseFloat(formData.get('serviceCharge')),
      isOpen: formData.get('isOpen') === 'on'
    }));
    showToast('Pengaturan lokal disimpan', 'success');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 max-w-2xl">
      <div className="p-4 border-b bg-stone-50"><h3 className="font-bold text-lg">Pengaturan Kafe</h3></div>
      <form onSubmit={handleSave} className="p-6 space-y-6">
        <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
           <div className="flex-1">
             <h4 className="font-bold text-amber-900">Status Operasional</h4>
             <p className="text-xs text-amber-700">Tentukan apakah kafe sedang buka atau tutup (menerima pesanan QR).</p>
           </div>
           <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="isOpen" defaultChecked={settings.isOpen} className="sr-only peer" />
              <div className="w-14 h-7 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
           </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-medium mb-1">Nama Kafe</label><input name="name" defaultValue={settings.name} className="w-full p-2.5 border rounded-lg outline-none focus:border-[#4a3b32]" required /></div>
          <div><label className="block text-sm font-medium mb-1">No Telepon</label><input name="phone" defaultValue={settings.phone} className="w-full p-2.5 border rounded-lg outline-none focus:border-[#4a3b32]" required /></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Alamat Lengkap</label><textarea name="address" defaultValue={settings.address} rows="2" className="w-full p-2.5 border rounded-lg outline-none focus:border-[#4a3b32]" required></textarea></div>
          <div><label className="block text-sm font-medium mb-1">Pajak (%)</label><input name="taxRate" type="number" step="0.1" defaultValue={settings.taxRate} className="w-full p-2.5 border rounded-lg outline-none focus:border-[#4a3b32]" required /></div>
          <div><label className="block text-sm font-medium mb-1">Service Dine In (%)</label><input name="serviceCharge" type="number" step="0.1" defaultValue={settings.serviceCharge} className="w-full p-2.5 border rounded-lg outline-none focus:border-[#4a3b32]" required /></div>
        </div>
        <div className="pt-4 border-t"><Button type="submit" className="px-8">Simpan Perubahan</Button></div>
      </form>
    </div>
  );
};


// ==========================================
// PRINTABLE RECEIPT
// ==========================================
const PrintableReceipt = ({ order, settings, tables }) => {
  if (!order) return null;
  const table = tables?.find(t => t.id === order.tableId);
  return (
    <div className="bg-white p-4 w-[80mm] mx-auto text-black font-mono text-sm leading-tight">
      <div className="text-center mb-4 border-b-2 border-black pb-4 border-dashed">
        <h2 className="font-bold text-xl uppercase">{settings.name}</h2>
        <p className="text-xs">{settings.address}</p>
        <p className="text-xs">{settings.phone}</p>
      </div>
      <div className="mb-4 text-xs space-y-1">
        <div className="flex justify-between"><span>No:</span> <span>{order.id}</span></div>
        <div className="flex justify-between"><span>Tgl:</span> <span>{new Date(order.time).toLocaleString('id-ID')}</span></div>
        {table && <div className="flex justify-between"><span>Meja:</span> <span>{table.name}</span></div>}
      </div>
      <div className="border-b-2 border-black pb-2 mb-2 border-dashed">
        {order.items.map((item, i) => (
          <div key={i} className="mb-1 text-xs">
            <div>{item.name}</div>
            <div className="flex justify-between"><span>{item.qty} x {item.price.toLocaleString('id-ID')}</span><span>{(item.qty * item.price).toLocaleString('id-ID')}</span></div>
          </div>
        ))}
      </div>
      <div className="space-y-1 mb-4 text-xs">
        <div className="flex justify-between"><span>Subtotal:</span> <span>{order.subtotal.toLocaleString('id-ID')}</span></div>
        <div className="flex justify-between font-bold text-sm mt-1 pt-1 border-t border-black"><span>TOTAL:</span> <span>{order.total.toLocaleString('id-ID')}</span></div>
      </div>
      <div className="text-center text-xs italic">
        <p>Terima kasih atas kunjungan Anda!</p>
      </div>
    </div>
  );
};


// ==========================================
// CUSTOMER APPLICATION (QR Menu)
// ==========================================
const CustomerApp = ({ table, products, settings, orders, onSubmitOrder, onExit }) => {
  const [cart, setCart] = useState([]);
  const [activeCat, setActiveCat] = useState('Semua');
  const [view, setView] = useState('menu');

  const myOrders = orders.filter(o => o.tableId === table.id && o.type === 'qr');
  const activeOrder = myOrders.find(o => ['pending', 'processing', 'ready'].includes(o.status));

  useEffect(() => {
    if (activeOrder && view !== 'status') {
      setView('status'); setCart([]);
    }
  }, [activeOrder, view]);

  if (!settings.isOpen && view !== 'status') {
    return (
      <div className="h-screen bg-stone-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-[#4a3b32] rounded-2xl flex items-center justify-center mb-6 text-white"><Icons.Coffee size={32}/></div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Maaf, Kami Sedang Tutup</h2>
        <Button onClick={onExit} variant="outline" className="w-full max-w-xs mt-4">Kembali</Button>
      </div>
    );
  }

  const categories = ['Semua', ...new Set(products.map(p => p.category))];
  const activeProducts = products.filter(p => p.available && (activeCat === 'Semua' || p.category === activeCat));

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = subtotal * (settings.taxRate / 100);
  const service = subtotal * (settings.serviceCharge / 100);
  const total = subtotal + tax + service;

  const updateCart = (product, delta) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        const newQty = existing.qty + delta;
        return newQty > 0 ? prev.map(i => i.id === product.id ? {...i, qty: newQty} : i) : prev.filter(i => i.id !== product.id);
      }
      return delta > 0 ? [...prev, { ...product, qty: 1 }] : prev;
    });
  };

  const getQty = (id) => cart.find(i => i.id === id)?.qty || 0;

  const handleSubmit = () => {
    if (cart.length === 0) return;
    const newOrder = {
      id: `QR-${Math.floor(1000 + Math.random() * 9000)}`,
      tableId: table.id,
      type: 'qr',
      status: 'pending',
      items: cart,
      subtotal, tax, service, total,
      time: new Date().toISOString(),
      paymentMethod: null,
      paymentStatus: 'unpaid'
    };
    onSubmitOrder(newOrder);
  };

  return (
    <div className="h-screen flex flex-col bg-stone-50 font-sans sm:max-w-md mx-auto sm:border-x sm:shadow-2xl overflow-hidden relative">
      <header className="bg-white p-4 shadow-sm z-20 shrink-0 sticky top-0">
        <div className="flex justify-between items-center mb-1">
          <h1 className="font-black text-xl text-[#4a3b32] tracking-tight">{settings.name}</h1>
          <button onClick={onExit} className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded">X Kasir</button>
        </div>
        <p className="text-sm font-semibold text-stone-600 bg-stone-100 inline-block px-2 py-0.5 rounded">{table.name}</p>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-hide pb-24">
        {view === 'status' && activeOrder ? (
          <div className="p-6 flex flex-col items-center justify-center h-full text-center">
             <div className="mb-8 relative">
               <div className="w-24 h-24 rounded-full border-4 border-stone-200 flex items-center justify-center">
                 {activeOrder.status === 'pending' && <Icons.Bell size={40} className="text-amber-500 animate-bounce" />}
                 {activeOrder.status === 'processing' && <Icons.Clock size={40} className="text-blue-500 animate-spin" />}
                 {activeOrder.status === 'ready' && <Icons.Check size={40} className="text-green-500" />}
               </div>
             </div>
             
             <h2 className="text-2xl font-black text-stone-800 mb-2">
               {activeOrder.status === 'pending' && 'Menunggu Konfirmasi'}
               {activeOrder.status === 'processing' && 'Pesanan Diproses'}
               {activeOrder.status === 'ready' && 'Siap Disajikan!'}
             </h2>
             
             <div className="bg-white w-full rounded-2xl p-4 shadow-sm border border-stone-100 text-left mt-6">
               <div className="flex justify-between font-bold text-lg pt-2 text-[#4a3b32]">
                 <span>Total Tagihan</span>
                 <span>{formatCurrency(activeOrder.total)}</span>
               </div>
             </div>
          </div>
        ) : view === 'cart' ? (
          <div className="p-4">
            <button onClick={() => setView('menu')} className="font-bold text-[#4a3b32] flex items-center gap-1 mb-4">Kembali ke Menu</button>
            <h2 className="text-2xl font-black mb-4">Keranjang Anda</h2>
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center border-b pb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{item.name}</h4>
                    <p className="text-xs text-[#d97706]">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-stone-50 rounded-full border px-1 py-1">
                    <button onClick={() => updateCart(item, -1)} className="p-1"><Icons.Minus size={14}/></button>
                    <span className="font-bold w-4 text-center text-sm">{getQty(item.id)}</span>
                    <button onClick={() => updateCart(item, 1)} className="p-1"><Icons.Plus size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
              <div className="flex justify-between font-black text-xl border-t pt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>
            </div>
          </div>
        ) : (
          <div>
            <div className="sticky top-0 bg-stone-50 z-10 p-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide shadow-sm border-b">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCat(cat)} className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold shadow-sm ${activeCat === cat ? 'bg-[#4a3b32] text-white' : 'bg-white text-stone-600 border border-stone-200'}`}>{cat}</button>
              ))}
            </div>
            
            <div className="p-4 space-y-4">
              {activeProducts.map(p => {
                const qty = getQty(p.id);
                return (
                  <div key={p.id} className="bg-white rounded-2xl p-3 shadow-sm border border-stone-100 flex gap-4">
                    {p.image ? <img src={p.image} alt="" className="w-24 h-24 object-cover rounded-xl shrink-0" /> : <div className="w-24 h-24 rounded-xl bg-stone-200 flex items-center justify-center shrink-0"><Icons.Coffee className="text-stone-400"/></div>}
                    <div className="flex flex-col flex-1 py-1">
                      <h4 className="font-bold text-stone-800 leading-tight">{p.name}</h4>
                      <div className="mt-auto pt-2 flex items-center justify-between">
                        <span className="font-black text-[#d97706]">{formatCurrency(p.price)}</span>
                        {qty === 0 ? (
                          <button onClick={() => updateCart(p, 1)} className="bg-[#4a3b32] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">Tambah</button>
                        ) : (
                          <div className="flex items-center gap-2 bg-stone-100 rounded-full p-1">
                            <button onClick={() => updateCart(p, -1)} className="p-1.5 bg-white rounded-full"><Icons.Minus size={12}/></button>
                            <span className="font-bold w-4 text-center text-sm">{qty}</span>
                            <button onClick={() => updateCart(p, 1)} className="p-1.5 bg-[#4a3b32] text-white rounded-full"><Icons.Plus size={12}/></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {view === 'menu' && cart.length > 0 && (
        <div className="absolute bottom-4 inset-x-4 z-30">
          <button onClick={() => setView('cart')} className="w-full bg-[#4a3b32] text-white p-4 rounded-2xl shadow-xl flex items-center justify-between font-bold">
            <span>Pesanan ({cart.reduce((s,i)=>s+i.qty,0)})</span>
            <span>{formatCurrency(subtotal)} &gt;</span>
          </button>
        </div>
      )}

      {view === 'cart' && (
        <div className="absolute bottom-0 inset-x-0 p-4 bg-white border-t border-stone-200 z-30">
          <Button onClick={handleSubmit} className="w-full py-4 text-lg rounded-2xl shadow-lg">Kirim Pesanan ke Dapur</Button>
        </div>
      )}
    </div>
  );
}