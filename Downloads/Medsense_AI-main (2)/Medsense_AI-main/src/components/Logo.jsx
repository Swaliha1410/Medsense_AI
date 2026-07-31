import React from 'react'

const Logo = ({ className = "w-10 h-10" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Capsule */}
      <g>
        {/* Top half - Teal */}
        <path
          d="M100 30C72.3858 30 50 52.3858 50 80V100H150V80C150 52.3858 127.614 30 100 30Z"
          fill="url(#tealGradient)"
        />
        {/* Bottom half - Blue */}
        <path
          d="M50 100H150V120C150 147.614 127.614 170 100 170C72.3858 170 50 147.614 50 120V100Z"
          fill="url(#blueGradient)"
        />
        {/* Medical Cross */}
        <rect x="90" y="70" width="20" height="60" fill="white" rx="3" />
        <rect x="70" y="90" width="60" height="20" fill="white" rx="3" />
      </g>

      {/* Orbit Ring */}
      <path
        d="M30 100C30 61.3401 61.3401 30 100 30C138.66 30 170 61.3401 170 100C170 138.66 138.66 170 100 170C61.3401 170 30 138.66 30 100Z"
        stroke="url(#ringGradient)"
        strokeWidth="4"
        fill="none"
        opacity="0.6"
      />

      {/* Sparkles */}
      <g>
        {/* Large Sparkle */}
        <path
          d="M160 50L162 56L168 58L162 60L160 66L158 60L152 58L158 56L160 50Z"
          fill="#14C8A8"
        />
        {/* Small Sparkle */}
        <path
          d="M170 80L171.5 84L175.5 85.5L171.5 87L170 91L168.5 87L164.5 85.5L168.5 84L170 80Z"
          fill="#14C8A8"
        />
      </g>

      {/* Gradients */}
      <defs>
        <linearGradient id="tealGradient" x1="100" y1="30" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14C8A8" />
          <stop offset="1" stopColor="#0EA387" />
        </linearGradient>
        <linearGradient id="blueGradient" x1="100" y1="100" x2="100" y2="170" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F6FFF" />
          <stop offset="1" stopColor="#0B56CC" />
        </linearGradient>
        <linearGradient id="ringGradient" x1="30" y1="100" x2="170" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F6FFF" />
          <stop offset="0.5" stopColor="#14C8A8" />
          <stop offset="1" stopColor="#0F6FFF" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default Logo
