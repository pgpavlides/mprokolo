// app/lib/components/categories-management/icons.js
import React from 'react';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as IoIcons from 'react-icons/io5';
import * as GiIcons from 'react-icons/gi';

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
  shield: FaIcons.FaShieldAlt,
  home: MdIcons.MdHome,
  star: FaIcons.FaStar,
  heart: FaIcons.FaHeart,
  music: FaIcons.FaMusic,
  camera: FaIcons.FaCamera,
  car: FaIcons.FaCar,
  airplane: FaIcons.FaPlane,
  bicycle: FaIcons.FaBicycle,
  wine: FaIcons.FaWineGlassAlt,
  coffee: FaIcons.FaCoffee,
  apple: FaIcons.FaApple,
  android: FaIcons.FaAndroid,
  basketball: FaIcons.FaBasketballBall,
  football: FaIcons.FaFootballBall,
  // You can add many more icons as needed...
};

export const renderIcon = (iconName) => {
  const IconComponent = availableIcons[iconName] || availableIcons.folder;
  // Return a larger icon in a flex container to ensure proper centering
  return (
    <div className="flex items-center justify-center w-full h-full">
      <IconComponent style={{ fontSize: '2.5rem' }} /> {/* Increase icon size */}
    </div>
  );
};