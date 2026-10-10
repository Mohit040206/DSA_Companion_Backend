import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import AppBackground from '../components/layout/AppBackground';
import {
  Brain,
  Zap,
  Target,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Shield,
  UploadCloud,
  Code2,
  BarChart3,
  Layers,
  Sun,
  Moon,
  ChevronRight,
  Compass,
  FileText,
  Lock,
  Flame,
  Check
} from 'lucide-react';
import '../styles/landing.css';

// Import images from assets directory
import imgAnalytics from '../assets/landing/feature-analytics.png';
import imgCompanyPrep from '../assets/landing/feature-company-prep.png';
import imgPatterns from '../assets/landing/feature-patterns.png';
import imgInterview from '../assets/landing/feature-interview.png';
import imgImport from '../assets/landing/feature-import.png';
import imgRegister from '../assets/landing/feature-register.png';

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('patterns');

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const tabs = [
    { id: 'patterns', label: 'Pattern Engine', icon: Layers, img: imgPatterns },
    { id: 'company', label: 'Company Roadmaps', icon: Target, img: imgCompanyPrep },
    { id: 'interview', label: 'AI Mock Interview', icon: Code2, img: imgInterview },
    { id: 'analytics', label: 'Spaced Repetition', icon: Brain, img: imgAnalytics },
    { id: 'import', label: 'Batch Import', icon: UploadCloud, img: imgImport },
    { id: 'register', label: 'Onboarding', icon: Sparkles, img: imgRegister },
  ];

  const tabDetails = {
    patterns: {
      title: '15 Algorithmic Invariants & Archetype Mastery',
      tag: 'Pattern Engine',
      desc: 'Master the core invariant archetypes that unlock 400+ curated problems. Track solved, attempted, and mastered ratios with visual gauges.',
      img: imgPatterns,
      link: '#patterns',
      cta: 'Explore Patterns Deep Dive'
    },
    company: {
      title: 'Real-World 4-Week Company Preparation Sprints',
      tag: 'Company Intelligence',
      desc: 'Targeted preparation roadmaps synthesized from recent interview candidate loops at Amazon, Google, Meta, and Microsoft.',
      img: imgCompanyPrep,
      link: '#company-prep',
      cta: 'Explore Company Roadmaps'
    },
    interview: {
      title: 'AI-Assisted Live Mock Interview Simulation',
      tag: 'Live Coding Environment',
      desc: '45-minute timed technical mock exams with progressive hints that nudge your intuition without spoiling the answer.',
      img: imgInterview,
      link: '#mock-interview',
      cta: 'Explore Mock Interview'
    },
    analytics: {
      title: 'Ebbinghaus Spaced Repetition & Cognitive Telemetry',
      tag: 'Spaced Repetition',
      desc: 'Scientific memory decay curves schedule timely reviews right before you forget critical concepts and edge cases.',
      img: imgAnalytics,
      link: '#spaced-repetition',
      cta: 'Explore Telemetry & Retention'
    },
    import: {
      title: 'Zero-Friction Batch Record & History Migration',
      tag: 'Data Migration',
      desc: 'Seamlessly import your past attempts from LeetCode or personal spreadsheets with full timestamp and approach note preservation.',
      img: imgImport,
      link: '#import-records',
      cta: 'Explore Record Migration'
    },
    register: {
      title: 'Personalized Profile & Dream Company Targeting',
      tag: 'Frictionless Onboarding',
      desc: 'Under 30-second registration tailored to your current seniority and target companies. 100% private.',
      img: imgRegister,
      link: '#onboarding',
      cta: 'Create Free Account'
    }
  };

  return (
    <div className="landing-container">
      {/* Signature App Ambient Backdrop from Dashboard */}
      <AppBackground />
      <div className="landing-top-glow-wash" aria-hidden="true" />
      <div className="landing-dot-grid-enhanced" aria-hidden="true" />

      {/* Background ambient orbs */}
      <div className="landing-bg-decorations" aria-hidden="true">
        <div className="landing-orb landing-orb-1" />
        <div className="landing-orb landing-orb-2" />
        <div className="landing-orb landing-orb-3" />
        <div className="landing-orb landing-orb-4" />
      </div>

      {/* Navigation Bar */}
      <header className="landing-navbar">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-brand">
            <img
              src="/logo-mark.png"
              alt="Ancora"
              className="landing-brand-logo-img"
            />
            <span>Ancora</span>
            <span className="landing-brand-tag">v2.0 Cognitive</span>
          </Link>

          <nav className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#patterns" className="landing-nav-link">Patterns</a>
            <a href="#company-prep" className="landing-nav-link">Company Prep</a>
            <a href="#mock-interview" className="landing-nav-link">Mock Interview</a>
            <a href="#spaced-repetition" className="landing-nav-link">Spaced Repetition</a>
            <a href="#comparison" className="landing-nav-link">Comparison</a>
          </nav>

          <div className="landing-nav-actions">
            <button
              onClick={toggleTheme}
              className="landing-theme-toggle"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/auth/login" className="landing-btn-secondary">
              Sign In
            </Link>
            <Link to="/auth/register" className="landing-btn-primary">
              <span>Get Started</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-pill">
          <span className="landing-hero-pill-badge">Cognitive DSA</span>
          <span>Beyond mindless problem grinding</span>
        </div>

        <h1 className="landing-hero-title">
          They know your submissions.<br />
          <span className="landing-gradient-text">Ancora knows your journey.</span>
        </h1>

        <p className="landing-hero-subtitle">
          Ancora doesn't just remember which questions you solved. It remembers how you learned — 
          the edge cases that tripped you up, the intuition shifts that finally clicked, the forgetting decay curves, 
          and the pattern leaps. All engineered to make you an exceptional engineer.
        </p>

        <div className="landing-hero-actions">
          <Link to="/auth/register" className="landing-btn-primary landing-hero-btn-lg">
            <span>Start Preparing Free</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/auth/login" className="landing-btn-secondary landing-hero-btn-lg">
            <span>Explore Live Demo</span>
            <ChevronRight size={18} />
          </Link>
        </div>

        {/* Hero Trust Badges */}
        <div className="landing-hero-metrics">
          <div className="landing-hero-metric-item">
            <Sparkles size={18} className="landing-metric-icon" />
            <span><strong>400+</strong> Curated Problems</span>
          </div>
          <div className="landing-hero-metric-item">
            <Layers size={18} className="landing-metric-icon" />
            <span><strong>15</strong> Canonical Patterns</span>
          </div>
          <div className="landing-hero-metric-item">
            <Brain size={18} className="landing-metric-icon" />
            <span><strong>Ebbinghaus</strong> Decay Engine</span>
          </div>
          <div className="landing-hero-metric-item">
            <Target size={18} className="landing-metric-icon" />
            <span><strong>Real-World</strong> Company Sprints</span>
          </div>
        </div>

        {/* Hero Showcase Mockup with Ambient Glow & Floating Badges */}
        <div className="landing-hero-mockup-wrapper">
          <div className="landing-mockup-glow" />
          
          {/* Floating Callout Badges */}
          <div className="landing-floating-badge landing-floating-badge-1">
            <Brain size={20} color="#7C5CFC" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Memory Retention</div>
              <div style={{ color: 'var(--text)' }}>94% Retained (Decay Scheduled)</div>
            </div>
          </div>

          <div className="landing-floating-badge landing-floating-badge-2">
            <Zap size={20} color="#35B779" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pattern Mastery</div>
              <div style={{ color: 'var(--text)' }}>Monotonic Stack: Mastered</div>
            </div>
          </div>

          <div className="landing-mockup-card">
            <div className="landing-mockup-topbar">
              <div className="landing-mockup-dots">
                <span className="landing-mockup-dot landing-dot-red" />
                <span className="landing-mockup-dot landing-dot-yellow" />
                <span className="landing-mockup-dot landing-dot-green" />
              </div>
              <span className="landing-mockup-address">ancora.dev/analytics — Cognitive Memory & Mastery Telemetry</span>
              <div style={{ width: 44 }} />
            </div>
            <img
              src={imgAnalytics}
              alt="Ancora Cognitive Analytics & Spaced Repetition Engine"
              className="landing-mockup-img"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Interactive Feature Explorer Tabs */}
      <section className="landing-tab-explorer" id="features">
        <div className="landing-tabs-header">
          <span className="landing-section-eyebrow">Comprehensive Learning Architecture</span>
          <h2 className="landing-section-heading">Everything You Need to Master Technical Interviews</h2>
          <p className="landing-section-lead">
            Explore the six integrated engines built into Ancora to turn stressful coding drills into systematic, permanent retention.
          </p>
        </div>

        <div className="landing-tab-buttons">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`landing-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Interactive Tab Showcase Preview */}
        {tabDetails[activeTab] && (
          <div className="landing-tab-preview-card" key={activeTab}>
            <div className="landing-tab-preview-header">
              <div>
                <span className="landing-spotlight-badge">{tabDetails[activeTab].tag}</span>
                <h3 style={{ margin: '6px 0', fontSize: '1.35rem', fontWeight: 800 }}>{tabDetails[activeTab].title}</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.94rem' }}>{tabDetails[activeTab].desc}</p>
              </div>
              <a href={tabDetails[activeTab].link} className="landing-btn-secondary" style={{ flexShrink: 0, alignSelf: 'center' }}>
                <span>{tabDetails[activeTab].cta}</span>
                <ArrowRight size={14} />
              </a>
            </div>
            <div className="landing-tab-preview-img-wrap">
              <img src={tabDetails[activeTab].img} alt={tabDetails[activeTab].title} />
            </div>
          </div>
        )}
      </section>

      {/* Alternating Feature Spotlight Deep Dives */}
      <section className="landing-spotlights">
        
        {/* Spotlight 1: Algorithmic Pattern Engine */}
        <div className="landing-spotlight-item" id="patterns">
          <div className="landing-spotlight-text">
            <span className="landing-spotlight-badge">
              <Layers size={14} /> 01 / Pattern Architecture
            </span>
            <h3 className="landing-spotlight-title">
              Stop memorizing 500 solutions.<br />
              Master the 15 patterns that build them.
            </h3>
            <p className="landing-spotlight-desc">
              Blindly grinding hundreds of LeetCode problems leads to high fatigue and low retention. 
              Ancora categorizes 400+ problems into fundamental invariant archetypes — Two Pointers, 
              Sliding Window, Monotonic Stack, Interval Merging, and Fast & Slow Pointers.
            </p>
            <div className="landing-spotlight-points">
              <div className="landing-point-row">
                <CheckCircle2 size={18} className="landing-point-icon" />
                <span><strong>15 Canonical Invariants:</strong> Recognize identical problem topologies instantly beneath tricky wordings.</span>
              </div>
              <div className="landing-point-row">
                <CheckCircle2 size={18} className="landing-point-icon" />
                <span><strong>Visual Mastery Meters:</strong> Real-time progress bars tracking your solved, attempted, and mastered ratios per archetype.</span>
              </div>
              <div className="landing-point-row">
                <CheckCircle2 size={18} className="landing-point-icon" />
                <span><strong>Pattern Cheat Sheets:</strong> Key trigger conditions, common pitfalls, and canonical time/space bounds for every archetype.</span>
              </div>
            </div>
            <Link to="/auth/register" className="landing-btn-secondary" style={{ marginTop: 8 }}>
              Explore Pattern Directory <ArrowRight size={14} />
            </Link>
          </div>
          <div className="landing-spotlight-visual">
            <div className="landing-visual-frame">
              <img src={imgPatterns} alt="Algorithmic Pattern Directory" className="landing-visual-img" />
            </div>
          </div>
        </div>

        {/* Spotlight 2: Company Prep Engine */}
        <div className="landing-spotlight-item reverse" id="company-prep">
          <div className="landing-spotlight-text">
            <span className="landing-spotlight-badge">
              <Target size={14} /> 02 / Company Intelligence
            </span>
            <h3 className="landing-spotlight-title">
              Targeted 4-week roadmaps synthesized from real interview loops.
            </h3>
            <p className="landing-spotlight-desc">
              Every tech giant has distinct technical biases. Ancora synthesizes live public candidate experiences 
              and interview debriefs for top engineering tiers (Amazon, Google, Meta, Microsoft, Uber) into structured, 
              week-by-week preparation sprints.
            </p>
            <div className="landing-spotlight-points">
              <div className="landing-point-row">
                <CheckCircle2 size={18} className="landing-point-icon" />
                <span><strong>4-Week Milestones:</strong> Structured pacing from Foundational Patterns to Advanced Graph/DP edge cases.</span>
              </div>
              <div className="landing-point-row">
                <CheckCircle2 size={18} className="landing-point-icon" />
                <span><strong>Real Candidate Debriefs:</strong> Key patterns, tricky follow-ups, and behavioral themes reported in recent loops.</span>
              </div>
              <div className="landing-point-row">
                <CheckCircle2 size={18} className="landing-point-icon" />
                <span><strong>Dynamic Frequency Weighting:</strong> Prioritize high-yield topics specific to your target company’s bar.</span>
              </div>
            </div>
            <Link to="/auth/register" className="landing-btn-secondary" style={{ marginTop: 8 }}>
              Generate Company Roadmap <ArrowRight size={14} />
            </Link>
          </div>
          <div className="landing-spotlight-visual">
            <div className="landing-visual-frame">
              <img src={imgCompanyPrep} alt="Company Preparation Roadmaps" className="landing-visual-img" />
            </div>
          </div>
        </div>

        {/* Spotlight 3: Live Mock Interview Mode */}
        <div className="landing-spotlight-item" id="mock-interview">
          <div className="landing-spotlight-text">
            <span className="landing-spotlight-badge">
              <Code2 size={14} /> 03 / Live Mock Environment
            </span>
            <h3 className="landing-spotlight-title">
              Realistic pressure. Progressive hints. Zero spoiled answers.
            </h3>
            <p className="landing-spotlight-desc">
              Practice in a real 45-minute timed exam environment with an integrated code editor and test suite. 
              Stuck on a tricky edge case? Our tiered AI assistant guides your intuition without giving away the complete implementation.
            </p>
            <div className="landing-spotlight-points">
              <div className="landing-point-row">
                <CheckCircle2 size={18} className="landing-point-icon" />
                <span><strong>Tiered Progressive Hints:</strong> Gentle Intuition → Algorithmic Direction → Edge Case Warnings.</span>
              </div>
              <div className="landing-point-row">
                <CheckCircle2 size={18} className="landing-point-icon" />
                <span><strong>Syntax Highlighted Editor:</strong> Code in Python, JavaScript, C++, or Java with live execution test cases.</span>
              </div>
              <div className="landing-point-row">
                <CheckCircle2 size={18} className="landing-point-icon" />
                <span><strong>Complexity Review:</strong> Automatic Big-O time and space complexity evaluation upon submission.</span>
              </div>
            </div>
            <Link to="/auth/register" className="landing-btn-secondary" style={{ marginTop: 8 }}>
              Try Mock Interview Mode <ArrowRight size={14} />
            </Link>
          </div>
          <div className="landing-spotlight-visual">
            <div className="landing-visual-frame">
              <img src={imgInterview} alt="AI-Assisted Live Mock Interview" className="landing-visual-img" />
            </div>
          </div>
        </div>

        {/* Spotlight 4: Ebbinghaus Spaced Repetition */}
        <div className="landing-spotlight-item reverse" id="spaced-repetition">
          <div className="landing-spotlight-text">
            <span className="landing-spotlight-badge">
              <Brain size={14} /> 04 / Spaced Repetition Engine
            </span>
            <h3 className="landing-spotlight-title">
              Retain what you solve forever with mathematical decay modeling.
            </h3>
            <p className="landing-spotlight-desc">
              The human brain rapidly sheds memory unless reinforced at critical mathematical intervals. 
              Ancora implements the scientific Ebbinghaus forgetting curve formula (R = e^(-t/S)) to schedule timely, 
              lightweight reviews before your retention drops below optimal threshold.
            </p>
            <div className="landing-spotlight-points">
              <div className="landing-point-row">
                <CheckCircle2 size={18} className="landing-point-icon" />
                <span><strong>Smart Revision Queue:</strong> Daily prioritized revision cards ensuring no solved concept goes stale.</span>
              </div>
              <div className="landing-point-row">
                <CheckCircle2 size={18} className="landing-point-icon" />
                <span><strong>Mastery Telemetry:</strong> Accuracy by difficulty breakdown, speed trajectory, and cognitive confidence curves.</span>
              </div>
              <div className="landing-point-row">
                <CheckCircle2 size={18} className="landing-point-icon" />
                <span><strong>Adaptive Intervals:</strong> Intervals expand automatically as your confidence and speed increase.</span>
              </div>
            </div>
            <Link to="/auth/register" className="landing-btn-secondary" style={{ marginTop: 8 }}>
              View Analytics & Decay Engine <ArrowRight size={14} />
            </Link>
          </div>
          <div className="landing-spotlight-visual">
            <div className="landing-visual-frame">
              <img src={imgAnalytics} alt="Ebbinghaus Spaced Repetition Telemetry" className="landing-visual-img" />
            </div>
          </div>
        </div>

        {/* Spotlight 5: Batch Attempt & Record Import */}
        <div className="landing-spotlight-item" id="import-records">
          <div className="landing-spotlight-text">
            <span className="landing-spotlight-badge">
              <UploadCloud size={14} /> 05 / Seamless Migration
            </span>
            <h3 className="landing-spotlight-title">
              Bring your past progress with you in seconds.
            </h3>
            <p className="landing-spotlight-desc">
              Never abandon your hard-earned practice history. Batch import your previous attempt logs, markdown notes, 
              or CSV/JSON exports from LeetCode or personal spreadsheets. Ancora automatically reconciles your history with its pattern taxonomy.
            </p>
            <div className="landing-spotlight-points">
              <div className="landing-point-row">
                <CheckCircle2 size={18} className="landing-point-icon" />
                <span><strong>Zero-Friction Ingestion:</strong> Paste JSON or markdown logs with automatic schema validation and preview.</span>
              </div>
              <div className="landing-point-row">
                <CheckCircle2 size={18} className="landing-point-icon" />
                <span><strong>History Preservation:</strong> Retain original timestamps, approach notes, time spent, and confidence ratings.</span>
              </div>
              <div className="landing-point-row">
                <CheckCircle2 size={18} className="landing-point-icon" />
                <span><strong>Instant Taxonomy Mapping:</strong> Imported problems automatically map to pattern progress bars and revision queues.</span>
              </div>
            </div>
            <Link to="/auth/register" className="landing-btn-secondary" style={{ marginTop: 8 }}>
              Import Your Records <ArrowRight size={14} />
            </Link>
          </div>
          <div className="landing-spotlight-visual">
            <div className="landing-visual-frame">
              <img src={imgImport} alt="Batch Attempt & Record Import" className="landing-visual-img" />
            </div>
          </div>
        </div>

        {/* Spotlight 6: Frictionless Onboarding */}
        <div className="landing-spotlight-item reverse" id="onboarding">
          <div className="landing-spotlight-text">
            <span className="landing-spotlight-badge">
              <Sparkles size={14} /> 06 / Personalized Profiling
            </span>
            <h3 className="landing-spotlight-title">
              Tailored to your current role and dream company.
            </h3>
            <p className="landing-spotlight-desc">
              Register in under 30 seconds. Choose your target company (Google, Amazon, Meta, Stripe) and current experience level. 
              Ancora initializes your personal cognitive workspace with curated recommendations from day one.
            </p>
            <div className="landing-spotlight-points">
              <div className="landing-point-row">
                <CheckCircle2 size={18} className="landing-point-icon" />
                <span><strong>Target Company Focus:</strong> Receive specialized question suggestions aligned with your target company's bar.</span>
              </div>
              <div className="landing-point-row">
                <CheckCircle2 size={18} className="landing-point-icon" />
                <span><strong>Private & Secure:</strong> Zero telemetry leakage. Your attempt history and notes belong entirely to you.</span>
              </div>
              <div className="landing-point-row">
                <CheckCircle2 size={18} className="landing-point-icon" />
                <span><strong>Light & Dark Native:</strong> Beautiful ergonomics that adapt comfortably to your work environment.</span>
              </div>
            </div>
            <Link to="/auth/register" className="landing-btn-primary" style={{ marginTop: 8 }}>
              Create Your Account Free <ArrowRight size={14} />
            </Link>
          </div>
          <div className="landing-spotlight-visual">
            <div className="landing-visual-frame">
              <img src={imgRegister} alt="Ancora Account Registration" className="landing-visual-img" />
            </div>
          </div>
        </div>

      </section>

      {/* Comparison Matrix: Traditional vs. Ancora */}
      <section className="landing-comparison-section" id="comparison">
        <div className="landing-tabs-header">
          <span className="landing-section-eyebrow">The Cognitive Advantage</span>
          <h2 className="landing-section-heading">Traditional Grinding vs. Ancora Cognitive Engine</h2>
          <p className="landing-section-lead">
            Why high-performing engineers are replacing fragmented spreadsheets and mindless drills with Ancora.
          </p>
        </div>

        <div className="landing-comparison-table-wrapper">
          <div className="landing-comparison-grid">
            <div className="landing-comp-cell header">Core Dimension</div>
            <div className="landing-comp-cell header traditional">Traditional DSA Practice</div>
            <div className="landing-comp-cell header ancora">Ancora Cognitive Engine</div>

            <div className="landing-comp-cell feature-name">Learning Philosophy</div>
            <div className="landing-comp-cell traditional">Rote problem memorization & brute-force lists</div>
            <div className="landing-comp-cell ancora-highlight">
              <Check size={16} color="var(--accent)" />
              15 Canonical Invariant Archetypes
            </div>

            <div className="landing-comp-cell feature-name">Long-Term Retention</div>
            <div className="landing-comp-cell traditional">Random re-solving or forgotten in 2 weeks</div>
            <div className="landing-comp-cell ancora-highlight">
              <Check size={16} color="var(--accent)" />
              Scientific Ebbinghaus Spaced Repetition
            </div>

            <div className="landing-comp-cell feature-name">Company Preparation</div>
            <div className="landing-comp-cell traditional">Static, outdated lists from years ago</div>
            <div className="landing-comp-cell ancora-highlight">
              <Check size={16} color="var(--accent)" />
              Web-researched 4-week company sprints
            </div>

            <div className="landing-comp-cell feature-name">Hint System</div>
            <div className="landing-comp-cell traditional">Immediate solution spoiler or stuck for hours</div>
            <div className="landing-comp-cell ancora-highlight">
              <Check size={16} color="var(--accent)" />
              Tiered progressive AI intuition hints
            </div>

            <div className="landing-comp-cell feature-name">History & Migration</div>
            <div className="landing-comp-cell traditional">Notes scattered across text files & sheets</div>
            <div className="landing-comp-cell ancora-highlight">
              <Check size={16} color="var(--accent)" />
              One-click batch import & unified telemetry
            </div>

            <div className="landing-comp-cell feature-name">Mock Interview Readiness</div>
            <div className="landing-comp-cell traditional">Passive reading without timed pressure</div>
            <div className="landing-comp-cell ancora-highlight">
              <Check size={16} color="var(--accent)" />
              45-minute live timed coding simulation
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto / Cognitive Philosophy Quote */}
      <section className="landing-manifesto-section">
        <div className="landing-manifesto-card">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Brain size={24} color="var(--accent)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)', textTransform: 'uppercase' }}>
              The Ancora Philosophy
            </span>
          </div>
          <p className="landing-manifesto-quote">
            "Ancora shouldn't just remember which questions you solved. It should remember how you learned. 
            The mistakes you made, the concepts that finally clicked, the patterns you struggled with, 
            the confidence you built — all of that should help you become a better engineer."
          </p>
          <div className="landing-manifesto-author">
            <span className="landing-manifesto-name">Ancora Core Architecture</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span className="landing-manifesto-role">Engineered for Lifelong Mastery</span>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="landing-final-cta-section">
        <div className="landing-final-cta-card">
          <h2 className="landing-final-cta-title">
            Ready to transform how you learn DSA?
          </h2>
          <p className="landing-final-cta-sub">
            Join software engineers preparing with cognitive clarity, structured company roadmaps, and permanent retention.
          </p>
          <div className="landing-final-cta-actions">
            <Link to="/auth/register" className="landing-btn-primary landing-hero-btn-lg">
              <span>Create Your Free Account</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/auth/login" className="landing-btn-secondary landing-hero-btn-lg">
              <span>Sign In to Dashboard</span>
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-col">
            <Link to="/" className="landing-brand" style={{ marginBottom: 16 }}>
              <img
                src="/logo-mark.png"
                alt="Ancora"
                className="landing-brand-logo-img"
              />
              <span>Ancora</span>
            </Link>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: 320 }}>
              The Cognitive DSA & Technical Interview Platform. Remembering how you learn to make you an exceptional engineer.
            </p>
          </div>

          <div className="landing-footer-col">
            <h4>Engines</h4>
            <ul className="landing-footer-links">
              <li><a href="#patterns" className="landing-footer-link">Pattern Directory</a></li>
              <li><a href="#company-prep" className="landing-footer-link">Company Roadmaps</a></li>
              <li><a href="#mock-interview" className="landing-footer-link">Mock Interview Mode</a></li>
              <li><a href="#spaced-repetition" className="landing-footer-link">Spaced Repetition</a></li>
              <li><a href="#import-records" className="landing-footer-link">Batch Record Import</a></li>
            </ul>
          </div>

          <div className="landing-footer-col">
            <h4>Platform</h4>
            <ul className="landing-footer-links">
              <li><Link to="/auth/login" className="landing-footer-link">Sign In</Link></li>
              <li><Link to="/auth/register" className="landing-footer-link">Create Account</Link></li>
              <li><a href="#comparison" className="landing-footer-link">Comparison Matrix</a></li>
              <li><a href="#features" className="landing-footer-link">Feature Overview</a></li>
            </ul>
          </div>

          <div className="landing-footer-col">
            <h4>System</h4>
            <ul className="landing-footer-links">
              <li style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)', fontSize: '0.84rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                All Systems Operational
              </li>
              <li>
                <button
                  onClick={toggleTheme}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                  <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <span>© {new Date().getFullYear()} Ancora. Built for engineers who care about how they learn.</span>
          <span>Privacy · Terms · Open Source Invariants</span>
        </div>
      </footer>
    </div>
  );
}
