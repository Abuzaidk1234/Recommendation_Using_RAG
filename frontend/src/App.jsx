import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Search, Utensils, MessageSquare, Send, ArrowRightLeft, ArrowDown, Trash2, Code, User, Award } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function App() {
  const [activeTab, setActiveTab] = useState('search');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Advanced Search State
  const [cuisineFilter, setCuisineFilter] = useState('');
  const [calorieFilter, setCalorieFilter] = useState('');

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', content: "Hello! I'm the Cuisine Compass AI. Tell me what kind of food you're looking for, and I'll find the perfect dish for you!" }
  ]);
  const chatInputRef = useRef(null);
  const chatMessagesRef = useRef(null);

  // Compare State
  const [compareQuery1, setCompareQuery1] = useState('');
  const [compareQuery2, setCompareQuery2] = useState('');
  const [compareResult, setCompareResult] = useState(null);

  // Scroll State for Sticky Header
  const [isScrolled, setIsScrolled] = useState(false);
  const [navHeight, setNavHeight] = useState(200);
  
  const navRef = useRef(null);

  // Discover State
  const [selectedDish, setSelectedDish] = useState(null);
  const [discoverCategories, setDiscoverCategories] = useState([]);

  // Auth State
  const { isLoaded, isSignedIn, user } = useUser();

  // User History State
  const [userHistory, setUserHistory] = useState({ chats: [], comparisons: [] });
  const [historyTab, setHistoryTab] = useState('chats'); // 'chats' or 'comparisons'

  useEffect(() => {
    fetch(`${API_BASE}/discover`)
      .then(res => res.json())
      .then(data => setDiscoverCategories(data.categories))
      .catch(err => console.error("Error fetching discover categories:", err));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (navRef.current && !isScrolled) {
      setNavHeight(navRef.current.offsetHeight);
    }
  }, [isScrolled, activeTab]);

  const refreshHistory = () => {
    if (isSignedIn && user) {
      fetch(`${API_BASE}/history/${user.id}`)
        .then(res => res.json())
        .then(data => setUserHistory(data))
        .catch(err => console.error("Error fetching history:", err));
    } else {
      setUserHistory({ chats: [], comparisons: [] });
    }
  };

  const deleteHistoryItem = async (type, id) => {
    try {
      const response = await fetch(`${API_BASE}/history/${type}/${id}`, { method: 'DELETE' });
      if (response.ok) {
        refreshHistory();
      }
    } catch (error) {
      console.error("Error deleting history:", error);
    }
  };

  useEffect(() => {
    refreshHistory();
  }, [isSignedIn, user]);

  useEffect(() => {
    if (activeTab === 'chat') {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatHistory, activeTab]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflowY = ''; // Clear any lingering inline styles
  }, [activeTab]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [searchResults, activeTab, compareResult, discoverCategories]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery && !cuisineFilter && !calorieFilter) return;
    
    setLoading(true);
    setHasSearched(true);
    try {
      const payload = { query: searchQuery || "food", n_results: 5 };
      if (activeTab === 'advanced') {
        if (cuisineFilter) payload.cuisine_filter = cuisineFilter;
        if (calorieFilter) payload.max_calories = parseInt(calorieFilter);
      }
      
      const response = await axios.post(`${API_BASE}/search`, payload);
      setSearchResults(response.data.results);
    } catch (error) {
      console.error("Search error:", error);
    }
    setLoading(false);
  };

  const fetchHistory = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE}/history/${userId}`);
      setUserHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/chat`, { 
        query: userMessage,
        username: user?.id || null
      });
      setChatHistory(prev => [
        ...prev, 
        { role: 'ai', content: response.data.response, results: response.data.results }
      ]);
      if (user?.id) fetchHistory(user.id);
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error connecting to the server." }]);
    }
    setLoading(false);
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 100);
  };

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!compareQuery1 || !compareQuery2) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/compare`, { 
        query1: compareQuery1, 
        query2: compareQuery2,
        username: user?.id || null
      });
      setCompareResult(response.data);
      if (user?.id) fetchHistory(user.id);
    } catch (error) {
      console.error("Compare error:", error);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="app-container">
        <div className="hero-section">
          
          <div ref={navRef} className={`nav-container ${isScrolled ? 'scrolled' : ''}`}>
            <header className="header">
              <h1 className="title-pill">Cuisine Compass</h1>
              <p className="subtitle">Navigate your cravings with AI-powered recommendations</p>
            </header>
            
            <div className="auth-controls">
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="auth-button">Login / Sign Up</button>
                </SignInButton>
              </SignedOut>
            </div>

            <div className="nav-tabs">
              <button 
                className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`}
                onClick={() => { setActiveTab('search'); setSearchResults([]); setHasSearched(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                Basic Search
              </button>
              <button 
                className={`nav-tab ${activeTab === 'advanced' ? 'active' : ''}`}
                onClick={() => { setActiveTab('advanced'); setSearchResults([]); setHasSearched(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                Advanced Filter
              </button>
              <button 
                className={`nav-tab ${activeTab === 'compare' ? 'active' : ''}`}
                onClick={() => { setActiveTab('compare'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                Compare
              </button>
              <button 
                className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => { setActiveTab('chat'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                AI Assistant
              </button>
              {isSignedIn && (
                <button 
                  className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('history'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  History
                </button>
              )}
            </div>
          </div>

          {isScrolled && <div className="nav-placeholder" style={{ height: `${navHeight}px` }} />}

          {(activeTab === 'search' || activeTab === 'advanced') && (
            <div className="search-box glass-panel animate-on-scroll" style={{ width: '100%' }}>
              <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  className="glass-input search-input" 
                  style={{ width: '100%' }}
                  placeholder="What are you craving? (e.g., spicy pasta)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                {activeTab === 'advanced' && (
                  <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                    <input 
                      type="text" 
                      className="glass-input" 
                      placeholder="Cuisine (e.g. Italian)"
                      value={cuisineFilter}
                      onChange={(e) => setCuisineFilter(e.target.value)}
                    />
                    <input 
                      type="number" 
                      className="glass-input" 
                      placeholder="Max Calories (e.g. 300)"
                      value={calorieFilter}
                      onChange={(e) => setCalorieFilter(e.target.value)}
                    />
                  </div>
                )}
                
                <button type="submit" className="glass-button" disabled={loading}>
                  {loading ? 'Searching...' : 'Find Food'}
                </button>
              </form>

              <div className="main-content">
                {searchResults.length === 0 && hasSearched && !loading ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px', width: '100%', gridColumn: '1 / -1' }}>
                    <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>No matching food found</h3>
                    <p>Try adjusting your filters or using different keywords.</p>
                  </div>
                ) : (
                  searchResults.map((result, idx) => (
                    <div key={idx} className="result-card">
                      <h3 className="result-title">{result.food_name}</h3>
                      <div className="result-meta">
                        <span>🍽️ {result.cuisine_type}</span>
                        <span>🔥 {result.food_calories_per_serving} cal</span>
                        <span>✨ {(result.similarity_score * 100).toFixed(1)}% match</span>
                      </div>
                      <p className="result-desc">{result.food_description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="chat-container glass-panel animate-on-scroll">
              <div className="chat-messages" ref={chatMessagesRef}>
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`chat-message ${msg.role}`}>
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="chat-message ai">
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                )}
              </div>
              <form onSubmit={handleChat} className="chat-input-group">
                <input 
                  type="text" 
                  ref={chatInputRef}
                  className="glass-input" 
                  placeholder="Ask for recommendations naturally..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" className="glass-button icon-button" disabled={loading}>
                  <Send size={20} />
                </button>
              </form>
            </div>
          )}

          {activeTab === 'compare' && (
            <div className="compare-container glass-panel animate-on-scroll" style={{ width: '100%' }}>
              <form onSubmit={handleCompare} style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                  <input 
                    type="text" 
                    className="glass-input" 
                    style={{ flex: 1 }}
                    placeholder="Option 1 (e.g. Pasta)"
                    value={compareQuery1}
                    onChange={(e) => setCompareQuery1(e.target.value)}
                  />
                  <input 
                    type="text" 
                    className="glass-input" 
                    style={{ flex: 1 }}
                    placeholder="Option 2 (e.g. Pizza)"
                    value={compareQuery2}
                    onChange={(e) => setCompareQuery2(e.target.value)}
                  />
                </div>
                <button type="submit" className="glass-button" disabled={loading}>
                  {loading ? 'Comparing...' : 'Compare Options'}
                </button>
              </form>

              {compareResult && (
                <div className="compare-results animate-fade-in" style={{ marginTop: '32px' }}>
                  <div className="ai-analysis glass-panel">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-primary)' }}>
                      🤖 AI Analysis
                    </h3>
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{compareResult.response}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && isSignedIn && (
            <div className="history-container glass-panel animate-on-scroll">
              <div className="history-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
                <button 
                  className={`history-tab ${historyTab === 'chats' ? 'active' : ''}`}
                  onClick={() => setHistoryTab('chats')}
                >
                  Chat History
                </button>
                <button 
                  className={`history-tab ${historyTab === 'comparisons' ? 'active' : ''}`}
                  onClick={() => setHistoryTab('comparisons')}
                >
                  Comparison History
                </button>
              </div>

              {historyTab === 'chats' && (
                <div>
                  {userHistory.chats.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>No chat history yet.</p>
                  ) : (
                    <div className="history-list">
                      {userHistory.chats.map((chat, idx) => (
                        <div key={idx} className="history-card">
                          <div className="history-query"><strong>You:</strong> {chat.query}</div>
                          <div className="history-response">
                            <div className="markdown-body">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{chat.response}</ReactMarkdown>
                            </div>
                          </div>
                          <div className="history-date" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                            <span>{new Date(chat.created_at).toLocaleString()}</span>
                            <button 
                              onClick={() => deleteHistoryItem('chat', chat.id)} 
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4f', display: 'flex', alignItems: 'center', padding: 0 }}
                              title="Delete this chat"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {historyTab === 'comparisons' && (
                <div>
                  {userHistory.comparisons.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>No comparisons yet.</p>
                  ) : (
                    <div className="history-list">
                      {userHistory.comparisons.map((comp, idx) => (
                        <div key={idx} className="history-card">
                          <div className="history-query"><strong>Compare:</strong> {comp.query1} vs {comp.query2}</div>
                          <div className="history-response">
                            <div className="markdown-body">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{comp.response}</ReactMarkdown>
                            </div>
                          </div>
                          <div className="history-date" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                            <span>{new Date(comp.created_at).toLocaleString()}</span>
                            <button 
                              onClick={() => deleteHistoryItem('compare', comp.id)} 
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4f', display: 'flex', alignItems: 'center', padding: 0 }}
                              title="Delete this comparison"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {activeTab === 'search' && (
        <section className="recommendations-section">
          <div className="recommendations-content-wrapper">
            <h2 className="section-title">Discover New Flavors</h2>
            <div className="recommendations-grid">
              {discoverCategories.length > 0 ? discoverCategories.map((cat, i) => (
                <div 
                  key={cat.categoryId} 
                  className="category-card" 
                  style={{ transitionDelay: `${i * 100}ms` }}
                  onClick={() => setSelectedDish(cat.dish)}
                >
                  <div className="category-image">
                    <span className="category-title">{cat.categoryTitle}</span>
                  </div>
                  <div className="category-content">
                    <h3 className="dish-name">{cat.dish.food_name}</h3>
                    <div className="dish-tags" style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', color: '#ffffff', fontWeight: '500' }}>
                        {cat.dish.cuisine_type}
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', color: '#ffffff', fontWeight: '500' }}>
                        {cat.dish.food_calories_per_serving} kcal
                      </span>
                    </div>
                    <p className="dish-desc">{cat.dish.food_description}</p>
                  </div>
                </div>
              )) : [1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="placeholder-card" style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="placeholder-image"></div>
                  <div className="placeholder-content">
                    <div className="placeholder-line"></div>
                    <div className="placeholder-line short"></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="project-credits glass-panel" style={{ marginTop: '40px', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h4 className="credits-title" style={{ marginBottom: '16px' }}>PROJECT CREDITS</h4>
              
              <div className="credits-summary" style={{ marginBottom: '24px', maxWidth: '800px' }}>
                <p>
                  An advanced food recommendation system demonstrating similarity search, 
                  metadata filtering, and a Retrieval-Augmented Generation (RAG) chatbot 
                  using Chroma DB and Gemini API to provide intelligent, contextual recommendations.
                </p>
                <p style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  Please note: This project is not meant for high-traffic public use. It serves to demonstrate an understanding of how RAG works with LLMs.
                </p>
              </div>

              <p className="credits-info" style={{ marginBottom: '24px' }}>
                <span className="credits-name" style={{ fontWeight: '600' }}>Abuzaid Khan</span>
                <span className="credits-divider" style={{ margin: '0 12px', color: 'var(--text-secondary)' }}>|</span>
                <span className="credits-degree">Bachelors of Engineering in Artificial Intelligence and Machine Learning</span>
              </p>

              <div className="credits-links" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <a href="https://github.com/Abuzaidk1234" target="_blank" rel="noopener noreferrer" className="credit-link glass-button" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '50px', textDecoration: 'none', color: '#ffffff' }}>
                  <Code size={18} /> GitHub
                </a>
                <a href="https://www.linkedin.com/in/abuzaid-khan-b08998279" target="_blank" rel="noopener noreferrer" className="credit-link glass-button" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '50px', textDecoration: 'none', color: '#ffffff' }}>
                  <User size={18} /> LinkedIn
                </a>
                <a href="https://coursera.org/share/c3235cf4cbb32323b3daf924a3d48ce8" target="_blank" rel="noopener noreferrer" className="credit-link glass-button certificate-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '50px', textDecoration: 'none', color: '#ffffff' }}>
                  <Award size={18} /> Coursera Certificate
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {selectedDish && (
        <div className="modal-overlay" onClick={() => setSelectedDish(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedDish(null)}>&times;</button>
            <h2 className="modal-title">{selectedDish.food_name}</h2>
            <div className="modal-tags">
              <span className="modal-tag">{selectedDish.cuisine_type}</span>
              <span className="modal-tag">{selectedDish.food_calories_per_serving} kcal</span>
            </div>
            <p className="modal-desc">{selectedDish.food_description}</p>
            
            <div className="modal-section">
              <h3>Ingredients</h3>
              <p>{selectedDish.food_ingredients}</p>
            </div>
            
            <div className="modal-section">
              <h3>Cooking Method</h3>
              <p>{selectedDish.cooking_method}</p>
            </div>

            <div className="modal-section">
              <h3>Health Benefits</h3>
              <p>{selectedDish.food_health_benefits}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
