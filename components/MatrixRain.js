import { useEffect, useRef } from 'react';

export default function MatrixRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set initial canvas size
    const setCanvasSize = () => {
      const { innerWidth, innerHeight } = window;
      const { devicePixelRatio = 1 } = window;
      
      // Set display size
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      
      // Set actual size in memory (scaled for devices with higher pixel ratios)
      canvas.width = innerWidth * devicePixelRatio;
      canvas.height = innerHeight * devicePixelRatio;
      
      // Scale the context to ensure correct drawing operations
      context.scale(devicePixelRatio, devicePixelRatio);
    };
    
    setCanvasSize();

    // Characters to use
    const matrix = "ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゔゕゖ゚゛゜ゝゞゟ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const characters = matrix.split('');

    const fontSize = 14; // Reduced font size
    const columns = Math.floor(canvas.width / fontSize);

    // Create drops array for each column
    const drops = new Array(columns).fill(0);

    // Drawing the characters
    function draw() {
      // Set semi-transparent black background
      context.fillStyle = 'rgba(0, 0, 0, 0.05)';
      context.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

      // Set text style
      context.fillStyle = '#0F0';
      context.font = `${fontSize}px monospace`;
      context.textAlign = 'center';

      // Loop over drops
      for(let i = 0; i < drops.length; i++) {
        // Generate random character
        const char = characters[Math.floor(Math.random() * characters.length)];

        // Add subtle glow effect
        context.shadowBlur = 2;
        context.shadowColor = '#0F0';

        // Draw the character
        const x = i * fontSize + fontSize/2;
        const y = drops[i] * fontSize;
        context.fillText(char, x, y);

        // Reset glow effect
        context.shadowBlur = 0;

        // Reset drop if it's at the bottom or randomly
        if (drops[i] * fontSize > canvas.height / window.devicePixelRatio && Math.random() > 0.99) {
          drops[i] = 0;
        }

        // Slower fall speed
        drops[i] += Math.random() * 0.5;
      }
    }

    // Debounce resize handler
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setCanvasSize();
        // Reset drops when resizing
        drops.length = Math.floor(canvas.width / fontSize);
        drops.fill(0);
      }, 250);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop with controlled frame rate
    let lastTime = 0;
    const fps = 30;
    const interval = 1000 / fps;

    function animate(currentTime) {
      const delta = currentTime - lastTime;

      if (delta > interval) {
        lastTime = currentTime - (delta % interval);
        draw();
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    let animationFrameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 -z-10 bg-black"
      style={{ 
        imageRendering: 'pixelated',
        willChange: 'transform' // Optimize performance
      }} 
    />
  );
}