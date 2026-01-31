import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Home, Store, PartyPopper, Images, Newspaper, 
  Menu, X, ArrowLeft, ArrowRight, ChevronRight, 
  Calendar, Megaphone, Info, StoreIcon, Sparkles
} from 'lucide-react';
import { communityAPI } from '../api/auth.service';
import Video from '../assets/mainvideo.mp4';

// Style mapping for different notice types
const TYPE_MAP = {
  ALERT: { label: 'Urgent', color: 'text-red-500 bg-red-50/50' },
  INFO: { label: 'Briefing', color: 'text-[#a88d5e] bg-[#a88d5e]/5' },
  MEETING: { label: 'Assembly', color: 'text-purple-500 bg-purple-50/50' },
  EVENT: { label: 'Social', color: 'text-orange-500 bg-orange-50/50' }
};

const WindsorLiving = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // DATA STATE
  const [notices, setNotices] = useState([]);
  const [marketplace, setMarketplace] = useState([]);
  const [carnivals, setCarnivals] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [gallery, setGallery] = useState([]);
  
  // POPUP STATE
  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [noticesRes, blogsRes, carnivalsRes, galleryRes, marketRes] = await Promise.all([
          communityAPI.getNotices(),
          communityAPI.getApprovedBlogs(),
          communityAPI.getCarnivals(),
          communityAPI.getPublicGallery(),
          communityAPI.getPublicMarketplace()
        ]);

        setNotices(noticesRes?.data?.data || []);
        setBlogs(blogsRes?.data?.data || []);
        setCarnivals(carnivalsRes?.data?.data || []);
        setGallery(galleryRes?.data?.data || []);
        setMarketplace(marketRes?.data?.data || []);
      } catch (error) {
        console.error("Backend sync failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const galleryImages = [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200"
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % (gallery.length || galleryImages.length));
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + (gallery.length || galleryImages.length)) % (gallery.length || galleryImages.length));

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#1f1b16] z-[9999] flex items-center justify-center">
        <Building2 className="text-[#a88d5e] w-12 h-12 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-[#fbfbfb] font-sans text-[#222] selection:bg-[#a88d5e] selection:text-white">
      
      {/* 1. POPUP MODAL (REUSE FROM NOTICES PAGE) */}
      <AnimatePresence>
        {selectedNotice && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#1f1b16]/95 backdrop-blur-md" 
              onClick={() => setSelectedNotice(null)}
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl p-10 md:p-16 shadow-2xl z-[2001] max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setSelectedNotice(null)} className="absolute top-8 right-8 text-gray-400 hover:text-[#1f1b16]">
                <X size={24} strokeWidth={1} />
              </button>
              
              <div className="mb-10 text-center">
                <span className="px-4 py-1 text-[10px] font-bold uppercase tracking-[0.3em] mb-6 inline-block text-[#a88d5e] bg-[#a88d5e]/5">
                  {selectedNotice.notice_type || 'BULLETIN'}
                </span>
                <h2 className="text-3xl md:text-5xl font-serif italic text-[#1f1b16] leading-tight mb-6">
                  {selectedNotice.title}
                </h2>
                <div className="flex items-center justify-center gap-3 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                  <Calendar size={14} className="text-[#a88d5e]" />
                  {new Date(selectedNotice.display_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="w-12 h-[1px] bg-[#a88d5e] mx-auto mt-8"></div>
              </div>

              <div className="prose prose-neutral max-w-none">
                <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap font-serif italic">
                  {selectedNotice.content}
                </p>
              </div>

              <button 
                onClick={() => setSelectedNotice(null)}
                className="mt-16 w-full border border-[#1f1b16] text-[#1f1b16] py-5 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#1f1b16] hover:text-white transition-all"
              >
                Close Bulletin
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL SCREEN MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }}
            className="fixed inset-0 bg-[#1f1b16] z-[1001] flex flex-col items-center justify-center space-y-8"
          >
            <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 text-[#a88d5e] hover:rotate-90 transition-transform">
              <X size={40} />
            </button>
            {['Home', 'Blogs', 'Marketplace', 'Carnival', 'Photo Tour','Notices', 'Tenders'].map((item) => {
              const menuLinks = { 'Home': '/', 'Blogs': '/blog', 'Marketplace': '/marketplace', 'Carnival': '/carnivals', 'Photo Tour': '/gallery', 'Notices':'/notices', 'Tenders': '/tenders' };
              return (
                <a key={item} href={menuLinks[item]} onClick={() => setIsMenuOpen(false)} className="text-white text-2xl md:text-3xl font-serif tracking-widest hover:text-[#a88d5e] transition-all">
                  {item.toUpperCase()}
                </a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <nav className="fixed left-0 top-0 h-screen w-20 bg-[#1f1b16] hidden md:flex flex-col z-[1000] border-r border-white/5">
        <div className="h-20 flex items-center justify-center text-white border-b border-white/5"><Building2 size={28} /></div>
        <button onClick={() => setIsMenuOpen(true)} className="h-20 flex items-center justify-center text-[#a88d5e] hover:text-white transition-colors"><Menu size={24} /></button>
        <div className="flex-1 flex flex-col pt-10">
          <SidebarIcon icon={<Home size={20}/>} label="Home" active />
          <SidebarIcon icon={<Store size={20}/>} label="Marketplace" />
          <SidebarIcon icon={<PartyPopper size={20}/>} label="Carnival" />
          <SidebarIcon icon={<Images size={20}/>} label="Photos" />
          <SidebarIcon icon={<Newspaper size={20}/>} label="News" />
        </div>
      </nav>

      <main className="md:ml-20">
        
        {/* HERO SECTION */}
        <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover scale-110">
            <source src={Video} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/50" />
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="relative bg-[#1f1b16]/80 backdrop-blur-sm p-10 md:p-20 text-center text-white max-w-3xl mx-4 border border-white/10 shadow-2xl">
            <p className="italic font-serif text-[#a88d5e] text-lg mb-4">Welcome to Hyderabad's Finest</p>
            <h1 className="text-4xl md:text-6xl font-serif tracking-tighter mb-8 leading-tight">MODERN APARTMENTS <br/> IN A NEW COMPLEX</h1>
            <button className="bg-[#a88d5e] px-10 py-4 hover:bg-transparent border border-[#a88d5e] transition-all uppercase tracking-widest text-sm font-bold">Explore Residence</button>
          </motion.div>
        </section>

        {/* 2. FLASH UPDATES - STATIC BLOCKS SECTION */}
        <section className="py-20 bg-[#fbfbfb] px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-6">
              <div>
                <span className="text-[#a88d5e] font-bold uppercase text-[10px] tracking-[0.4em] mb-2 block">Real-time Bulletins</span>
                <h2 className="text-4xl font-serif text-[#1f1b16]">FLASH UPDATES</h2>
              </div>
              <a href="/notices" className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#a88d5e] transition-colors flex items-center gap-2">
                View Archive <ChevronRight size={14} />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {notices.slice(0, 4).map((notice) => (
                <motion.div
                  key={notice.id}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedNotice(notice)}
                  className="bg-white border border-gray-100 p-6 cursor-pointer hover:shadow-xl transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#a88d5e] transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                  <div className="flex items-center justify-between mb-4">
                    <Megaphone size={18} className="text-[#a88d5e]" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase">{new Date(notice.display_date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-serif text-lg mb-2 text-[#1f1b16] line-clamp-1 group-hover:text-[#a88d5e] transition-colors">
                    {notice.title}
                  </h3>
                  <p className="text-gray-500 text-xs line-clamp-2 italic mb-4">
                    {notice.content}
                  </p>
                  <div className="text-[9px] font-bold uppercase tracking-tighter text-[#a88d5e] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Read Details <ArrowRight size={10} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 02 ABOUT / RESIDENCE SECTION */}
        <section id="residence" className="py-24 px-6 md:px-20 relative bg-white overflow-hidden">
          <div className="absolute top-0 right-0 text-[15rem] font-bold text-black/[0.02] leading-none pointer-events-none">01</div>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }}>
              <p className="italic font-serif text-[#a88d5e] mb-4">Modern Architecture</p>
              <h2 className="text-5xl font-serif text-[#1f1b16] mb-8 leading-tight">INTRODUCING A NEW <br/> STANDARD OF LIVING</h2>
              <div className="w-12 h-1 bg-[#a88d5e] mb-8"></div>
              <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                Each apartment has been individually designed to maximize space and light. 
                Smart Home Technology comes installed as standard.
              </p>
              <a href="#" className="inline-flex items-center gap-2 text-[#a88d5e] font-bold uppercase tracking-widest hover:gap-4 transition-all">
                Read More <ArrowRight size={18} />
              </a>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="relative">
              <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800" className="shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" alt="Architecture" />
            </motion.div>
          </div>
        </section>

        {/* 03 MARKETPLACE SECTION */}
       <section id="marketplace" className="py-24 bg-[#f8f8f8] px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="italic font-serif text-[#a88d5e] mb-2">Resident Services</p>
              <h2 className="text-5xl font-serif text-[#1f1b16]">COMMUNITY MARKETPLACE</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {marketplace.slice(0, 3).map((item) => (
                <MarketplaceCard 
                  key={item.id}
                  icon={<StoreIcon />} 
                  title={item.item_name} 
                  desc={item.description} 
                  btn={`Contact: ${item.contact_no}`} 
                />
              ))}
            </div>
          </div>
        </section>

        {/* 04 CARNIVAL SECTION */}
       <section id="carnival" className="py-24 bg-[#1f1b16] text-white px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <p className="italic font-serif text-[#a88d5e] mb-2">Community Life</p>
              <h2 className="text-5xl font-serif uppercase tracking-widest">Carnivals & Events</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {carnivals.slice(0, 3).map((event) => (
                <EventCard 
                  key={event.id}
                  date={new Date(event.event_date).getDate()} 
                  month={new Date(event.event_date).toLocaleString('en-US', { month: 'short' }).toUpperCase()} 
                  title={event.event_title} 
                  desc={event.description} 
                  tag={`${event.total_stalls} STALLS`} 
                />
              ))}
            </div>
            
          </div>
            <div className="flex justify-center">
      <a 
        href="/carnivals" 
        className="px-12 py-4 bg-[#a88d5e] text-white font-serif uppercase tracking-[0.2em] text-sm hover:bg-[#1f1b16] transition-colors duration-300 shadow-lg"
      >
        View All Carnivals
      </a>
    </div>
        </section>

        {/* 05 PHOTO TOUR */}
     <section id="phototour" className="py-24 bg-white">
          <div className="text-center mb-16"><h2 className="text-5xl font-serif text-[#1f1b16] uppercase">Photo Tour</h2></div>
          <div className="max-w-6xl mx-auto px-4 flex items-stretch h-[500px]">
            <button onClick={prevSlide} className="w-24 bg-[#1f1b16] text-white hidden md:flex flex-col items-center justify-center gap-4 hover:bg-[#a88d5e] transition-colors group">
              <span className="italic text-xs opacity-60">Prev</span>
              <span className="uppercase tracking-widest font-serif [writing-mode:vertical-lr] rotate-180">Tour</span>
              <ArrowLeft size={16} className="text-[#a88d5e] group-hover:text-white" />
            </button>
            <div className="flex-1 relative overflow-hidden shadow-2xl bg-gray-100">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={currentSlide} 
                  src={gallery[currentSlide]?.image_path || galleryImages[0]} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  className="w-full h-full object-cover" 
                  alt="Gallery" 
                />
              </AnimatePresence>
            </div>
            <button onClick={nextSlide} className="w-24 bg-[#1f1b16] text-white hidden md:flex flex-col items-center justify-center gap-4 hover:bg-[#a88d5e] transition-colors group">
              <span className="italic text-xs opacity-60">Next</span>
              <span className="uppercase tracking-widest font-serif [writing-mode:vertical-lr]">Tour</span>
              <ArrowRight size={16} className="text-[#a88d5e] group-hover:text-white" />
            </button>
          </div>
        </section>

        {/* 06 NEWS SECTION */}
   {/* 06 NEWS SECTION */}
{/* 06 NEWS SECTION */}
{/* 06 NEWS SECTION */}
<section id="news" className="py-24 bg-[#f8f8f8]">
  <div className="text-center mb-16">
    <h2 className="text-5xl font-serif text-[#1f1b16] uppercase">News & Articles</h2>
  </div>
  
  <div className="max-w-7xl mx-auto px-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
      {blogs.slice(0, 3).map((blog) => (
        <NewsCard 
          key={blog.id}
          id={blog.id}
          img={blog.images?.[0] || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600"} 
          date={new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
          title={blog.title} 
          desc={blog.content} 
        />
      ))}
    </div>

    {/* View All Button */}
    <div className="flex justify-center">
      <a 
        href="/blog" 
        className="px-12 py-4 bg-[#a88d5e] text-white font-serif uppercase tracking-[0.2em] text-sm hover:bg-[#1f1b16] transition-colors duration-300 shadow-lg"
      >
        View All Articles
      </a>
    </div>
  </div>
</section>

      </main>
    </div>
  );
};

// Sub-Components
const SidebarIcon = ({ icon, label, active = false }) => (
  <div className="relative group w-full h-20 flex items-center cursor-pointer transition-all duration-300">
    {/* The Icon Box - Changes color on hover or if active */}
    <div className={`w-20 h-20 flex items-center justify-center transition-colors duration-300 z-20
      ${active ? 'bg-[#a88d5e] text-white' : 'text-gray-500 group-hover:bg-[#a88d5e] group-hover:text-white'}`}>
      {icon}
    </div>
    
    {/* The Label Box - Slides out and connects perfectly to the icon box */}
    <div className="absolute left-20 h-20 
                    bg-[#a88d5e] text-white 
                    flex items-center px-8 /* Padding for that wide look */
                    text-xs font-bold uppercase tracking-widest 
                    /* Animation Logic */
                    opacity-0 invisible -translate-x-full
                    group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 
                    transition-all duration-500 ease-in-out z-10 whitespace-nowrap shadow-xl">
      {label}
    </div>
  </div>
);

const MarketplaceCard = ({ icon, title, desc, btn }) => (
  <motion.div whileHover={{ y: -5 }} className="bg-white p-10 text-center border border-gray-100 shadow-sm hover:border-[#a88d5e] transition-all">
    <div className="text-[#a88d5e] flex justify-center mb-6 scale-150">{icon}</div>
    <h3 className="font-serif text-2xl mb-4 text-[#1f1b16]">{title}</h3>
    <p className="text-gray-500 mb-8">{desc}</p>
    <button className="border border-[#a88d5e] text-[#a88d5e] px-6 py-2 uppercase text-xs font-bold hover:bg-[#a88d5e] hover:text-white transition-all">{btn}</button>
  </motion.div>
);

const EventCard = ({ date, month, title, desc, tag }) => (
  <div className="bg-white/5 border border-white/10 p-8 relative group hover:bg-white/10 transition-all border-l-4 border-l-[#a88d5e]">
    <div className="text-[#a88d5e] font-serif text-5xl mb-2">{date} <span className="text-sm text-gray-400 uppercase tracking-widest">{month}</span></div>
    <h3 className="text-xl font-serif mb-4">{title}</h3>
    <p className="text-gray-400 mb-6">{desc}</p>
    <span className="bg-[#a88d5e] text-[#1f1b16] px-3 py-1 text-[10px] font-bold">{tag}</span>
  </div>
);

const NewsCard = ({ id, img, date, title, desc }) => (
  <a href={`/blog/${id}`} className="block h-full"> 
    <motion.div 
      whileHover={{ y: -10 }} 
      className="bg-white group cursor-pointer shadow-sm h-full flex flex-col"
    >
      {/* Fixed Aspect Ratio for Images */}
      <div className="aspect-[16/10] overflow-hidden">
        <img 
          src={img} 
          alt={title} 
          className="w-full h-full object-cover grayscale-[50%] group-hover:grayscale-0 transition-all duration-700" 
        />
      </div>

      <div className="p-8 flex flex-col flex-1">
        <div className="text-[#a88d5e] font-serif italic text-sm mb-2">{date}</div>
        
        {/* Limit Title to exactly 2 lines */}
        <h3 className="text-xl font-serif mb-4 group-hover:text-[#a88d5e] transition-colors line-clamp-2 min-h-[3.5rem]">
          {title}
        </h3>
        
        {/* Limit Description to 3 lines for uniformity */}
        <p className="text-gray-500 text-sm mb-6 line-clamp-3">
          {desc}
        </p>

        <div className="mt-auto flex items-center gap-2 text-[#a88d5e] font-bold text-xs uppercase tracking-widest">
          Read More <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
        </div>
      </div>
    </motion.div>
  </a>
);
export default WindsorLiving;

