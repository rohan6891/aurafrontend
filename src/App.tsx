import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Info, Heart, Minus, Plus, CreditCard, MapPin, Phone, ArrowRight, X, MessageCircle, Package, BarChart2, Settings, LogOut, Star } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

const fadeInStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  .animate-fade-in {
    animation: fadeIn 0.5s ease-in;
  }

  .animate-fade-out {
    animation: fadeOut 0.5s ease-out;
  }
`;

const marqueeStyles = `
  @keyframes marquee {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }
`;

const vibrateStyles = `
  @keyframes vibrate {
    0% { transform: translate(0); }
    20% { transform: translate(-1px, 1px); }
    40% { transform: translate(-1px, -1px); }
    60% { transform: translate(1px, 1px); }
    80% { transform: translate(1px, -1px); }
    100% { transform: translate(0); }
  }
`;

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface ProductVariant {
  id: string;
  label: string;
  price: number;
  baseName: string;
  isPreOrder?: boolean;
}

function AdminPage() {
  const navigate = useNavigate();
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminOrders, setAdminOrders] = useState<any[]>([]); // Initialize as empty array
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // --- Analytics State ---
  const [analyticsFilter, setAnalyticsFilter] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');

  // --- Analytics Calculation ---
  const getFilteredOrders = () => {
    const now = new Date();
    if (analyticsFilter === 'monthly') {
      return adminOrders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      });
    } else if (analyticsFilter === 'weekly') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0,0,0,0);
      return adminOrders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= startOfWeek && orderDate <= now;
      });
    } else if (analyticsFilter === 'yearly') {
      return adminOrders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate.getFullYear() === now.getFullYear();
      });
    }
    return adminOrders;
  };

  const totalSales = getFilteredOrders().reduce((sum, order) => sum + (order.total || 0), 0);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/orders');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAdminOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminLoggedIn) {
      fetchOrders();
    }
  }, [adminLoggedIn]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkey === '8328246413A5012495' && adminPassword === 'FirstBiss@5012495') {
      setAdminLoggedIn(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const updatedOrder = await response.json();
      // Update the selected order and the list of admin orders
      setSelectedOrder(updatedOrder);
      setAdminOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
      );
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  if (!adminLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-white p-4 lg:p-6">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light">Admin Login</h2>
            <button 
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Passkey</label>
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-purple-400/50 focus:border-transparent text-white placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-purple-400/50 focus:border-transparent text-white placeholder-gray-400"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-400/20 text-purple-300 px-6 py-3 rounded-lg font-medium hover:bg-purple-400/30 transition-colors"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Admin Header */}
      <header className="bg-black/40 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 border-2 border-white rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 border border-white rounded-sm"></div>
              </div>
              <span className="text-white text-xl font-medium">xefag admin</span>
            </div>
            <button 
              onClick={() => {
                setAdminLoggedIn(false);
                navigate('/');
              }}
              className="text-gray-400 hover:text-white flex items-center space-x-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 space-y-2">
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-purple-400/20 text-purple-300">
                <Package className="w-7 h-7" />
                <span>Orders</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700/50 hover:text-white">
                <BarChart2 className="w-5 h-5" />
                <span>Analytics</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700/50 hover:text-white">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-light mb-4">Analytics</h2>
              <div className="flex space-x-2 mb-4">
                <button onClick={() => setAnalyticsFilter('monthly')} className={`px-4 py-2 rounded-lg font-medium ${analyticsFilter === 'monthly' ? 'bg-purple-400/20 text-purple-300' : 'bg-gray-700/50 text-gray-300'}`}>Monthly</button>
                <button onClick={() => setAnalyticsFilter('weekly')} className={`px-4 py-2 rounded-lg font-medium ${analyticsFilter === 'weekly' ? 'bg-purple-400/20 text-purple-300' : 'bg-gray-700/50 text-gray-300'}`}>Weekly</button>
                <button onClick={() => setAnalyticsFilter('yearly')} className={`px-4 py-2 rounded-lg font-medium ${analyticsFilter === 'yearly' ? 'bg-purple-400/20 text-purple-300' : 'bg-gray-700/50 text-gray-300'}`}>Yearly</button>
              </div>
              <div className="text-lg font-medium text-white">Total Sales: <span className="text-green-400">₹{totalSales}</span></div>
            </div>
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-2xl font-light mb-6">Recent Orders</h2>
              {loading && <p>Loading orders...</p>}
              {error && <p className="text-red-400">Error: {error}</p>}
              {!loading && !error && adminOrders.length === 0 && <p>No orders found.</p>}
              <div className="space-y-4">
                {!loading && !error && adminOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="bg-black/40 rounded-lg p-4 cursor-pointer hover:bg-gray-600/50 transition-colors"
                    onClick={() => handleOrderClick(order)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">Order {order.id}</h3>
                        <p className="text-gray-400">{order.customer}</p>
                        <div className="mt-2 space-y-1">
                          {order.products.map((product: string, index: number) => (
                            <p key={index} className="text-sm text-gray-300">{product}</p>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium">₹{order.total}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                          order.status === 'Delivered' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 w-full max-w-lg relative">
            <button
              onClick={() => setShowOrderDetails(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-medium mb-4">Order Details: {selectedOrder.id}</h3>
            <div className="space-y-3 text-gray-300">
              <p><strong>Customer:</strong> {selectedOrder.customer}</p>
              <p><strong>Email:</strong> {selectedOrder.contact.email}</p>
              <p><strong>Phone:</strong> {selectedOrder.contact.phone}</p>
              <p><strong>Address:</strong> {selectedOrder.contact.address}</p>
              <p><strong>Products:</strong></p>
              <ul className="list-disc list-inside ml-4">
                {selectedOrder.products.map((product: string, index: number) => (
                  <li key={index}>{product}</li>
                ))}
              </ul>
              <p><strong>Total:</strong> ₹{selectedOrder.total}</p>
              <p><strong>Status:</strong> 
                <select 
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="ml-2 px-2 py-1 rounded-md bg-gray-700 border border-gray-600 text-white"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </p>
              <p><strong>Payment Status:</strong> <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                selectedOrder.paymentStatus === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>{selectedOrder.paymentStatus}</span></p>
              <p><strong>Order Date:</strong> {selectedOrder.orderDate}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WelcomePage() {
  const navigate = useNavigate();
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 1500);

    const navigateTimer = setTimeout(() => {
      navigate('/products');
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  return (
    <div className={`min-h-screen bg-[url('/uploads/goo.jpg')] bg-cover bg-center flex items-center justify-center transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center">
        <img src="/uploads/n.jpg" alt="AURA Logo" className="h-32 lg:h-40 object-contain mx-auto mb-6 animate-fade-in" />
        <h1 className="text-white text-4xl lg:text-5xl font-light mb-4 animate-fade-in">Welcome to AURA</h1>
        <p className="text-white/80 text-lg lg:text-xl animate-fade-in">Experience the finest tea collection</p>
      </div>
    </div>
  );
}

function MainApp() {
  const [selectedQuantity, setSelectedQuantity] = useState(30);
  const [itemQuantity, setItemQuantity] = useState(0);
  const [cartItems, setCartItems] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [cartProducts, setCartProducts] = useState<Array<{name: string, quantity: number, price: number}>>([]);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);
  const [contactDetails, setContactDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [currentProductImage, setCurrentProductImage] = useState('r.jpg');
  const [touchStartX, setTouchStartX] = useState(0);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [infoContent, setInfoContent] = useState('');
  const [orderId, setOrderId] = useState('');
  const [showTrackOrder, setShowTrackOrder] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const quantityOptions = [30, 60, 90];

  const getProductVariants = (image: string): ProductVariant[] => {
    if (image === 'r.jpg') {
      return [
        { id: 'velar-200g', label: '200gms', price: 292, baseName: 'VELAR' },
        { id: 'velar-500g', label: '500gms', price: 712, baseName: 'VELAR' },
      ];
    } else if (image === 'g.jpg') {
      return [
        { id: 'elix-200g', label: '200gms', price: 292, baseName: 'ELIX' },
        { id: 'elix-500g', label: '500gms', price: 712, baseName: 'ELIX' },
      ];
    } else if (image === 'premium-combo.jpg') {
      return [
        { id: 'premium-combo-std', label: 'Standard Pack', price: 799, baseName: 'Premium Combo' },
      ];
    } else if (image === 'spp.jpg') {
      return [
        { id: 'aura-special', label: '250gms', price: 525, baseName: 'AURA SPECIAL', isPreOrder: true },
      ];
    }
    return [];
  };

  const [variantQuantities, setVariantQuantities] = useState<{[id: string]: number}>({});

  useEffect(() => {
    // Initialize variant quantities when product changes
    const variants = getProductVariants(currentProductImage);
    const initialQuantities: {[id: string]: number} = {};
    variants.forEach(v => {
      initialQuantities[v.id] = 0;
    });
    setVariantQuantities(initialQuantities);
  }, [currentProductImage]);

  const handleVariantAddToCart = (variantId: string, baseName: string, price: number) => {
    const quantityToAdd = variantQuantities[variantId] || 1;
    if (quantityToAdd < 1) return;

    setCartProducts(prev => {
      const existingProductIndex = prev.findIndex(p => p.name === `${baseName} (${variantId.split('-')[1].toUpperCase()})`);
      if (existingProductIndex > -1) {
        const updatedCart = [...prev];
        updatedCart[existingProductIndex].quantity += quantityToAdd;
        return updatedCart;
      }
      return [...prev, { name: `${baseName} (${variantId.split('-')[1].toUpperCase()})`, quantity: quantityToAdd, price }];
    });

    setCartItems(prev => prev + quantityToAdd);
    // Reset quantity for the added variant
    setVariantQuantities(prev => ({ ...prev, [variantId]: 0 }));
  };

  const handleVariantQuantityChange = (variantId: string, newQuantity: number) => {
    if (newQuantity < 0) return; // Allow quantity to be 0
    setVariantQuantities(prev => ({ ...prev, [variantId]: newQuantity }));
  };

  const handleAddToCart = () => {
    // This function is no longer directly used for variants, keeping for other contexts if any
    // or will be removed if not needed elsewhere.
    // Placeholder logic for default product if needed or just remove.
    const productName = currentProductImage === 'r.jpg' ? 'VELAR' : currentProductImage === 'g.jpg' ? 'ELIX' : 'Premium Combo';
    const price = currentProductImage === 'premium-combo.jpg' ? 799 : 205;
    
    setCartProducts(prev => {
      const existingProduct = prev.find(p => p.name === productName);
      if (existingProduct) {
        return prev.map(p => 
          p.name === productName 
            ? {...p, quantity: p.quantity + itemQuantity}
            : p
        );
      }
      return [...prev, { name: productName, quantity: itemQuantity, price }];
    });
    
    setCartItems(prev => prev + itemQuantity);
    setItemQuantity(0);
  };

  const handleRemoveFromCart = (productName: string) => {
    setCartProducts(prev => {
      const product = prev.find(p => p.name === productName);
      if (product) {
        setCartItems(prev => prev - product.quantity);
      }
      return prev.filter(p => p.name !== productName);
    });
  };

  // Helper to check if shipping is needed
  const needsShipping = () => {
    const city = contactDetails.city.trim().toLowerCase();
    return city !== 'bengaluru' && city !== 'bangalore';
  };

  // Helper to get discounted price for a product
  const getDiscountedProductTotal = (product: {name: string, quantity: number, price: number}) => {
    if (discount > 0) {
      return product.price * product.quantity * (1 - discount);
    }
    return product.price * product.quantity;
  };

  // Helper to get total price with per-product discount and shipping
  const getTotalPrice = () => {
    let total = 0;
    if (discount > 0) {
      total = cartProducts.reduce((sum, product) => sum + getDiscountedProductTotal(product), 0);
    } else {
      total = cartProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    }
    if (needsShipping()) {
      total += 50;
    }
    return total;
  };

  const handlePromoCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.toUpperCase() === 'OFFVE') {
      setDiscount(0.3); // 30% discount
      setPromoCodeError(null);
    } else {
      setPromoCodeError('Invalid promo code');
      setDiscount(0);
    }
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCheckout(false);
    setShowPayment(true);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically integrate with a payment gateway
    alert('Order placed successfully!');
    setCartItems(0);
    setShowCheckout(false);
    setShowPayment(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleProductImage = () => {
    setCurrentProductImage(prevImage => {
      if (prevImage === 'r.jpg') return 'g.jpg';
      if (prevImage === 'g.jpg') return 'premium-combo.jpg';
      if (prevImage === 'premium-combo.jpg') return 'spp.jpg';
      return 'r.jpg';
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX;

    if (Math.abs(swipeDistance) > 50) { // Consider a swipe if moved more than 50px
      toggleProductImage();
    }
  };

  const handleInfoClick = () => {
    let content = '';
    if (currentProductImage === 'r.jpg') {
      content = 'VELAR is a tribute to the bold character of Assam\'s legendary tea gardens. Made from 100% pure tea leaves with no added flavors, it delivers a strong, malty richness that energizes and satisfies with every cup. Deep, robust, and authentic—Velar is crafted for true tea lovers who appreciate strength in its purest form.\n\nExciting custom flavors launching soon—crafted to suit every unique palate.';
    } else if (currentProductImage === 'g.jpg') {
      content = 'ELIX brings you the serene charm of Ooty\'s lush hills, offering a naturally smooth and aromatic tea experience. Made from pure tea powder with no artificial additives, Elix delivers a clean, floral flavor that soothes and refreshes. It\'s a gentle luxury designed for those who value authenticity and elegance in their cup.\n\nStay tuned—our range of custom flavors is coming soon to delight your senses.';
    } else if (currentProductImage === 'premium-combo.jpg') {
      content = 'PREMIUM COMBO is a special set of two tea types and an accessory.';
    } else if (currentProductImage === 'spp.jpg') {
      content = 'Experience the future of tea with AURA SPECIAL. Coming soon with an exclusive 30% pre-order discount!';
    }
    setInfoContent(content);
    setShowInfoPopup(true);
  };

  const handleUpdateQuantity = (productName: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartProducts(prev => {
      const product = prev.find(p => p.name === productName);
      if (product) {
        const quantityDiff = newQuantity - product.quantity;
        setCartItems(prev => prev + quantityDiff);
      }
      return prev.map(p => 
        p.name === productName 
          ? {...p, quantity: newQuantity}
          : p
      );
    });
  };

  useEffect(() => {
    const slideshowInterval = setInterval(() => {
      toggleProductImage();
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(slideshowInterval);
  }, [toggleProductImage]);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleRazorpayPayment = () => {
    const options = {
      key: 'rzp_test_NyLZPzYHIYtxqW',
      amount: Math.round(getTotalPrice() * 100), // Convert to paise and round to nearest integer
      currency: 'INR',
      name: 'XEFAG',
      description: 'Product Purchase',
      handler: async function (response: any) {
        console.log(response);
        const newOrderId = 'XEF' + Date.now().toString() + Math.random().toString(36).substr(2, 5).toUpperCase();
        
        const orderData = {
          id: newOrderId,
          customer: contactDetails.name,
          products: cartProducts.map(p => `${p.name} x ${p.quantity}`),
          total: getTotalPrice(),
          status: 'Confirmed', // Initial status
          contact: {
            email: contactDetails.email,
            phone: contactDetails.phone,
            address: `${contactDetails.address}, ${contactDetails.city}, ${contactDetails.state}, ${contactDetails.zipCode}`,
          },
          paymentStatus: 'Paid', // Assuming payment is successful here
          orderDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
          discount: discount > 0 ? {
            code: promoCode,
            percentage: discount * 100,
            amount: cartProducts.reduce((total, product) => total + (product.price * product.quantity), 0) * discount
          } : null
        };

        try {
          const res = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
          });

          if (!res.ok) {
            throw new Error(`Failed to save order: ${res.statusText}`);
          }
          console.log('Order saved successfully!', await res.json());
          setOrderId(newOrderId);
          setShowPayment(false);
          setShowOrderSuccess(true);
          setCartItems(0);
          setCartProducts([]);
        } catch (error) {
          console.error('Error saving order:', error);
          alert('Order placed, but there was an error saving details. Please contact support.');
        }
      },
      prefill: {
        name: contactDetails.name,
        email: contactDetails.email,
        contact: contactDetails.phone
      },
      theme: {
        color: '#8B5CF6'
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackLoading(true);
    setTrackError(null);
    setTrackedOrder(null);
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${trackingId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Order tracking failed: ${response.status}`);
      }
      const data = await response.json();
      setTrackedOrder(data);
    } catch (err: any) {
      setTrackError(err.message);
    } finally {
      setTrackLoading(false);
    }
  };

  const handleMasterAddToCart = () => {
    let totalQuantityAdded = 0;
    const updatedCartProducts = [...cartProducts];

    getProductVariants(currentProductImage).forEach(variant => {
      const quantity = variantQuantities[variant.id] || 0; // Changed from || 1 to || 0
      if (quantity > 0) {
        const existingProductIndex = updatedCartProducts.findIndex(p => p.name === `${variant.baseName} (${variant.label})`);
        if (existingProductIndex > -1) {
          updatedCartProducts[existingProductIndex].quantity += quantity;
        } else {
          updatedCartProducts.push({ name: `${variant.baseName} (${variant.label})`, quantity: quantity, price: variant.price });
        }
        totalQuantityAdded += quantity;
      }
    });

    setCartProducts(updatedCartProducts);
    setCartItems(prev => prev + totalQuantityAdded);
    
    // Reset quantities after adding to cart
    const newVariantQuantities: {[id: string]: number} = {};
    getProductVariants(currentProductImage).forEach(v => {
      newVariantQuantities[v.id] = 0;
    });
    setVariantQuantities(newVariantQuantities);
  };

  if (showCart) {
    return (
      <div className="min-h-screen bg-black text-white p-4 lg:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light">Your Cart</h2>
            <button 
              onClick={() => setShowCart(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {cartProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Your cart is empty
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cartProducts.map((product, index) => (
                  <div key={index} className="bg-black/40 backdrop-blur-sm rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">{product.name}</h3>
                      <div className="flex items-center space-x-3 mt-2">
                        <button
                          onClick={() => handleUpdateQuantity(product.name, product.quantity - 1)}
                          className="w-7 h-7 bg-purple-400/20 rounded-full flex items-center justify-center hover:bg-purple-400/30 transition-colors"
                        >
                          <Minus className="w-4 h-4 text-purple-300" />
                        </button>
                        <span className="text-gray-300">{product.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(product.name, product.quantity + 1)}
                          className="w-7 h-7 bg-purple-400/20 rounded-full flex items-center justify-center hover:bg-purple-400/30 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-purple-300" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="text-lg">₹{product.price * product.quantity}</p>
                      <button 
                        onClick={() => handleRemoveFromCart(product.name)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Shipping info note */}
              <div className="text-xs text-blue-400 mb-2">₹50 shipping will be added for addresses outside Bengaluru.</div>
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center text-lg font-medium">
                  <span>Total</span>
                  <span>₹{cartProducts.reduce((total, product) => total + (product.price * product.quantity), 0)}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCart(false);
                  setShowCheckout(true);
                }}
                className="w-full bg-purple-400/20 text-purple-300 px-6 py-3 rounded-full font-medium hover:bg-purple-400/30 transition-colors"
              >
                Proceed to Checkout
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-black text-white p-4 lg:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light">Contact Details</h2>
            <button 
              onClick={() => setShowCheckout(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6">
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={contactDetails.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-purple-400/50 focus:border-transparent text-white placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={contactDetails.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-purple-400/50 focus:border-transparent text-white placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={contactDetails.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-purple-400/50 focus:border-transparent text-white placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={contactDetails.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-purple-400/50 focus:border-transparent text-white placeholder-gray-400"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={contactDetails.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-purple-400/50 focus:border-transparent text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={contactDetails.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-purple-400/50 focus:border-transparent text-white placeholder-gray-400"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={contactDetails.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-purple-400/50 focus:border-transparent text-white placeholder-gray-400"
                  required
                />
              </div>
              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="px-6 py-2 text-gray-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-purple-400/20 text-purple-300 px-6 py-2 rounded-full font-medium hover:bg-purple-400/30 transition-colors"
                >
                  Proceed to Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (showOrderSuccess) {
    return (
      <div className="min-h-screen bg-black text-white p-4 lg:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-light mb-4">Order Placed Successfully!</h2>
            
            <div className="space-y-4 mb-8">
              <p className="text-gray-300">
                Your order will be delivered within 5 working days.
              </p>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Order ID</p>
                <p className="text-lg font-medium text-purple-300">{orderId}</p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setShowOrderSuccess(false);
                  setCurrentProductImage('r.jpg');
                }}
                className="w-full bg-purple-400/20 text-purple-300 px-6 py-3 rounded-lg font-medium hover:bg-purple-400/30 transition-colors"
              >
                Track Your Order
              </button>
              
              <button
                onClick={() => {
                  setShowOrderSuccess(false);
                  setCurrentProductImage('r.jpg');
                }}
                className="w-full text-gray-400 hover:text-white px-6 py-3 font-medium"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showPayment) {
    return (
      <div className="min-h-screen bg-black text-white p-4 lg:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light">Payment Details</h2>
            <button 
              onClick={() => setShowPayment(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Order Summary</h3>
              <div className="space-y-2">
                {cartProducts.map((product, index) => (
                  <div key={index} className="flex flex-col text-gray-300">
                    <div className="flex justify-between items-center">
                      <span>{product.name} x {product.quantity}</span>
                      {discount > 0 ? (
                        <span>
                          <span className="line-through text-gray-400 mr-2">₹{product.price * product.quantity}</span>
                          <span className="text-green-400 font-semibold">₹{getDiscountedProductTotal(product).toFixed(2)}</span>
                        </span>
                      ) : (
                        <span>₹{product.price * product.quantity}</span>
                      )}
                    </div>
                    {discount > 0 && (
                      <span className="text-green-400 text-xs ml-auto">30% off applied</span>
                    )}
                  </div>
                ))}
                <div className="border-t border-gray-600/50 pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Subtotal</span>
                    <span>₹{cartProducts.reduce((total, product) => total + (product.price * product.quantity), 0)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Total Discount (30%)</span>
                      <span>-₹{(cartProducts.reduce((total, product) => total + (product.price * product.quantity), 0) * discount).toFixed(2)}</span>
                    </div>
                  )}
                  {needsShipping() && (
                    <div className="flex justify-between text-blue-400">
                      <span>Shipping (outside Bengaluru)</span>
                      <span>+₹50</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium mt-2">
                    <span>Total Amount</span>
                    <span>₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Promo Code Section */}
            <div className="mb-6">
              <form onSubmit={handlePromoCodeSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                  className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-purple-400/50 focus:border-transparent text-white placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="bg-purple-400/20 text-purple-300 px-4 py-2 rounded-lg font-medium hover:bg-purple-400/30 transition-colors"
                >
                  Apply
                </button>
              </form>
              {promoCodeError && (
                <p className="text-red-400 text-sm mt-1">{promoCodeError}</p>
              )}
              {discount > 0 && (
                <p className="text-green-400 text-sm mt-1">Promo code applied successfully!</p>
              )}
            </div>

            <button
              onClick={handleRazorpayPayment}
              className="w-full bg-purple-400/20 text-purple-300 px-6 py-3 rounded-lg font-medium hover:bg-purple-400/30 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
              Pay with Razorpay
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showTrackOrder) {
    return (
      <div className="min-h-screen bg-black text-white p-4 lg:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light">Track Your Order</h2>
            <button 
              onClick={() => setShowTrackOrder(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6">
            <form onSubmit={handleTrackOrder} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Enter Order ID</label>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter your order ID (e.g., XEF123456)"
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-purple-400/50 focus:border-transparent text-white placeholder-gray-400"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-purple-400/20 text-purple-300 px-6 py-3 rounded-lg font-medium hover:bg-purple-400/30 transition-colors"
                disabled={trackLoading}
              >
                {trackLoading ? 'Tracking...' : 'Track Order'}
              </button>
            </form>

            {trackLoading && <p className="text-center mt-4">Loading tracking details...</p>}
            {trackError && <p className="text-red-400 text-center mt-4">Error: {trackError}</p>}

            {trackedOrder && !trackLoading && (
              <div className="mt-8 space-y-4">
                <h3 className="text-xl font-medium mb-4">Order Details: {trackedOrder.id}</h3>
                <div className="space-y-3 text-gray-300">
                  <p><strong>Customer:</strong> {trackedOrder.customer}</p>
                  <p><strong>Products:</strong></p>
                  <ul className="list-disc list-inside ml-4">
                    {trackedOrder.products.map((product: string, index: number) => (
                      <li key={index}>{product}</li>
                    ))}
                  </ul>
                  <p><strong>Total:</strong> ₹{trackedOrder.total}</p>
                  <p><strong>Status:</strong> <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    trackedOrder.status === 'Delivered' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>{trackedOrder.status}</span></p>
                  <p><strong>Payment Status:</strong> <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    trackedOrder.paymentStatus === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>{trackedOrder.paymentStatus}</span></p>
                  <p><strong>Order Date:</strong> {trackedOrder.orderDate}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      currentProductImage === 'r.jpg' ? 'bg-[url("/uploads/redback.jpg")] bg-cover bg-center' : 
      currentProductImage === 'g.jpg' ? 'bg-[url("/uploads/greenbg.jpg")] bg-cover bg-center' : 
      currentProductImage === 'spp.jpg' ? 'bg-gray-900' : 
      'bg-[url("/uploads/go.jpg")] bg-cover bg-center'
    } overflow-hidden relative transition-all duration-500`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white/10"></div>
        <div className="absolute bottom-40 right-20 w-24 h-24 rounded-full bg-white/5"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-white/5"></div>
        {/* Center light effect */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <header className="fixed top-4 left-4 right-4 z-50 max-w-7xl mx-auto flex items-center justify-between">
          <img src="/uploads/n.jpg" alt="AURA Logo" className="h-20 lg:h-24 xl:h-28 object-contain" />
          
          <div className="flex-grow bg-black/40 backdrop-blur-sm rounded-full p-3 lg:p-4 xl:p-5 shadow-lg flex items-center justify-between mx-4 lg:mx-8 xl:mx-12">
            <style>{marqueeStyles}</style>
            <div className="flex items-center justify-center flex-grow overflow-hidden">
              <p className="whitespace-nowrap text-base lg:text-lg xl:text-xl font-light text-white" style={{ animation: 'marquee 15s linear infinite' }}>
                {currentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {currentDateTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center space-x-2 lg:space-x-3">
              <button 
                onClick={() => setShowTrackOrder(true)}
                className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <svg className="w-3 h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </button>
              <button 
                onClick={() => setShowCart(true)}
                className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors relative"
              >
                <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-gray-800" />
                {cartItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 bg-red-500 rounded-full text-white text-xs lg:text-sm flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="pt-28 lg:pt-32 xl:pt-36 px-4 lg:px-8 xl:px-12 flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20 items-center min-h-screen">
          {/* Product Info */}
          <div className="space-y-4 lg:space-y-6 xl:space-y-8 text-center lg:text-left order-2 lg:order-1">
            <div>
              <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-light leading-tight mb-2 lg:mb-4 xl:mb-6">
              </h1>
              <p className="text-white/80 text-base lg:text-lg xl:text-xl"></p>
            </div>

            <div className="text-white/70 text-sm lg:text-base xl:text-lg leading-relaxed max-w-md lg:max-w-lg xl:max-w-xl mx-auto lg:mx-0">
            </div>
          </div>

          {/* Product Image and Purchase */}
          <div className="flex flex-col items-center space-y-6 lg:space-y-8 xl:space-y-10 order-1 lg:order-2">
            {/* Product Name Display */}
            <div className="flex items-center justify-center space-x-2 text-white text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl">
              <span className="font-serif">{currentProductImage === 'r.jpg' ? 'VELAR' : currentProductImage === 'g.jpg' ? 'ELIX' : currentProductImage === 'spp.jpg' ? 'AURA SPECIAL' : 'Premium Combo'}</span>
            </div>

            {/* Product Image Container */}
            <div 
              className="relative" 
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img 
                src={`/uploads/${currentProductImage}`}
                alt="Product Image"
                className="w-64 h-80 sm:w-80 sm:h-96 lg:w-96 lg:h-[30rem] xl:w-[28rem] xl:h-[35rem] 2xl:w-[32rem] 2xl:h-[40rem] object-cover rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.7)] drop-shadow-[0_0_30px_rgba(0,0,0,0.5)] mx-auto block"
              />
              <button
                onClick={handleInfoClick}
                className="absolute top-2 right-2 lg:top-4 lg:right-4 xl:top-6 xl:right-6 bg-white rounded-full p-1 lg:p-2 xl:p-3 text-gray-800 hover:bg-white/90 transition-colors z-10"
              >
                <Info className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
              </button>
            </div>
            {/* Dots for navigation */}
            <div className="flex space-x-2 lg:space-x-3">
              <button
                onClick={() => setCurrentProductImage('r.jpg')}
                className={`w-3 h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 rounded-full ${currentProductImage === 'r.jpg' ? 'bg-white' : 'bg-white/50'} transition-colors`}
              ></button>
              <button
                onClick={() => setCurrentProductImage('g.jpg')}
                className={`w-3 h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 rounded-full ${currentProductImage === 'g.jpg' ? 'bg-white' : 'bg-white/50'} transition-colors`}
              ></button>
              <button
                onClick={() => setCurrentProductImage('premium-combo.jpg')}
                className={`w-3 h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 rounded-full ${currentProductImage === 'premium-combo.jpg' ? 'bg-white' : 'bg-white/50'} transition-colors`}
              ></button>
              <button
                onClick={() => setCurrentProductImage('spp.jpg')}
                className={`w-3 h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 rounded-full ${currentProductImage === 'spp.jpg' ? 'bg-white' : 'bg-white/50'} transition-colors`}
              ></button>
            </div>

            {/* Product Description */}
            {currentProductImage === 'r.jpg' && (
              <p className="text-white/80 text-center text-sm lg:text-base xl:text-lg max-w-md lg:max-w-lg xl:max-w-xl px-4 lg:px-0">
                Bold and pure, Velar brings the rich taste of Assam with no added flavors—just strong, authentic tea in every sip
              </p>
            )}
            {currentProductImage === 'g.jpg' && (
              <p className="text-white/80 text-center text-sm lg:text-base xl:text-lg max-w-md lg:max-w-lg xl:max-w-xl px-4 lg:px-0">
                Smooth and aromatic, Elix captures the natural elegance of Ooty's hills—pure tea with no additives, just true flavor.
              </p>
            )}
            {currentProductImage === 'spp.jpg' && (
              <p className="text-white/80 text-center text-sm lg:text-base xl:text-lg max-w-md lg:max-w-lg xl:max-w-xl px-4 lg:px-0">
                Experience the future of tea with AURA SPECIAL. Coming soon with an exclusive 30% pre-order discount!
              </p>
            )}

            {/* Purchase Section */}
            <div className="flex flex-col items-center w-full max-w-md lg:max-w-lg xl:max-w-xl space-y-4 mt-4 lg:mt-6 xl:mt-8">
              <div className="bg-black/40 rounded-lg p-4 lg:p-6 xl:p-8 w-full shadow-lg space-y-4 lg:space-y-6 shadow-md">
                {getProductVariants(currentProductImage).map(variant => (
                  <div key={variant.id} className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="text-white text-base lg:text-lg xl:text-xl font-medium">
                        {variant.label} ₹{variant.price}
                        {variant.isPreOrder && (
                          <span className="ml-2 text-sm lg:text-base text-green-400">(-30% Pre-order)</span>
                        )}
                      </span>
                      {variant.isPreOrder && (
                        <span className="text-sm lg:text-base text-green-400">Final Price: ₹{Math.round(variant.price * 0.7)}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 lg:space-x-4 shadow-sm rounded-full p-1 lg:p-2 bg-white/10">
                      <button
                        onClick={() => handleVariantQuantityChange(variant.id, (variantQuantities[variant.id] || 0) - 1)}
                        className="w-7 h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                      >
                        <Minus className="w-3 h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-white" />
                      </button>
                      <span className="text-white text-base lg:text-lg xl:text-xl font-medium w-6 lg:w-8 text-center">{variantQuantities[variant.id] || 0}</span>
                      <button
                        onClick={() => handleVariantQuantityChange(variant.id, (variantQuantities[variant.id] || 0) + 1)}
                        className="w-7 h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                      >
                        <Plus className="w-3 h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
                {/* Rating Section */}
                <div className="flex justify-center pt-2 lg:pt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 ${
                        currentProductImage === 'r.jpg' && i < 5 ? 'text-yellow-400 fill-yellow-400' : 
                        currentProductImage === 'g.jpg' && i < 4 ? 'text-yellow-400 fill-yellow-400' : 
                        currentProductImage === 'g.jpg' && i === 4 ? 'text-yellow-400 fill-yellow-400/50' :
                        currentProductImage === 'spp.jpg' ? 'text-yellow-400 fill-yellow-400' :
                        'text-gray-400'
                      }`}
                    />
                  ))}
                  <span className="text-white ml-2 text-sm lg:text-base xl:text-lg">(5.0/5.0)</span>
                </div>
                
                <button
                  onClick={handleMasterAddToCart}
                  className="w-full bg-white text-gray-800 px-6 py-3 lg:px-8 lg:py-4 xl:px-10 xl:py-5 rounded-full font-medium hover:bg-gray-100 transition-colors mt-4 lg:mt-6 text-base lg:text-lg xl:text-xl"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInfoPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 max-w-md w-full relative">
            <button
              onClick={() => setShowInfoPopup(false)}
              className="absolute top-2 right-2 text-white hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
            <p className="text-white text-base whitespace-pre-line">{infoContent}</p>
          </div>
        </div>
      )}

      {/* WhatsApp Support Button */}
      <a 
        href="https://wa.me/yourphonenumber" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed top-1/2 right-6 lg:right-8 xl:right-12 z-50 bg-[#25D366] text-white p-3 lg:p-4 xl:p-5 rounded-full shadow-lg hover:bg-[#128C7E] transition-colors duration-300 flex items-center justify-center group transform -translate-y-1/2"
      >
        <style>{vibrateStyles}</style>
        <svg 
          className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12" 
          fill="currentColor" 
          viewBox="0 0 24 24"
          style={{ animation: 'vibrate 0.2s linear infinite' }}
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="absolute right-16 lg:right-20 xl:right-24 bg-white text-gray-800 px-4 py-2 lg:px-6 lg:py-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm lg:text-base">
          Chat with us
        </span>
      </a>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/products" element={<MainApp />} />
        <Route path="/" element={<WelcomePage />} />
      </Routes>
    </Router>
  );
}

export default App;