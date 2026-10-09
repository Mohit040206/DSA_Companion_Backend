import React from 'react';
import './AppBackground.css';

/**
 * AppBackground - High-end ambient backdrop for inside pages.
 * Carefully balanced for both Dark and Light mode.
 * Zero layout collisions, zero text overlaps, zero CPU overhead.
 */
export default function AppBackground() {
  return (
    <div className="app-ambient-backdrop" aria-hidden="true">
      {/* 1. Atmospheric Ambient Glow Fields */}
      <div className="ambient-aurora aurora-violet" />
      <div className="ambient-aurora aurora-cyan" />
      <div className="ambient-aurora aurora-bottom" />

      {/* 2. Micro Blueprint Engineering Grid */}
      <div className="ambient-dot-grid" />
    </div>
  );
}
