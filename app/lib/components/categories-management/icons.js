// app/lib/components/categories-management/icons.js
import React from 'react';
import * as FaIcons from 'react-icons/fa';

// Export both availableIcons and renderIcon
export const availableIcons = {
  folder: FaIcons.FaFolder,
  code: FaIcons.FaCode,
  book: FaIcons.FaBook,
  tools: FaIcons.FaTools,
  link: FaIcons.FaLink,
  globe: FaIcons.FaGlobe,
  database: FaIcons.FaDatabase,
  cloud: FaIcons.FaCloud,
  cog: FaIcons.FaCog,
  brain: FaIcons.FaBrain,
  robot: FaIcons.FaRobot,
  palette: FaIcons.FaPalette,
  pen: FaIcons.FaPen,
  chart: FaIcons.FaChartBar,
  gamepad: FaIcons.FaGamepad,
  shield: FaIcons.FaShieldAlt
};

export const renderIcon = (iconName) => {
  const IconComponent = availableIcons[iconName] || availableIcons.folder;
  return <IconComponent />;
};