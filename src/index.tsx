import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom"
import Leaderboard from "./LeaderboardComp"

import "./index.css"

import mockDataComplete from "./mocks/code_complete.json"
import mockDataExpalin from "./mocks/code_expalin.json"

const CombinedPanel = () => {
  return (
    <div className="combined-panel">
      <div className="about-section">
        <h3>About Code-MT-Bench</h3>
        <p>
        <span className="news-MT-Bench">Code MT-Bench</span> is a comprehensive benchmark designed for code-related multi-turn dialogues. 
          Unlike existing benchmarks that focus on single-turn code generation, our dataset comprises 2,500 samples across <strong>41 programming languages </strong>
          (including Python, Java, and C++) with conversations spanning 1-20 turns. 
          We employ hybrid evaluation through code execution for programming tasks and LLM-as-a-Judge for open-domain responses. 
          The benchmark is complemented by <span className="news-MT-Bench">CodeMT-Instruct</span>, a 100K-sample instruction corpus for model training and improvement.
          This leaderboard tracks model performance in code-focused conversations for the AI and programming communities.
        </p>
      </div>
      <div className="divider"></div>
      <div className="news-section">
        <h3>News 🚀</h3>
        <div className="news-content">
          <p><span className="news-date">May. 15, 2025</span> 🔥🔥 We officially released the Code-MT-Bench and CodeMT-Instruct datasets on Hugging Face! Code-MT-Bench focuses on multi-turn dialogue capabilities for code, covering a wide range of programming tasks across <strong>41 programming languages</strong> with dialogue lengths from 1 to 20 turns. The dataset consists of <strong>2,500</strong> carefully constructed test instances with hybrid evaluation methodologies.</p>
        </div>
      </div>
      <div className="divider"></div>
      <div className="challenges-section">
        <h3>Challenges from Code-MT-Bench</h3>
        <div className="challenges-content">
            <p><strong>1. Multi-turn code development</strong> requires maintaining context and evolving implementations across extended dialogues.</p>
            <p><strong>2. Cross-language programming</strong> demands fluency across diverse programming languages and paradigms.</p>
            <p><strong>3. Incremental debugging</strong> involves identifying and fixing errors through progressive dialogue interaction.</p>
            <p><strong>4. Hybrid evaluation</strong> combines objective code execution with subjective assessment of explanation quality.</p>
        </div>
      </div>
      <div className="divider"></div>
      <div className="submission-section">
        <h3>Submission 🤗</h3>
        <div className="submission-content">
          We warmly welcome submissions to our leaderboard, including both your own methods and contributions showcasing the latest model performance! Code MT-Bench features two separate leaderboards. Please refer to the Submission Guidelines below for details, and submit your results as instructed to <a href="mailto:codemtbench2025@gmail.com">codemtbench2025@gmail.com</a>.
        </div>
        <button className="submission-button" onClick={() => alert('Submission Guidelines coming soon!')}>
          Submission Guidelines
        </button>
      </div>
      <div className="credit-section">
      🫶🏻 This website is an improved version based on the original source code from <a href="https://mceval.github.io/leaderboard.html" target="_blank" rel="noreferrer">MC-EVAL</a> and <a href="https://tablebench.github.io/" target="_blank" rel="noreferrer">TableBench</a>!
    </div>
    </div>
  );
};

const CitationPanel = () => {
  const [activeFormat, setActiveFormat] = useState<'bibtex' | 'apa' | 'mla'>('bibtex');
  const [copyStatus, setCopyStatus] = useState('Copy');

  // Citation formats
  const citationFormats: Record<'bibtex' | 'apa' | 'mla', string> = {
    bibtex: `@inproceedings{yang2025codemt,
    title={Code-MT-Bench: Scaling and Evaluating Code Large Language Models in Multi-Turn Dialogues},
    author={Anonymous Author(s)},
    booktitle={Proceedings of the Neural Information Processing Systems Conference},
    pages={},
    year={2025},
    publisher={NeurIPS Foundation}
}`,
    apa: `Anonymous Author(s). (2025). Code-MT-Bench: Scaling and evaluating code large language models in multi-turn dialogues. In Proceedings of the Neural Information Processing Systems Conference (NeurIPS 2025). NeurIPS Foundation.`,
    mla: `Anonymous Author(s). "Code-MT-Bench: Scaling and Evaluating Code Large Language Models in Multi-Turn Dialogues." Proceedings of the Neural Information Processing Systems Conference, NeurIPS Foundation, 2025.`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(citationFormats[activeFormat])
      .then(() => {
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus('Copy'), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className="citation-panel">
      <h3>Citation</h3>
      <div className="citation-format-buttons">
        <button 
          className={`format-button ${activeFormat === 'bibtex' ? 'is-active' : ''}`}
          onClick={() => setActiveFormat('bibtex')}
        >
          BibTeX
        </button>
        <button 
          className={`format-button ${activeFormat === 'apa' ? 'is-active' : ''}`}
          onClick={() => setActiveFormat('apa')}
        >
          APA
        </button>
        <button 
          className={`format-button ${activeFormat === 'mla' ? 'is-active' : ''}`}
          onClick={() => setActiveFormat('mla')}
        >
          MLA
        </button>
      </div>
      <div className="citation-content">
        <button 
          className={`copy-button ${copyStatus === 'Copied!' ? 'copied' : ''}`}
          onClick={handleCopy}
        >
          {copyStatus}
        </button>
        {citationFormats[activeFormat]}
      </div>
    </div>
  );
};

const LeaderboardTabs = () => {
  // State to track the currently selected tab
  const [activeTab, setActiveTab] = useState('tab1');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedColumn, setHighlightedColumn] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Removed isMobile state setting
    };

    window.addEventListener('resize', handleResize);
    
    // Reset search and highlight when page is refreshed
    const handleBeforeUnload = () => {
      setSearchTerm('');
      setHighlightedColumn(null);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Function to get all searchable columns (excluding Model, Rank, AVG, AWK)
  const getSearchableColumns = () => {
    const currentData = activeTab === 'tab1' ? mockDataComplete : mockDataExpalin;
    if (currentData && currentData.performances && currentData.performances.length > 0) {
      return Object.keys(currentData.performances[0]).filter(
        key => !['model', 'Rank', 'AVG', 'AWK'].includes(key)
      );
    }
    return [];
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      setHighlightedColumn(null);
      return;
    }
    
    // Filter columns based on search term
    const searchableColumns = getSearchableColumns();
    const filteredSuggestions = searchableColumns.filter(
      column => column.toLowerCase().includes(value.toLowerCase())
    );
    
    setSuggestions(filteredSuggestions);
    setShowSuggestions(filteredSuggestions.length > 0);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: string) => {
    setSearchTerm(suggestion);
    setHighlightedColumn(suggestion);
    setShowSuggestions(false);
  };

  // Reset search
  const resetSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setHighlightedColumn(null);
    setShowSuggestions(false);
  };

  // Effect to reset search when tab changes
  useEffect(() => {
    resetSearch();
  }, [activeTab]);

  // Function to render the leaderboard based on the selected tab
  const renderLeaderboard = () => {
    switch (activeTab) {
      case 'tab1':
        return <Leaderboard theme={{ base: "light" }} args={[mockDataComplete, "domain", highlightedColumn]} />;
      case 'tab2':
        return <Leaderboard theme={{ base: "light" }} args={[mockDataExpalin, "language", highlightedColumn]} />;
      default:
        return <div>Select a tab</div>;
    }
  };
  
  return (
    <div>
      <div className="tabs-container">
        <div className="tab-content">
          <div className="table-selector">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder={activeTab === 'tab1' ? "search domain..." : "search language..."}
                value={searchTerm}
                onChange={handleSearchChange}
                onClick={() => setShowSuggestions(searchTerm.trim() !== '' && suggestions.length > 0)}
              />
              {showSuggestions && (
                <div className="suggestions-dropdown">
                  {suggestions.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className="suggestion-item"
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
              {searchTerm && (
                <button className="clear-search" onClick={resetSearch}>×</button>
              )}
            </div>
            <button 
              className={`selector-button ${activeTab === 'tab1' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('tab1')}
            >
              Domain Specific
            </button>
            <button 
              className={`selector-button ${activeTab === 'tab2' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('tab2')}
            >
              Language Specific
            </button>
          </div>
          {renderLeaderboard()}
        </div>
      </div>
      <CitationPanel />
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <section className="hero-header">
      <div className="hero-body">
        <div className="container is-fluid">
          <div className="columns is-fullwidth">
            <div className="column has-text-centered is-fullwidth">
              <h1 className="title is-1 publication-title">
                <img src="./images/ChatGPT-icon-removebg-preview.png" alt="LLM Icon" className="title-icon" />
                <strong style={{fontWeight: 1000}}>Code-MT-Bench</strong>
              </h1>
              <h2 className="subtitle" style={{marginTop: "-30px"}}>
                <strong>A Comprehensive Benchmark for Code Multi-Turn Dialogues</strong>
              </h2>
              <div className="publication-links">
                <span className="link-block">
                  <a onClick={() => alert('Coming soon! Will be updated shortly.')}
                    className="external-link button is-normal is-rounded is-dark">
                    <span className="icon">
                      <i className="fas fa-file-pdf"></i>
                    </span>
                    <span>Paper</span>
                  </a>
                </span>

                <span className="link-block">
                  <a onClick={() => alert('Coming soon! Will be updated shortly.')}
                    className="external-link button is-normal is-rounded is-dark">
                    <span className="icon">
                      <i className="fab fa-github"></i>
                    </span>
                    <span>Code</span>
                  </a>
                </span>

                <span className="link-block">
                  <a onClick={() => alert('Coming soon! Will be updated shortly.')}
                    className="external-link button is-normal is-rounded is-dark">
                    <span className="icon">
                      <i className="far fa-images"></i>
                    </span>
                    <span>Evaluation Data</span>
                  </a>
                </span>

                <span className="link-block">
                  <a onClick={() => alert('Coming soon! Will be updated shortly.')}
                    className="external-link button is-normal is-rounded is-dark">
                    <span className="icon">
                      <i className="far fa-images"></i>
                    </span>
                    <span>CodeMT-Instruct</span>
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <section className="main-content">
      <div className="container is-fluid">
        <div className="columns is-fullwidth">
          <div className="column is-fullwidth">
            <div className="content-layout">
              <CombinedPanel />
              <div>
                <LeaderboardTabs />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </React.StrictMode>,
  document.getElementById("root")
)