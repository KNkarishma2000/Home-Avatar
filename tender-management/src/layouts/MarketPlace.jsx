import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, ShoppingBag, Store, 
  ArrowRight, Phone, MessageSquare, Tag,
  X, Sparkles, Building2
} from 'lucide-react';
import { communityAPI } from '../api/auth.service';
import Header from '../pages/components/Header';
import Footer from '../pages/components/Footer';

const Marketplace = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);

  const categories = ['All', 'Home Decor', 'Electronics', 'Services', 'Wellness', 'Other'];

  useEffect(() => {
    const fetchMarketplace = async () => {
      try {
        setLoading(true);
        const res = await communityAPI.getPublicMarketplace();
        setItems(res?.data?.data || []);
      } catch (error) {
        console.error("Marketplace sync failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketplace();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#fbfbfb]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-[#a88d5e] border-t-transparent rounded-full animate-spin"></div>
        <p className="font-serif italic text-[#a88d5e]">Loading the Exchange...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fbfbfb]">
      <Header activePage="marketplace" />

      {/* LUXURY HERO HEADER */}
      <section className="pt-48 pb-20 px-6 bg-[#1f1b16] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#a88d5e]/5 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles size={16} className="text-[#a88d5e]" />
            <span className="text-[#a88d5e] font-bold uppercase text-[10px] tracking-[0.5em]">The Residents' Exchange</span>
            <Sparkles size={16} className="text-[#a88d5e]" />
          </div>
          <h1 className="text-5xl md:text-7xl font-serif italic text-white leading-tight mb-8">
            Curated <span className="text-[#a88d5e]">Marketplace</span>
          </h1>
          <p className="text-gray-400 font-serif italic text-lg max-w-2xl mx-auto mb-12">
            A refined space for Windsor residents to discover quality goods and specialized services within our community.
          </p>
          
          {/* SEARCH BAR */}
          <div className="max-w-xl mx-auto relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#a88d5e] group-focus-within:scale-110 transition-transform" size={20} />
            <input 
              type="text" 
              placeholder="Search by item or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 py-5 pl-16 pr-6 rounded-full text-white placeholder:text-gray-500 focus:outline-none focus:border-[#a88d5e] transition-all"
            />
          </div>
        </div>
      </section>

      {/* FILTER TABS */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 py-6 px-6">
        <div className="max-w-7xl mx-auto flex gap-8 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[11px] font-bold uppercase tracking-[0.3em] whitespace-nowrap transition-all relative pb-2 ${
                selectedCategory === cat ? 'text-[#a88d5e]' : 'text-gray-400 hover:text-[#1f1b16]'
              }`}
            >
              {cat}
              {selectedCategory === cat && (
                <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-[1px] bg-[#a88d5e]" />
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <MarketplaceItemCard 
                key={item.id} 
                item={item} 
                onClick={() => setSelectedItem(item)} 
              />
            ))
          ) : (
            <div className="col-span-full text-center py-20 border border-dashed border-gray-200">
              <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="font-serif italic text-gray-400 text-xl tracking-widest">No listings found in this collection</p>
            </div>
          )}
        </div>
      </main>

      {/* ITEM DETAIL MODAL */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#1f1b16]/95 backdrop-blur-md" 
              onClick={() => setSelectedItem(null)}
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-4xl rounded-none shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
            >
              <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 text-gray-400 hover:text-[#1f1b16] z-10 p-2 bg-white/80 rounded-full">
                <X size={24} strokeWidth={1} />
              </button>

              {/* Product Image Section */}
              <div className="md:w-1/2 bg-gray-100 relative group overflow-hidden">
                <img 
                  src={selectedItem.image_path || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800"} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  alt={selectedItem.item_name}
                />
                <div className="absolute bottom-6 left-6">
                  <span className="bg-[#a88d5e] text-[#1f1b16] px-4 py-2 text-[10px] font-bold uppercase tracking-widest">
                    {selectedItem.category || 'Resident Listing'}
                  </span>
                </div>
              </div>

              {/* Product Info Section */}
              <div className="md:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-[#fbfbfb]">
                <p className="text-[#a88d5e] font-serif italic text-lg mb-2">Available for Collection</p>
                <h2 className="text-4xl md:text-5xl font-serif text-[#1f1b16] mb-6 leading-tight lowercase first-letter:uppercase">
                  {selectedItem.item_name}
                </h2>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="text-2xl font-serif text-[#1f1b16]">
                    ₹ {selectedItem.price || 'Contact for Price'}
                  </div>
                </div>

                <div className="w-12 h-[1px] bg-[#a88d5e] mb-8"></div>
                
                <p className="text-gray-500 font-serif italic leading-relaxed text-lg mb-10">
                  {selectedItem.description}
                </p>

                <div className="space-y-4">
                  <a 
                    href={`tel:${selectedItem.contact_no}`}
                    className="flex items-center justify-center gap-3 w-full bg-[#1f1b16] text-[#a88d5e] py-5 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#a88d5e] hover:text-[#1f1b16] transition-all"
                  >
                    <Phone size={14} /> Contact Resident
                  </a>
                  <p className="text-center text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    Listed on: {new Date(selectedItem.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

// Internal Card Component
const MarketplaceItemCard = ({ item, onClick }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    onClick={onClick}
    className="group bg-white border border-gray-100 p-10 cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col relative"
  >
    <div className="absolute top-10 right-10 text-gray-100 group-hover:text-[#a88d5e]/20 transition-colors">
      <Store size={40} />
    </div>
    
    <div className="flex-1">
      <div className="mb-6">
        <span className="text-[9px] font-bold text-[#a88d5e] uppercase tracking-[0.3em] border-b border-[#a88d5e]/20 pb-1">
          {item.category || 'RESIDENT'}
        </span>
      </div>
      
      <h3 className="font-serif text-3xl mb-4 text-[#1f1b16] group-hover:text-[#a88d5e] transition-colors leading-tight">
        {item.item_name}
      </h3>
      
      <p className="text-gray-500 italic font-serif text-sm mb-10 line-clamp-3">
        {item.description}
      </p>
    </div>

    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
      <div className="font-serif text-[#1f1b16]">₹ {item.price || 'P.O.A'}</div>
      <div className="flex items-center gap-2 text-[#a88d5e] font-bold text-[9px] uppercase tracking-widest translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
        View Details <ArrowRight size={12} />
      </div>
    </div>
  </motion.div>
);

export default Marketplace;