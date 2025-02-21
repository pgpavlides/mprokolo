'use client';

import { useEffect, useRef } from 'react';

export default function MatrixRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set initial canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    // Characters to use
    const matrix = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const characters = matrix.split('');

    const fontSize = 34;
    const columns = Math.floor(canvas.width / fontSize);

    // Create drops array for each column
    const drops = new Array(columns).fill(0);

    // Update canvas size when window resizes
    window.addEventListener('resize', setCanvasSize);

    // Drawing the characters
    function draw() {
      // Set semi-transparent black background
      context.fillStyle = 'rgba(0, 0, 0, 0.05)';
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Set text style
      context.fillStyle = '#0F0';
      context.font = fontSize + 'px monospace';

      // Loop over drops
      for(let i = 0; i < drops.length; i++) {
        // Generate random character
        const char = characters[Math.floor(Math.random() * characters.length)];

        // Add glow effect
        context.shadowBlur = 5;
        context.shadowColor = '#0F0';

        // Draw the character
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        context.fillText(char, x, y);

        // Reset glow effect
        context.shadowBlur = 0;

        // Reset drop if it's at the bottom or randomly
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }

        // Slower fall by reducing the increment of drops[i]
        if (Math.random() > 0.98) {
          drops[i]++; // Reduce the increment for slower fall
        }
      }
    }

    // Animation loop
    let animationFrameId;
    const animate = () => {
      draw();
      animationFrameId = window.requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full -z-10" 
      style={{ 
        background: 'black',
        imageRendering: 'pixelated'
      }} 
    />
  );
}
