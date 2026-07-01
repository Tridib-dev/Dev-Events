import Link from "next/link";

const FooterCTA = () => {
    return (
        <div className="footer-cta">
            {/* Grain texture overlay for the scratchy edge lighting */}
            <span className="footer-cta-grain" aria-hidden="true" />

            {/* Edge rim lights — top and left bright scratchy highlights */}
            <span className="footer-cta-rim" aria-hidden="true" />

            <div className="footer-cta-content">
                <h2 className="footer-cta-heading">
                    Discover. Book. Attend.<br />
                    Events that move you forward.
                </h2>
                <p className="footer-cta-subtext">
                    Join thousands of developers finding<br />
                    and organizing amazing events worldwide.
                </p>
                <Link href="/sign-up" className="footer-cta-btn">
                    Get Started
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>
            </div>

            {/* Inline SVG dot-matrix world map — no broken image dependency */}
            <div className="footer-cta-map" aria-hidden="true">
                <WorldMapDots />
            </div>
        </div>
    );
};

/* Pure SVG dot-matrix world map — cyan dots with glowing hotspots */
function WorldMapDots() {
    // Major landmass dot positions [cx, cy] as percentage of 480x280 viewBox
    // Covers all continents roughly
    const dots: [number, number][] = [
        // North America
        [68,48],[80,52],[90,58],[100,54],[110,58],[118,62],[108,70],[96,74],
        [86,66],[76,60],[70,56],[62,56],[72,78],[82,82],[90,86],[100,80],
        [112,76],[122,72],[130,68],[138,62],[144,58],[126,82],[116,88],
        // Greenland
        [148,30],[158,26],[168,28],[162,34],[152,36],
        // South America
        [104,112],[112,118],[120,124],[116,132],[110,140],[104,148],
        [98,156],[96,164],[100,172],[108,176],[116,170],[122,162],
        [126,154],[124,144],[120,136],[128,128],[132,120],[124,112],
        // Europe
        [198,46],[206,44],[214,42],[222,44],[230,46],[238,48],[246,44],
        [254,46],[262,44],[206,52],[214,52],[222,50],[230,52],[238,52],
        [246,50],[200,58],[208,58],[216,56],[224,58],[232,56],[240,58],
        [248,56],[256,54],[210,64],[220,62],[230,64],[240,62],[250,64],
        // Africa
        [210,80],[220,78],[230,80],[240,78],[248,82],[256,80],
        [206,90],[216,88],[226,90],[236,88],[244,92],[252,90],[260,88],
        [210,100],[220,98],[230,100],[240,98],[248,102],[256,100],[264,98],
        [214,110],[224,108],[234,110],[244,108],[252,112],[260,110],
        [218,120],[228,118],[238,120],[248,118],[256,122],[264,120],
        [222,130],[232,128],[242,130],[250,134],[258,130],
        [226,140],[236,138],[246,140],[254,144],
        [230,150],[240,148],[248,152],[238,158],[246,158],
        // Middle East
        [272,72],[280,70],[288,74],[296,72],[284,80],[292,78],[276,80],
        // Asia
        [300,44],[310,42],[320,40],[330,38],[340,36],[350,38],[360,40],
        [368,42],[376,44],[384,42],[392,44],[400,42],[408,44],[416,40],
        [304,52],[312,50],[322,52],[332,50],[342,52],[352,50],[362,52],
        [370,50],[380,52],[388,50],[396,52],[404,50],[412,52],[420,48],
        [306,60],[316,58],[326,60],[336,58],[346,60],[356,58],[366,60],
        [374,58],[382,60],[390,58],[398,60],[408,58],[418,60],[428,56],
        [310,70],[320,68],[330,70],[340,68],[350,70],[360,68],[370,70],
        [380,68],[390,70],[400,68],[410,70],[420,68],[430,66],[440,64],
        [314,80],[324,78],[334,80],[344,78],[354,80],[364,78],[374,80],
        [384,78],[394,80],[404,78],[414,80],[424,76],[434,74],
        [320,90],[330,88],[340,90],[350,88],[360,90],[370,88],[380,90],
        [390,88],[400,90],[410,88],[418,92],[428,88],[436,86],
        [326,100],[336,98],[346,100],[356,98],[366,100],[376,98],[386,100],
        [396,98],[406,100],[416,96],[424,100],[432,96],
        // Southeast Asia / Indonesia
        [370,112],[380,110],[390,112],[400,110],[408,114],[418,110],
        [376,122],[386,120],[396,122],[406,120],[414,124],
        [382,132],[392,130],[402,132],[410,136],
        // Australia
        [390,154],[400,152],[410,154],[420,152],[430,154],[440,152],[448,156],
        [394,162],[404,160],[414,162],[424,160],[434,162],[444,160],[452,164],
        [398,170],[408,168],[418,170],[428,168],[438,170],[446,174],
        [402,178],[412,176],[422,178],[432,176],[440,180],
        [406,186],[416,184],[426,186],[434,182],[442,186],
        // Japan / Korea
        [424,58],[432,56],[440,58],[428,64],[436,62],[444,60],
    ];

    // Glowing hotspot cities (major dev event hubs)
    const hotspots: [number, number, number][] = [
        [90, 64, 5],   // San Francisco
        [120, 72, 4],  // New York
        [218, 52, 5],  // London
        [230, 58, 4],  // Berlin
        [296, 74, 4],  // Dubai
        [350, 68, 5],  // Mumbai / India
        [410, 62, 5],  // Beijing / Shanghai
        [430, 64, 4],  // Tokyo
        [398, 162, 4], // Sydney
        [238, 88, 4],  // Nairobi
    ];

    return (
        <svg
            viewBox="0 0 480 280"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
        >
            <defs>
                {/* Glow filter for hotspots */}
                <filter id="hotspot-glow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                {/* Softer glow for dot halo */}
                <filter id="dot-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1.2" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                {/* Fade mask: visible center/right, fades to transparent left */}
                <linearGradient id="map-fade" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="white" stopOpacity="0" />
                    <stop offset="25%" stopColor="white" stopOpacity="0.6" />
                    <stop offset="60%" stopColor="white" stopOpacity="1" />
                    <stop offset="100%" stopColor="white" stopOpacity="0.85" />
                </linearGradient>
                <mask id="fade-mask">
                    <rect width="480" height="280" fill="url(#map-fade)" />
                </mask>
                {/* Radial glow behind the whole map */}
                <radialGradient id="map-glow" cx="65%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Subtle background glow */}
            <rect width="480" height="280" fill="url(#map-glow)" />

            <g mask="url(#fade-mask)">
                {/* Regular dots */}
                {dots.map(([cx, cy], i) => {
                    // deterministic pseudo-random based on index (pure, idempotent)
                    const pseudo = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
                    return (
                        <circle
                            key={i}
                            cx={cx}
                            cy={cy}
                            r={1.2}
                            fill="#06b6d4"
                            opacity={0.35 + pseudo * 0.3}
                        />
                    );
                })}

                {/* Glowing hotspot cities */}
                {hotspots.map(([cx, cy, r], i) => (
                    <g key={`h-${i}`} filter="url(#hotspot-glow)">
                        {/* Outer halo */}
                        <circle cx={cx} cy={cy} r={r + 3} fill="#06b6d4" opacity={0.15} />
                        {/* Mid ring */}
                        <circle cx={cx} cy={cy} r={r + 1} fill="#06b6d4" opacity={0.35} />
                        {/* Bright core */}
                        <circle cx={cx} cy={cy} r={r * 0.6} fill="#67e8f9" opacity={0.9} />
                        {/* Connector lines to nearest dot (faint) */}
                        <circle cx={cx} cy={cy} r={r + 5} fill="none" stroke="#06b6d4" strokeWidth="0.5" opacity={0.2} />
                    </g>
                ))}
            </g>
        </svg>
    );
}

export default FooterCTA;