import React from 'react';
import { useUrlSync } from '../hooks/useUrlSync';
import { useThemeEffects } from '../hooks/useThemeEffects';

const GlobalThemeManager: React.FC = () => {
  // Encapsulated Logic
  useUrlSync();
  useThemeEffects();

  return null; // Headless component
};

export default GlobalThemeManager;
