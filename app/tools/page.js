"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import MatrixRain from "@/components/MatrixRain";

// A simple modal component
function InfoModal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/repos", {
          cache: "no-store",
          headers: {
            pragma: "no-cache",
            "cache-control": "no-cache",
          },
        });
0
        if (!response.ok && response.status === 401) {
          window.location.href = "/api/auth";
        }
      } catch (err) {
        console.error("Auth check error:", err);
      }
    };

    checkAuth();
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Modal overlay */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      {/* Modal content */}
      <div className="bg-gray-900 p-6 rounded-lg relative z-10 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4 text-green-400">{title}</h2>
        <div className="text-green-200">{children}</div>
        <button
          onClick={onClose}
          className="mt-4 px-3 py-1 bg-green-700 text-green-200 rounded hover:bg-green-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function ToolsPage() {
  // Two state variables to control each modal
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [visualizeModalOpen, setVisualizeModalOpen] = useState(false);

  // Code snippet for the 3D DOM Viewer tool (all ${...} have been escaped)
  const viewerCode = `// 3D Dom viewer, copy-paste this into your console to visualise the DOM as a stack of solid blocks.
// You can also minify and save it as a bookmarklet (https://www.freecodecamp.org/news/what-are-bookmarklets/)
(() => {
  const SHOW_SIDES = false; // color sides of DOM nodes?
  const COLOR_SURFACE = true; // color tops of DOM nodes?
  const COLOR_RANDOM = false; // randomise color?
  const COLOR_HUE = 190; // hue in HSL (https://hslpicker.com)
  const MAX_ROTATION = 180; // set to 360 to rotate all the way round
  const THICKNESS = 20; // thickness of layers
  const DISTANCE = 10000; // ¯\\_(ツ)_/¯

  function getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 50 + Math.floor(Math.random() * 30);
    const lightness = 40 + Math.floor(Math.random() * 30);
    return \`hsl(\\\${hue}, \\\${saturation}%, \\\${lightness}%)\`;
  }

  const getDOMDepth = element =>
    [...element.children].reduce((max, child) => Math.max(max, getDOMDepth(child)), 0) + 1;
  const domDepthCache = getDOMDepth(document.body);
  const getColorByDepth = (depth, hue = 0, lighten = 0) =>
    \`hsl(\\\${hue}, 75%, \\\${Math.min(10 + depth * (1 + 60 / domDepthCache), 90) + lighten}%)\`;

  // Apply initial styles to the body to enable 3D perspective
  const body = document.body;
  body.style.overflow = "visible";
  body.style.transformStyle = "preserve-3d";
  body.style.perspective = DISTANCE;
  const perspectiveOriginX = window.innerWidth / 2;
  const perspectiveOriginY = window.innerHeight / 2;
  body.style.perspectiveOrigin = body.style.transformOrigin = \`\\\${perspectiveOriginX}px \\\${perspectiveOriginY}px\`;
  traverseDOM(body, 0, 0, 0);

  document.addEventListener("mousemove", (event) => {
    const rotationY = MAX_ROTATION * (1 - event.clientY / window.innerHeight) - (MAX_ROTATION / 2);
    const rotationX = MAX_ROTATION * event.clientX / window.innerWidth - (MAX_ROTATION / 2);
    body.style.transform = \`rotateX(\\\${rotationY}deg) rotateY(\\\${rotationX}deg)\`;
  });

  // Create side faces for an element to give it a 3D appearance
  function createSideFaces(element, color) {
    if (!SHOW_SIDES) { return }
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    const fragment = document.createDocumentFragment();

    // Helper function to create and style a face
    const createFace = ({ width, height, transform, transformOrigin, top, left, right, bottom }) => {
      const face = document.createElement('div');
      face.className = 'dom-3d-side-face';
      Object.assign(face.style, {
        transformStyle: "preserve-3d",
        backfaceVisibility: 'hidden',
        position: 'absolute',
        width: \`\\\${width}px\`,
        height: \`\\\${height}px\`,
        background: color,
        transform,
        transformOrigin,
        overflow: 'hidden',
        willChange: 'transform',
        top,
        left,
        right,
        bottom
      });
      fragment.appendChild(face);
    };

    // Top face
    createFace({
      width,
      height: THICKNESS,
      transform: \`rotateX(-270deg) translateY(-\\\${THICKNESS}px)\`,
      transformOrigin: 'top',
      top: '0px',
      left: '0px',
    });

    // Right face
    createFace({
      width: THICKNESS,
      height,
      transform: 'rotateY(90deg)',
      transformOrigin: 'left',
      top: '0px',
      left: \`\\\${width}px\`
    });

    // Bottom face
    createFace({
      width,
      height: THICKNESS,
      transform: \`rotateX(-90deg) translateY(\\\${THICKNESS}px)\`,
      transformOrigin: 'bottom',
      bottom: '0px',
      left: '0px'
    });

    // Left face
    createFace({
      width: THICKNESS,
      height,
      transform: \`translateX(-\\\${THICKNESS}px) rotateY(-90deg)\`,
      transformOrigin: 'right',
      top: '0px',
      left: '0px'
    });

    element.appendChild(fragment);
  }

  // Recursive function to traverse child nodes, apply 3D styles, and create side faces
  function traverseDOM(parentNode, depthLevel, offsetX, offsetY) {
    for (let children = parentNode.childNodes, childrenCount = children.length, i = 0; i < childrenCount; i++) {
      const childNode = children[i];
      if (!(childNode.nodeType === 1 && !childNode.classList.contains('dom-3d-side-face'))) continue;
      const color = COLOR_RANDOM ? getRandomColor() : getColorByDepth(depthLevel, COLOR_HUE, -5);
      Object.assign(childNode.style, {
        transform: \`translateZ(\\\${THICKNESS}px)\`,
        overflow: "visible",
        backfaceVisibility: "hidden",
        isolation: "auto",
        transformStyle: "preserve-3d",
        backgroundColor: COLOR_SURFACE ? color : getComputedStyle(childNode).backgroundColor,
        willChange: 'transform',
      });

      let updatedOffsetX = offsetX;
      let updatedOffsetY = offsetY;
      if (childNode.offsetParent === parentNode) {
        updatedOffsetX += parentNode.offsetLeft;
        updatedOffsetY += parentNode.offsetTop;
      }
      createSideFaces(childNode, color);
      traverseDOM(childNode, depthLevel + 1, updatedOffsetX, updatedOffsetY);
    }
  }
})()`;

  // Code snippet for the DOM 3D Visualize tool
  const visualizeCode = `//Credits: https://gist.github.com/OrionReed/4c3778ebc2b5026d2354359ca49077ca

(() => {
  const THICKNESS = 5;
  const MAX_ROTATION = 180;
  const DISTANCE = 10000;

  const getDOMDepth = element =>
    [...element.children].reduce((max, child) => Math.max(max, getDOMDepth(child)), 0) + 1;

  const body = document.body;
  body.style.overflow = "visible";
  body.style.transformStyle = "preserve-3d";
  body.style.perspective = \`\\\${DISTANCE}px\`;
  const perspectiveOriginX = window.innerWidth / 2;
  const perspectiveOriginY = window.innerHeight / 2;
  body.style.perspectiveOrigin = body.style.transformOrigin = \`\\\${perspectiveOriginX}px \\\${perspectiveOriginY}px\`;

  document.addEventListener("mousemove", (event) => {
    const rotationY = MAX_ROTATION * (1 - event.clientY / window.innerHeight) - (MAX_ROTATION / 2);
    const rotationX = MAX_ROTATION * event.clientX / window.innerWidth - (MAX_ROTATION / 2);
    body.style.transform = \`rotateX(\\\${rotationY}deg) rotateY(\\\${rotationX}deg)\`;
  });

  function traverseDOM(parentNode, depthLevel) {
    for (let children = parentNode.childNodes, i = 0; i < children.length; i++) {
      const childNode = children[i];
      if (childNode.nodeType !== 1) continue;

      Object.assign(childNode.style, {
        transform: \`translateZ(\\\${THICKNESS * depthLevel}px)\`,
        overflow: "visible",
        backfaceVisibility: "hidden",
        transformStyle: "preserve-3d",
        willChange: 'transform',
        boxShadow: '0px 0px 2px rgba(0,0,0,0.5)',
      });

      traverseDOM(childNode, depthLevel + 1);
    }
  }

  traverseDOM(body, 0);
})();`;

  // Function to copy text to the clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Code copied to clipboard!");
    } catch (error) {
      alert("Failed to copy code.");
    }
  };

  return (
    <>
      <MatrixRain />
      <div className="min-h-screen bg-transparent">
        <div className="container mx-auto px-4">
          {/* Header with Back Button */}
          <div className="py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Menu</span>
            </Link>
          </div>

          {/* Main Content */}
          <div className="mt-8">
            <h1 className="text-2xl font-bold text-green-400 mb-6">Tools</h1>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 3D DOM Viewer Tool Card */}
              <div className="relative border border-green-800 rounded-lg p-6 hover:border-green-400 transition-colors bg-black/50 backdrop-blur-sm">
                {/* Info icon */}
                <button
                  onClick={() => setViewerModalOpen(true)}
                  className="absolute top-2 right-2 text-green-400 hover:text-green-300"
                  aria-label="How to use 3D DOM Viewer"
                >
                  <Info className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold text-green-400 mb-2">
                  3D DOM Viewer
                </h2>
                <button
                  onClick={() => copyToClipboard(viewerCode)}
                  className="mb-4 px-3 py-1 bg-green-700 text-green-200 rounded hover:bg-green-600 transition-colors"
                >
                  Copy Code
                </button>
                <pre className="text-green-600 text-xs overflow-auto whitespace-pre-wrap">
                  {viewerCode}
                </pre>
              </div>

              {/* DOM 3D Visualize Tool Card */}
              <div className="relative border border-green-800 rounded-lg p-6 hover:border-green-400 transition-colors bg-black/50 backdrop-blur-sm">
                {/* Info icon */}
                <button
                  onClick={() => setVisualizeModalOpen(true)}
                  className="absolute top-2 right-2 text-green-400 hover:text-green-300"
                  aria-label="How to use DOM 3D Visualize"
                >
                  <Info className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold text-green-400 mb-2">
                  DOM 3D Visualize
                </h2>
                <button
                  onClick={() => copyToClipboard(visualizeCode)}
                  className="mb-4 px-3 py-1 bg-green-700 text-green-200 rounded hover:bg-green-600 transition-colors"
                >
                  Copy Code
                </button>
                <pre className="text-green-600 text-xs overflow-auto whitespace-pre-wrap">
                  {visualizeCode}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info modals */}
      <InfoModal
        isOpen={viewerModalOpen}
        onClose={() => setViewerModalOpen(false)}
        title="3D DOM Viewer - How to Use"
      >
        <p>
          Copy the code and paste it into your browser console on any webpage.
          It will visualize the DOM as a stack of 3D blocks.
        </p>
      </InfoModal>
      <InfoModal
        isOpen={visualizeModalOpen}
        onClose={() => setVisualizeModalOpen(false)}
        title="DOM 3D Visualize - How to Use"
      >
        <p>
          Copy the code and paste it into your browser console. This snippet
          applies a 3D transformation to the DOM for a cool visual effect.
        </p>
      </InfoModal>
    </>
  );
}
