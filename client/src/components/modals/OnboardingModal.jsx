import React, { useState } from 'react';
import { aiAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import {
  Sparkles,
  Target,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  X,
  Layers,
  Compass,
  Flame,
  Zap,
  Trophy
} from 'lucide-react';

const COMMON_PATTERNS = [
  'HashMap',
  'Two Pointers',
  'Sliding Window',
  'Prefix Sum',
  'Binary Search',
  'Trees & BFS/DFS',
  'Graphs',
  'Dynamic Programming'
];

const STEP_MOTIVATIONAL_NOTES = {
  1: "🔥 Google, Meta & Microsoft don't test memorization — they test pattern recognition. Setting your foundation accurately helps us tailor your path to top-tier offers!",
  2: "🚀 Consistency beats intensity! 2 problems a day = 730 problems a year. That is more than enough to crack FAANG & Tier-1 technical rounds with confidence!",
  3: "⚡ Depth-First Mastery ensures you master 1 core pattern (≥70% solve rate) before moving on — eliminating the surprise weaknesses that cause interview rejections!"
};

export default function OnboardingModal({ isOpen, onClose, onComplete, initialProfile }) {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [experienceLevel, setExperienceLevel] = useState(
    initialProfile?.experienceLevel || user?.learningProfile?.experienceLevel || 'Beginner'
  );
  const [startFromScratch, setStartFromScratch] = useState(
    (initialProfile?.knownPatterns || user?.learningProfile?.knownPatterns || []).length === 0
  );
  const [knownPatterns, setKnownPatterns] = useState(
    initialProfile?.knownPatterns || user?.learningProfile?.knownPatterns || []
  );
  const [dailyGoal, setDailyGoal] = useState(
    initialProfile?.dailyGoal || user?.learningProfile?.dailyGoal || 2
  );
  const [preferredStrategy, setPreferredStrategy] = useState(
    initialProfile?.preferredStrategy || user?.learningProfile?.preferredStrategy || 'depth-first'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();

  if (!isOpen) return null;

  const togglePattern = (pat) => {
    if (knownPatterns.includes(pat)) {
      setKnownPatterns(knownPatterns.filter((p) => p !== pat));
    } else {
      setKnownPatterns([...knownPatterns, pat]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await aiAPI.saveOnboarding({
        experienceLevel,
        knownPatterns: startFromScratch ? [] : knownPatterns,
        dailyGoal,
        preferredStrategy
      });
      if (updateUser) {
        updateUser({
          learningProfile: {
            experienceLevel,
            knownPatterns: startFromScratch ? [] : knownPatterns,
            dailyGoal,
            preferredStrategy,
            onboardingCompleted: true
          },
          isOnboarded: true
        });
      }
      showToast('Learning plan saved! AI guide initialized.', 'success');
      if (onComplete) onComplete();
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to save learning plan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay open show animate-fade-in" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: 560, padding: '28px 32px', position: 'relative' }}>
        <button
          className="btn-icon-subtle"
          style={{ position: 'absolute', top: 16, right: 16 }}
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <div className="modal-header-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-tint)', padding: '4px 10px', borderRadius: 20, marginBottom: 12 }}>
          <Sparkles size={14} /> AI Learning Assistant Assessment
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
          Set Up Your Personal Learning Plan
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Tell us where you are in your DSA journey so our AI Engine can guide your daily practice and problem difficulty.
        </p>

        {/* Dynamic Motivational Note */}
        <div style={{ background: 'var(--surface-2)', borderLeft: '3px solid var(--accent)', padding: '10px 14px', borderRadius: '0 var(--r-sm) var(--r-sm) 0', fontSize: 12.5, color: 'var(--text-main)', marginBottom: 20, lineHeight: 1.5 }}>
          {STEP_MOTIVATIONAL_NOTES[step]}
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 24 }}>
          <button
            type="button"
            className={`btn btn-sm ${step === 1 ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--r-md)', padding: '8px 12px', fontSize: 12.5 }}
            onClick={() => setStep(1)}
          >
            1. Experience
          </button>
          <button
            type="button"
            className={`btn btn-sm ${step === 2 ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--r-md)', padding: '8px 12px', fontSize: 12.5 }}
            onClick={() => setStep(2)}
          >
            2. Daily Pace
          </button>
          <button
            type="button"
            className={`btn btn-sm ${step === 3 ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--r-md)', padding: '8px 12px', fontSize: 12.5 }}
            onClick={() => setStep(3)}
          >
            3. Strategy
          </button>
        </div>

        {/* STEP 1: Experience & Known Topics */}
        {step === 1 && (
          <div className="animate-fade-in">
            <label className="form-label" style={{ fontWeight: 700, marginBottom: 10, display: 'block', color: 'var(--text)' }}>
              Where are you starting from?
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div
                className={`choice-card ${startFromScratch ? 'active' : ''}`}
                onClick={() => { setStartFromScratch(true); setExperienceLevel('Beginner'); }}
                style={{
                  padding: 16,
                  border: startFromScratch ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  cursor: 'pointer',
                  background: startFromScratch ? 'var(--accent-tint)' : 'var(--surface-2)'
                }}
              >
                <BookOpen size={20} style={{ color: 'var(--accent)', marginBottom: 8 }} />
                <h4 style={{ margin: '0 0 4px', fontSize: 14, color: 'var(--text)' }}>Start from Scratch</h4>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
                  I want to learn pattern-by-pattern starting with foundational questions.
                </p>
              </div>

              <div
                className={`choice-card ${!startFromScratch ? 'active' : ''}`}
                onClick={() => setStartFromScratch(false)}
                style={{
                  padding: 16,
                  border: !startFromScratch ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  cursor: 'pointer',
                  background: !startFromScratch ? 'var(--accent-tint)' : 'var(--surface-2)'
                }}
              >
                <Layers size={20} style={{ color: 'var(--accent)', marginBottom: 8 }} />
                <h4 style={{ margin: '0 0 4px', fontSize: 14, color: 'var(--text)' }}>I Know Some Patterns</h4>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
                  Select the patterns you already feel comfortable with.
                </p>
              </div>
            </div>

            {!startFromScratch && (
              <div style={{ marginTop: 14 }}>
                <label className="form-label" style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                  Select patterns you already know:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {COMMON_PATTERNS.map((pat) => {
                    const selected = knownPatterns.includes(pat);
                    return (
                      <button
                        key={pat}
                        type="button"
                        className={`badge ${selected ? 'badge-primary' : 'badge-neutral'}`}
                        style={{ cursor: 'pointer', padding: '6px 12px', fontSize: 12 }}
                        onClick={() => togglePattern(pat)}
                      >
                        {selected ? '✓ ' : '+ '} {pat}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                Skip for now
              </button>
              <button className="btn btn-primary" onClick={() => setStep(2)}>
                Next: Daily Pace <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Daily Target Pace */}
        {step === 2 && (
          <div className="animate-fade-in">
            <label className="form-label" style={{ fontWeight: 700, marginBottom: 8, display: 'block', color: 'var(--text)' }}>
              How many problems do you want to target daily?
            </label>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Consistency beats intensity. We recommend 2 problems daily (1 new problem + 1 revision).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
              {[1, 2, 3, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`btn ${dailyGoal === num ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 8px' }}
                  onClick={() => setDailyGoal(num)}
                >
                  <span style={{ fontSize: 22, fontWeight: 800 }}>{num}</span>
                  <span style={{ fontSize: 11, opacity: 0.8 }}>{num === 1 ? 'prob / day' : 'probs / day'}</span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" onClick={() => setStep(1)}>
                  Back
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                  Skip for now
                </button>
              </div>
              <button className="btn btn-primary" onClick={() => setStep(3)}>
                Next: Strategy <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Learning Strategy */}
        {step === 3 && (
          <div className="animate-fade-in">
            <label className="form-label" style={{ fontWeight: 700, marginBottom: 10, display: 'block', color: 'var(--text)' }}>
              Choose your AI Learning Strategy:
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <div
                className={`choice-card ${preferredStrategy === 'depth-first' ? 'active' : ''}`}
                onClick={() => setPreferredStrategy('depth-first')}
                style={{
                  padding: 16,
                  border: preferredStrategy === 'depth-first' ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  cursor: 'pointer',
                  background: preferredStrategy === 'depth-first' ? 'var(--accent-tint)' : 'var(--surface-2)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Target size={18} style={{ color: 'var(--accent)' }} />
                  <strong style={{ fontSize: 15, color: 'var(--text)' }}>Depth-First Mastery (Recommended)</strong>
                </div>
                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Focus on 1 basic pattern (e.g. Two Pointers) until you achieve <strong>Strong Mastery ($\ge 70\%$)</strong>, then seamlessly advance to the next pattern.
                </p>
              </div>

              <div
                className={`choice-card ${preferredStrategy === 'breadth-first' ? 'active' : ''}`}
                onClick={() => setPreferredStrategy('breadth-first')}
                style={{
                  padding: 16,
                  border: preferredStrategy === 'breadth-first' ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  cursor: 'pointer',
                  background: preferredStrategy === 'breadth-first' ? 'var(--accent-tint)' : 'var(--surface-2)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Compass size={18} style={{ color: 'var(--accent)' }} />
                  <strong style={{ fontSize: 15, color: 'var(--text)' }}>Breadth-First Exploration</strong>
                </div>
                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Explore ~5 foundational questions across various patterns, schedule periodic revisions, and then dive into deeper difficulty levels.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" onClick={() => setStep(2)}>
                  Back
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                  Skip for now
                </button>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Initializing Plan...' : 'Save & Start AI Learning Plan'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
