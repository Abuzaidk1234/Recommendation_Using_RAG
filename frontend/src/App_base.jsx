import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Search, Utensils, MessageSquare, Send, ArrowRightLeft } from 'lucide-react';
import ThreeBackground from './components/ThreeBackground';

const API_BASE = 'http://localhost:8000/api';

function App() {
  const [activeTab, setActiveTab] = useState('search');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Advanced Search State
  const [cuisineFilter, setCuisineFilter] = useState('');
  const [calorieFilter, setCalorieFilter] = useState('');

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', content: "Hello! I'm the Cuisine Compass AI. Tell me what kind of food you're looking for, and I'll find the perfect dish for you!" }
  ]);
  const chatEndRef = useRef(null);

  // Compare State
  const [compareQuery1, setCompareQuery1] = useState('');
  const [compareQuery2, setCompareQuery2] = useState('');
  const [compareResult, setCompareResult] = useState(null);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, activeTab]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setLoading(true);
    try {
      const payload = { query: searchQuery, n_results: 5 };
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

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/chat`, { query: userMessage });
      setChatHistory(prev => [
        ...prev, 
        { role: 'ai', content: response.data.response, results: response.data.results }
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error connecting to the server." }]);
    }
    setLoading(false);
  };

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!compareQuery1 || !compareQuery2) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/compare`, { 
        query1: compareQuery1, 
        query2: compareQuery2 
      });
      setCompareResult(response.data);
    } catch (error) {
      console.error("Compare error:", error);
    }
    setLoading(false);
  };

  return (
    <>
      <ThreeBackground />
      
      <div className="app-container">
        <header className="header">
          <h1>Cuisine Compass</h1>
          <p>Navigate your cravings with AI-powered recommendations</p>
        </header>

        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => { setActiveTab('search'); setSearchResults([]); }}
          >
            <Search size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
            Basic Search
          </button>
          <button 
            className={`nav-tab ${activeTab === 'advanced' ? 'active' : ''}`}
            onClick={() => { setActiveTab('advanced'); setSearchResults([]); }}
          >
            <Utensils size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
            Advanced Filter
          </button>
          <button 
            className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
            AI Chatbot
          </button>
          <button 
            className={`nav-tab ${activeTab === 'compare' ? 'active' : ''}`}
            onClick={() => setActiveTab('compare')}
          >
            <ArrowRightLeft size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
            Compare
          </button>
        </div>

        <main className="glass-panel">
          {(activeTab === 'search' || activeTab === 'advanced') && (
            <div>
              <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="What are you craving? (e.g. chocolate dessert, spicy pasta)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                {activeTab === 'advanced' && (
                  <div style={{ display: 'flex', gap: '16px' }}>
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
                {searchResults.map((result, idx) => (
                  <div key={idx} className="result-card">
                    <h3 className="result-title">{result.food_name}</h3>
                    <div className="result-meta">
                      <span>🏷️ {result.cuisine_type}</span>
                      <span>🔥 {result.food_calories_per_serving} cal</span>
                      <span>✨ {(result.similarity_score * 100).toFixed(1)}% match</span>
                    </div>
                    <p className="result-desc">{result.food_description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="chat-container">
              <div className="chat-messages">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`chat-message ${msg.role}`}>
                    {msg.role === 'ai' ? '🤖 ' : '👤 '}
                    {msg.content}
                    
                    {msg.results && msg.results.length > 0 && (
                      <div style={{ marginTop: '12px', fontSize: '0.9em' }}>
                        <strong>Top Matches:</strong>
                        <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                          {msg.results.map((r, i) => (
                            <li key={i}>{r.food_name} ({r.cuisine_type}, {r.food_calories_per_serving} cal)</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleChat} className="chat-input-group">
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="Ask for recommendations naturally..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" className="glass-button" disabled={loading}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}

          {activeTab === 'compare' && (
            <div>
              <form onSubmit={handleCompare} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <input 
                    type="text" 
                    className="glass-input" 
                    placeholder="Query 1 (e.g. healthy breakfast)"
                    value={compareQuery1}
                    onChange={(e) => setCompareQuery1(e.target.value)}
                  />
                  <input 
                    type="text" 
                    className="glass-input" 
                    placeholder="Query 2 (e.g. sweet dessert)"
                    value={compareQuery2}
                    onChange={(e) => setCompareQuery2(e.target.value)}
                  />
                </div>
                <button type="submit" className="glass-button" disabled={loading}>
                  {loading ? 'Analyzing...' : 'Compare Options'}
                </button>
              </form>

              {compareResult && (
                <div style={{ marginTop: '24px' }}>
                  <div className="result-card" style={{ marginBottom: '24px' }}>
                    <h3 className="result-title">🤖 AI Analysis</h3>
                    <p className="result-desc" style={{ whiteSpace: 'pre-wrap' }}>{compareResult.response}</p>
                  </div>
                  
                  <div className="main-content">
                    <div>
                      <h4 style={{ color: 'var(--text-secondary)' }}>Matches for Query 1</h4>
                      {compareResult.results1.map((r, i) => (
                        <div key={i} className="result-card">
                          <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{r.food_name}</h4>
                          <span style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>{(r.similarity_score * 100).toFixed(0)}% match</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 style={{ color: 'var(--text-secondary)' }}>Matches for Query 2</h4>
                      {compareResult.results2.map((r, i) => (
                        <div key={i} className="result-card">
                          <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{r.food_name}</h4>
                          <span style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>{(r.similarity_score * 100).toFixed(0)}% match</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default App;