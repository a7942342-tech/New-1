
import React, { useState, useEffect, useRef } from 'react';
import { AppView, Anime, ChatMessage, Episode, Character } from './types';
import { geminiService } from './services/geminiService';
import { Button, Card, Input, Badge, Footer } from './components/Shared';

const INITIAL_ANIME: Anime[] = [
  {
    id: '1',
    title: 'Naruto Shippuden (Hindi)',
    descriptionHindi: 'नारुतो उज़ुमाकी की कहानी जो होकागे बनने का सपना देखता है। इसमें एक्शन और भावनाओं का अद्भुत संगम है।',
    descriptionEnglish: 'The legendary journey of Naruto Uzumaki as he seeks to become the Hokage.',
    thumbnail: 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=1000&auto=format&fit=crop',
    genres: ['Action', 'Adventure', 'Ninjas'],
    dubbed: true,
    subbed: true,
    isSeries: true,
    episodes: [
      { id: 'ep1', episodeNumber: 1, title: 'Homecoming', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', sourceWebsite: 'AnimeWorld' }
    ],
    addedAt: Date.now()
  },
  {
    id: '2',
    title: 'Your Name (Hindi)',
    descriptionHindi: 'दो अजनबियों की कहानी जो रहस्यमय तरीके से एक-दूसरे के शरीर में बदलने लगते हैं। एक गहरी प्रेम कहानी।',
    descriptionEnglish: 'Two teenagers share a profound, magical connection upon discovering they are swapping bodies.',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
    genres: ['Romance', 'Drama', 'Supernatural'],
    dubbed: true,
    subbed: true,
    isSeries: false,
    episodes: [{ id: 'm1', episodeNumber: 1, title: 'Full Movie', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }],
    addedAt: Date.now()
  }
];

const MOODS = [
  { label: "Hyped ⚡", genre: "Action", color: "from-orange-500 to-red-600" },
  { label: "Emotional 💧", genre: "Romance", color: "from-pink-500 to-rose-600" },
  { label: "Adventurous 🗺️", genre: "Adventure", color: "from-emerald-500 to-teal-600" },
  { label: "Chilled 🌙", genre: "Slice of Life", color: "from-indigo-500 to-blue-600" }
];

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [animeList, setAnimeList] = useState<Anime[]>(INITIAL_ANIME);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  
  // States for anime details and news
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoadingChars, setIsLoadingChars] = useState(false);
  const [news, setNews] = useState<{text: string, sources: any[]}>({text: '', sources: []});
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [activeMood, setActiveMood] = useState<string | null>(null);

  // Added missing upload states to fix "Cannot find name" errors
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadPosterUrl, setUploadPosterUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (view === AppView.NEWS && !news.text) {
      fetchNews();
    }
  }, [view]);

  const fetchNews = async () => {
    setIsLoadingNews(true);
    try {
      const data = await geminiService.getLatestAnimeNews();
      setNews(data);
    } catch (e) { console.error(e); }
    finally { setIsLoadingNews(false); }
  };

  const loadCharacters = async (title: string) => {
    setIsLoadingChars(true);
    try {
      const data = await geminiService.getCharacterInfo(title);
      setCharacters(data);
    } catch (e) { console.error(e); }
    finally { setIsLoadingChars(false); }
  };

  const handleUpload = async () => {
    if (!uploadTitle.trim()) return;
    setIsUploading(true);
    try {
      // Use the gemini metadata generation service for the new anime post
      const metadata = await geminiService.generateAnimeMetadata(uploadTitle);
      const newAnime: Anime = {
        id: Date.now().toString(),
        title: uploadTitle,
        descriptionHindi: metadata.descriptionHindi,
        descriptionEnglish: metadata.descriptionEnglish,
        thumbnail: uploadPosterUrl || 'https://images.unsplash.com/photo-1578632738980-28c3fbf0698c?q=80&w=1000',
        genres: metadata.genres,
        dubbed: true,
        subbed: true,
        isSeries: true,
        episodes: [
          { id: `ep-${Date.now()}`, episodeNumber: 1, title: 'Trailer / Episode 1', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ],
        addedAt: Date.now()
      };
      setAnimeList(prev => [newAnime, ...prev]);
      setUploadTitle('');
      setUploadPosterUrl('');
      setView(AppView.DASHBOARD);
    } catch (e) {
      console.error("Upload failed", e);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredAnimeList = animeList.filter(anime => {
    const query = searchQuery.toLowerCase();
    const moodMatch = activeMood ? anime.genres.some(g => g.toLowerCase().includes(activeMood.toLowerCase())) : true;
    return moodMatch && (anime.title.toLowerCase().includes(query) || anime.genres.some(g => g.toLowerCase().includes(query)));
  });

  // Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'model', content: 'Namaste! Welcome to Anime Lover. How can I help you today?', timestamp: Date.now() }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleChat = async () => {
    if (!userInput.trim()) return;
    const msg = userInput;
    setUserInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: msg, timestamp: Date.now() }]);
    setIsTyping(true);
    try {
      const response = await geminiService.animeDostChat(msg, chatMessages);
      setChatMessages(prev => [...prev, { role: 'model', content: response, timestamp: Date.now() }]);
    } catch (err) { console.error(err); }
    finally { setIsTyping(false); }
  };

  return (
    <div className="min-h-screen flex bg-[#020617] text-slate-100 selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-20 md:w-64 bg-slate-950/90 backdrop-blur-3xl border-r border-white/5 flex flex-col z-[100]">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-2xl shadow-indigo-500/40">
              <span className="font-black text-xl">AL</span>
            </div>
            <h1 className="hidden md:block font-black text-xl tracking-tighter">Anime<span className="text-indigo-500">Lover</span></h1>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavBtn active={view === AppView.DASHBOARD || view === AppView.SERIES_DETAIL} onClick={() => setView(AppView.DASHBOARD)} icon="🏠" label="Discover" />
          <NavBtn active={view === AppView.NEWS} onClick={() => setView(AppView.NEWS)} icon="📰" label="Anime News" />
          <NavBtn active={view === AppView.CHAT} onClick={() => setView(AppView.CHAT)} icon="💬" label="AI Guide" />
          <NavBtn active={view === AppView.UPLOAD} onClick={() => setView(AppView.UPLOAD)} icon="📤" label="Post" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-20 md:ml-64 relative min-h-screen">
        <div className={`fixed inset-0 transition-colors duration-1000 opacity-20 pointer-events-none ${
          activeMood === 'Action' ? 'bg-orange-600 blur-[150px]' : 
          activeMood === 'Romance' ? 'bg-pink-600 blur-[150px]' : 
          'bg-indigo-600/10 blur-[150px]'
        }`} />

        <div className="relative z-10">
          
          {view === AppView.DASHBOARD && (
            <div className="animate-in fade-in duration-700">
              <section className="relative h-[60vh] w-full flex items-center px-10 md:px-20 overflow-hidden">
                <div className="relative max-w-3xl space-y-8">
                   <h2 className="text-7xl font-black tracking-tighter leading-none text-white">
                    FIND YOUR <br/>
                    <span className="text-indigo-500">DUBBED</span> VIBE.
                  </h2>
                  
                  {/* Mood Discovery Feature */}
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">How are you feeling today?</p>
                    <div className="flex flex-wrap gap-4">
                      {MOODS.map(mood => (
                        <button 
                          key={mood.label}
                          onClick={() => setActiveMood(activeMood === mood.genre ? null : mood.genre)}
                          className={`px-6 py-4 rounded-2xl font-bold transition-all border ${
                            activeMood === mood.genre 
                            ? `bg-gradient-to-br ${mood.color} text-white border-transparent scale-105 shadow-2xl` 
                            : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {mood.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <div className="px-10 md:px-20 pb-20 space-y-24">
                <section className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-black">{activeMood ? `${activeMood} Picks` : 'Latest Additions'}</h3>
                    <div className="relative group">
                       <Input 
                        placeholder="Search catalog..." 
                        value={searchQuery} 
                        onChange={setSearchQuery}
                        className="w-64 h-12 text-sm" 
                       />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {filteredAnimeList.map((anime) => (
                      <button 
                        key={anime.id} 
                        onClick={() => { setSelectedAnime(anime); setView(AppView.SERIES_DETAIL); loadCharacters(anime.title); }}
                        className="group relative flex flex-col text-left"
                      >
                        <div className="aspect-[2/3] w-full rounded-[2rem] overflow-hidden shadow-2xl bg-slate-900 border border-white/5 group-hover:border-indigo-500/50 group-hover:scale-[1.02] transition-all duration-500">
                          <img src={anime.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={anime.title} />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                          <div className="absolute bottom-8 left-8 right-8">
                            <h3 className="text-2xl font-black mb-1 leading-none text-white">{anime.title}</h3>
                            <Badge color="indigo">HINDI DUB</Badge>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
              <Footer />
            </div>
          )}

          {view === AppView.NEWS && (
            <div className="max-w-5xl mx-auto py-20 px-10 animate-in fade-in duration-500">
              <header className="mb-16">
                <Badge color="indigo">REAL-TIME UPDATES</Badge>
                <h2 className="text-6xl font-black mt-4">Anime <span className="text-indigo-500">News</span> India</h2>
                <p className="text-slate-400 mt-4 text-xl">Powered by Google Search & Gemini. Fresh updates on Hindi dubbing.</p>
              </header>

              {isLoadingNews ? (
                <div className="space-y-12 animate-pulse">
                  {[1,2,3].map(i => <div key={i} className="h-40 bg-white/5 rounded-[2.5rem]" />)}
                </div>
              ) : (
                <div className="space-y-12">
                   <Card className="p-10 bg-indigo-600/10 border-indigo-500/20">
                      <p className="text-xl leading-relaxed whitespace-pre-wrap">{news.text}</p>
                   </Card>
                   
                   <div className="space-y-4">
                      <h4 className="font-black text-slate-500 uppercase tracking-widest text-xs">Verified Sources</h4>
                      <div className="grid gap-2">
                        {news.sources.map((s, idx) => (
                          <a key={idx} href={s.web?.uri} target="_blank" rel="noopener noreferrer" className="p-4 glass rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors">
                            <span className="font-bold text-sm">{s.web?.title || 'External Source'}</span>
                            <span className="text-indigo-400 text-xs">Visit Website ↗</span>
                          </a>
                        ))}
                      </div>
                   </div>
                   <Button onClick={fetchNews} variant="secondary">Refresh News Feed</Button>
                </div>
              )}
              <Footer />
            </div>
          )}

          {view === AppView.SERIES_DETAIL && selectedAnime && (
            <div className="animate-in slide-in-from-bottom-10 duration-700 pb-20">
               <div className="relative h-[50vh] w-full overflow-hidden">
                  <img src={selectedAnime.thumbnail} className="w-full h-full object-cover blur-3xl opacity-20" alt="bg" />
                  <div className="absolute inset-0 bg-slate-950/60" />
                  <div className="absolute bottom-0 left-0 right-0 p-10 md:p-20 flex flex-col md:flex-row gap-12 items-end">
                     <img src={selectedAnime.thumbnail} className="w-56 aspect-[2/3] object-cover rounded-[2rem] shadow-2xl border border-white/10" alt="Poster" />
                     <div className="flex-1 space-y-6">
                        <h1 className="text-6xl font-black tracking-tighter text-white">{selectedAnime.title}</h1>
                        <div className="flex gap-4">
                          <Button variant="primary" onClick={() => { setActiveEpisode(selectedAnime.episodes![0]); setView(AppView.PLAYER); }}>Watch Now</Button>
                          <Button variant="secondary" onClick={() => setView(AppView.DASHBOARD)}>Return Home</Button>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="max-w-7xl mx-auto px-10 md:px-20 mt-16 space-y-20">
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">सारांश (Hindi Plot)</h2>
                        <p className="text-3xl font-medium text-slate-200 leading-relaxed">{selectedAnime.descriptionHindi}</p>
                     </div>
                     
                     <div className="space-y-8">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Character Explorer (AI)</h2>
                        {isLoadingChars ? (
                           <div className="flex gap-4">
                              {[1,2,3].map(i => <div key={i} className="w-40 h-56 bg-white/5 rounded-3xl animate-pulse" />)}
                           </div>
                        ) : (
                           <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar">
                              {characters.map((char, idx) => (
                                <Card key={idx} className="min-w-[200px] p-6 bg-white/5 border-white/5 shrink-0">
                                   <Badge color="indigo">{char.role}</Badge>
                                   <h4 className="font-black text-xl mt-3">{char.name}</h4>
                                   <p className="text-xs text-slate-400 mt-2 leading-relaxed">{char.description}</p>
                                </Card>
                              ))}
                           </div>
                        )}
                     </div>
                  </section>

                  <section className="space-y-8">
                     <h2 className="text-3xl font-black">Episodes</h2>
                     <div className="grid gap-4">
                        {selectedAnime.episodes?.map(ep => (
                          <button 
                            key={ep.id} 
                            onClick={() => { setActiveEpisode(ep); setView(AppView.PLAYER); }}
                            className="group flex items-center gap-6 p-6 glass rounded-3xl hover:bg-indigo-600 transition-all text-left"
                          >
                            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center font-black">
                              {ep.episodeNumber}
                            </div>
                            <h4 className="font-bold flex-1">{ep.title}</h4>
                            <span className="text-xs font-black opacity-40 group-hover:opacity-100">PLAY ▶</span>
                          </button>
                        ))}
                     </div>
                  </section>
               </div>
               <Footer />
            </div>
          )}

          {view === AppView.PLAYER && selectedAnime && activeEpisode && (
            <div className="animate-in fade-in duration-700 bg-slate-950 h-screen flex flex-col">
               <div className="p-8 flex items-center justify-between border-b border-white/5">
                  <button onClick={() => setView(AppView.SERIES_DETAIL)} className="font-bold text-slate-400 hover:text-white">← Stop Watching</button>
                  <div className="text-center">
                    <p className="text-xs font-black text-indigo-400">{selectedAnime.title.toUpperCase()}</p>
                    <p className="font-bold">EPISODE {activeEpisode.episodeNumber}: {activeEpisode.title}</p>
                  </div>
                  <Badge color="indigo">1080P • HINDI</Badge>
               </div>
               
               <div className="flex-1 bg-black relative">
                  <video controls autoPlay className="w-full h-full object-contain">
                     <source src={activeEpisode.videoUrl} type="video/mp4" />
                  </video>
                  {/* Ambilight Effect */}
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(79,70,229,0.2)]" />
               </div>
            </div>
          )}

          {view === AppView.CHAT && (
            <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col p-10">
               <div className="flex-1 glass rounded-[3rem] flex flex-col overflow-hidden shadow-2xl">
                  <div className="p-8 border-b border-white/5 bg-white/5 flex items-center gap-4">
                     <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl animate-float">🤖</div>
                     <div>
                        <h3 className="font-black text-xl">AnimeDost</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase">Hindi Dub Expert AI</p>
                     </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
                     {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[80%] px-6 py-4 rounded-[1.5rem] shadow-xl ${
                             msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/5 border border-white/5 rounded-tl-none'
                           }`}>
                              <p className="font-medium">{msg.content}</p>
                           </div>
                        </div>
                     ))}
                     {isTyping && <div className="text-indigo-400 font-black animate-pulse">Thinking...</div>}
                  </div>

                  <div className="p-8 bg-slate-950/50">
                     <div className="flex gap-4">
                        <Input 
                          placeholder="Ask anything about anime..." 
                          value={userInput} 
                          onChange={setUserInput} 
                          onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                        />
                        <Button onClick={handleChat}>Send</Button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {view === AppView.UPLOAD && (
            <div className="max-w-4xl mx-auto py-20 px-10">
               <h2 className="text-5xl font-black mb-12">Post New <span className="text-indigo-500">Content</span></h2>
               <Card className="p-10 space-y-8">
                  <Input placeholder="Series Title" value={uploadTitle} onChange={setUploadTitle} />
                  <Input placeholder="Poster URL" value={uploadPosterUrl} onChange={setUploadPosterUrl} />
                  <Button 
                    variant="primary" 
                    className="w-full h-16 text-xl" 
                    onClick={handleUpload}
                    isLoading={isUploading}
                  >
                    Add to Catalog
                  </Button>
               </Card>
            </div>
          )}

        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

const NavBtn: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold group ${
      active 
        ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30' 
        : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
    }`}
  >
    <span className="text-2xl transition-transform group-hover:scale-110">{icon}</span>
    <span className="hidden md:block whitespace-nowrap text-sm tracking-wide uppercase">{label}</span>
  </button>
);

export default App;
