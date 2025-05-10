const Background = () => {
  return (
    <>
      {/* Static background elements */}
      <div className="fixed inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#1a1a1a] to-[#0A0A0A] z-0"></div>
      <div className="fixed inset-0 bg-gradient-radial from-transparent via-[#FF0B7A]/5 to-transparent z-0"></div>

      {/* Circuit pattern overlay */}
      <div className="fixed inset-0 overflow-hidden z-0">
        <svg className="w-full h-full opacity-10">
          <pattern
            id="circuit"
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <path d="M0 50h100M50 0v100" stroke="#FF0B7A" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="3" fill="#FF0B7A" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
      </div>

      {/* Static glowing orbs */}
      <div className="fixed top-1/4 right-1/4 w-32 h-32 rounded-full bg-[#FF0B7A]/10 blur-3xl z-0"></div>
      <div className="fixed bottom-1/4 left-1/3 w-40 h-40 rounded-full bg-[#FF0B7A]/10 blur-3xl z-0"></div>
    </>
  );
};

export default Background;
