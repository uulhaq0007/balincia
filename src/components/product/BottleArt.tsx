"use client";

import { useId } from "react";

// Generative SVG "product photography": every product gets a unique bottle
// rendered from its palette + shape, so the store looks complete before real
// photos are uploaded.
// It's a client component on purpose: when server pages render it, React's
// payload then carries only these props instead of a second copy of every SVG.

type Props = {
  palette: [string, string];
  shape?: string;
  name?: string;
  className?: string;
  /** Hide the backdrop when composing on a coloured surface. */
  bare?: boolean;
};

// Only emit the gradients a shape actually paints with — pages render dozens of bottles.
const SHAPE_DEFS: Record<string, string[]> = {
  classic: ["cap", "liquid", "glass"],
  round: ["cap", "liquid", "glass"],
  tall: ["cap", "liquid", "glass"],
  mist: ["cap", "liquid", "glass"],
  diffuser: ["cap", "liquid", "glass"],
  attar: ["crystal", "gold", "liquid", "glass"],
  box: ["boxfill", "gold", "glass"],
  candle: ["glow", "flame", "glass"],
};

export function BottleArt({ palette, shape = "classic", name = "", className, bare = false }: Props) {
  const [dark, light] = palette;
  // Unique per instance, so a visible bottle never resolves url(#…) to an identical hidden one.
  const k = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (s: string) => `${s}-${k}`;
  const label = name.length > 16 ? `${name.slice(0, 15)}…` : name;
  const uses = new Set(SHAPE_DEFS[shape] ?? SHAPE_DEFS.classic);

  const Label = ({ x, y, w, h }: { x: number; y: number; w: number; h: number }) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3} fill="#f7f2ea" opacity={0.94} />
      <rect x={x + 5} y={y + 5} width={w - 10} height={h - 10} rx={2} fill="none" stroke={dark} strokeOpacity={0.35} strokeWidth={0.8} />
      <text
        x={x + w / 2}
        y={y + h * 0.36}
        textAnchor="middle"
        fontSize={Math.max(6.5, w * 0.065)}
        letterSpacing={Math.max(2, w * 0.03)}
        fill={dark}
        style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}
      >
        BALINCIA
      </text>
      <line x1={x + w * 0.3} x2={x + w * 0.7} y1={y + h * 0.48} y2={y + h * 0.48} stroke={dark} strokeOpacity={0.4} strokeWidth={0.7} />
      {label && (
        <text
          x={x + w / 2}
          y={y + h * 0.72}
          textAnchor="middle"
          fontSize={Math.max(8, Math.min(14, (w * 1.5) / Math.max(label.length, 6)))}
          fill={dark}
          style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
        >
          {label}
        </text>
      )}
    </g>
  );

  let body: React.ReactNode;
  switch (shape) {
    case "round":
      body = (
        <g>
          <ellipse cx={200} cy={446} rx={105} ry={12} fill={dark} opacity={0.22} filter={`url(#${id("blur")})`} />
          <rect x={182} y={168} width={36} height={30} fill={dark} opacity={0.75} />
          <rect x={158} y={102} width={84} height={72} rx={10} fill={`url(#${id("cap")})`} />
          <rect x={166} y={110} width={10} height={56} rx={5} fill="#fff" opacity={0.22} />
          <circle cx={200} cy={318} r={124} fill={`url(#${id("liquid")})`} />
          <circle cx={200} cy={318} r={124} fill={`url(#${id("glass")})`} />
          <circle cx={200} cy={318} r={116} fill="none" stroke="#fff" strokeOpacity={0.22} strokeWidth={2} />
          <path d="M108 280 Q118 230 160 208" stroke="#fff" strokeOpacity={0.45} strokeWidth={9} strokeLinecap="round" fill="none" />
          <Label x={150} y={300} w={100} h={62} />
        </g>
      );
      break;
    case "tall":
      body = (
        <g>
          <ellipse cx={200} cy={448} rx={80} ry={10} fill={dark} opacity={0.22} filter={`url(#${id("blur")})`} />
          <rect x={186} y={140} width={28} height={16} fill={dark} opacity={0.75} />
          <rect x={164} y={52} width={72} height={92} rx={4} fill={`url(#${id("cap")})`} />
          <rect x={172} y={60} width={8} height={76} rx={4} fill="#fff" opacity={0.22} />
          <rect x={142} y={154} width={116} height={290} rx={12} fill={`url(#${id("liquid")})`} />
          <rect x={142} y={154} width={116} height={290} rx={12} fill={`url(#${id("glass")})`} />
          <rect x={150} y={162} width={100} height={274} rx={8} fill="none" stroke="#fff" strokeOpacity={0.2} />
          <rect x={154} y={172} width={12} height={250} rx={6} fill="#fff" opacity={0.3} />
          <Label x={160} y={300} w={80} h={84} />
        </g>
      );
      break;
    case "attar":
      body = (
        <g>
          <ellipse cx={200} cy={448} rx={78} ry={10} fill={dark} opacity={0.22} filter={`url(#${id("blur")})`} />
          <path d="M200 70 L236 150 L214 252 L186 252 L164 150 Z" fill={`url(#${id("crystal")})`} stroke="#fff" strokeOpacity={0.6} />
          <path d="M200 70 L214 252 M200 70 L186 252 M164 150 L236 150" stroke="#fff" strokeOpacity={0.45} strokeWidth={1} />
          <rect x={180} y={248} width={40} height={30} rx={3} fill={`url(#${id("gold")})`} />
          <path d="M150 290 L176 272 L224 272 L250 290 L258 420 L238 444 L162 444 L142 420 Z" fill={`url(#${id("liquid")})`} />
          <path d="M150 290 L176 272 L224 272 L250 290 L258 420 L238 444 L162 444 L142 420 Z" fill={`url(#${id("glass")})`} stroke="#fff" strokeOpacity={0.35} />
          <path d="M150 290 L142 420 M250 290 L258 420" stroke="#fff" strokeOpacity={0.35} />
          <rect x={156} y={300} width={9} height={110} rx={4} fill="#fff" opacity={0.3} />
          <Label x={168} y={330} w={64} h={60} />
        </g>
      );
      break;
    case "box":
      body = (
        <g>
          <ellipse cx={200} cy={448} rx={140} ry={12} fill={dark} opacity={0.22} filter={`url(#${id("blur")})`} />
          <rect x={82} y={236} width={236} height={206} rx={6} fill={`url(#${id("boxfill")})`} />
          <rect x={72} y={204} width={256} height={50} rx={6} fill={dark} />
          <rect x={72} y={204} width={256} height={50} rx={6} fill={`url(#${id("glass")})`} />
          <rect x={186} y={204} width={28} height={238} fill={`url(#${id("gold")})`} />
          <path d="M200 206 C160 150 118 170 142 198 C152 210 180 208 200 206 Z" fill={`url(#${id("gold")})`} />
          <path d="M200 206 C240 150 282 170 258 198 C248 210 220 208 200 206 Z" fill={`url(#${id("gold")})`} />
          <circle cx={200} cy={205} r={11} fill={`url(#${id("gold")})`} stroke={dark} strokeOpacity={0.25} />
          <Label x={232} y={300} w={74} h={64} />
        </g>
      );
      break;
    case "diffuser":
      body = (
        <g>
          <ellipse cx={200} cy={448} rx={92} ry={11} fill={dark} opacity={0.22} filter={`url(#${id("blur")})`} />
          {[
            [112, 64],
            [150, 46],
            [196, 38],
            [242, 46],
            [284, 66],
            [128, 96],
            [268, 96],
          ].map(([x, y], i) => (
            <line key={i} x1={200} y1={292} x2={x} y2={y} stroke="#4a3626" strokeWidth={3.5} strokeLinecap="round" />
          ))}
          <rect x={174} y={268} width={52} height={30} rx={4} fill={`url(#${id("cap")})`} />
          <rect x={132} y={292} width={136} height={152} rx={24} fill={`url(#${id("liquid")})`} />
          <rect x={132} y={292} width={136} height={152} rx={24} fill={`url(#${id("glass")})`} stroke="#fff" strokeOpacity={0.3} />
          <rect x={144} y={306} width={10} height={120} rx={5} fill="#fff" opacity={0.3} />
          <Label x={160} y={336} w={80} h={64} />
        </g>
      );
      break;
    case "candle":
      body = (
        <g>
          <ellipse cx={200} cy={448} rx={112} ry={12} fill={dark} opacity={0.22} filter={`url(#${id("blur")})`} />
          <circle cx={200} cy={190} r={70} fill={`url(#${id("glow")})`} />
          <path d="M200 150 C214 172 216 196 200 212 C184 196 186 172 200 150 Z" fill={`url(#${id("flame")})`} />
          <line x1={200} y1={212} x2={200} y2={236} stroke="#2a1c12" strokeWidth={3} />
          <rect x={108} y={232} width={184} height={212} rx={18} fill={dark} />
          <rect x={108} y={232} width={184} height={212} rx={18} fill={`url(#${id("glass")})`} />
          <ellipse cx={200} cy={240} rx={86} ry={12} fill="#f3e9d9" />
          <rect x={120} y={252} width={10} height={170} rx={5} fill="#fff" opacity={0.18} />
          <Label x={146} y={312} w={108} h={70} />
        </g>
      );
      break;
    case "mist":
      body = (
        <g>
          <ellipse cx={200} cy={448} rx={80} ry={10} fill={dark} opacity={0.22} filter={`url(#${id("blur")})`} />
          <rect x={182} y={112} width={36} height={58} rx={6} fill={`url(#${id("cap")})`} />
          <rect x={214} y={124} width={26} height={12} rx={3} fill={`url(#${id("cap")})`} />
          <rect x={172} y={160} width={56} height={22} rx={6} fill={dark} opacity={0.8} />
          <rect x={148} y={176} width={104} height={268} rx={34} fill={`url(#${id("liquid")})`} />
          <rect x={148} y={176} width={104} height={268} rx={34} fill={`url(#${id("glass")})`} stroke="#fff" strokeOpacity={0.3} />
          <rect x={160} y={196} width={11} height={226} rx={5.5} fill="#fff" opacity={0.3} />
          <Label x={162} y={290} w={76} h={80} />
        </g>
      );
      break;
    default:
      body = (
        <g>
          <ellipse cx={200} cy={448} rx={112} ry={12} fill={dark} opacity={0.22} filter={`url(#${id("blur")})`} />
          <rect x={180} y={168} width={40} height={26} fill={dark} opacity={0.75} />
          <rect x={152} y={92} width={96} height={82} rx={6} fill={`url(#${id("cap")})`} />
          <rect x={160} y={100} width={10} height={66} rx={5} fill="#fff" opacity={0.22} />
          <rect x={108} y={190} width={184} height={252} rx={22} fill={`url(#${id("liquid")})`} />
          <rect x={108} y={190} width={184} height={252} rx={22} fill={`url(#${id("glass")})`} />
          <rect x={117} y={199} width={166} height={234} rx={16} fill="none" stroke="#fff" strokeOpacity={0.22} />
          <rect x={124} y={208} width={14} height={214} rx={7} fill="#fff" opacity={0.3} />
          <Label x={146} y={286} w={108} h={74} />
        </g>
      );
  }

  return (
    <svg viewBox="0 0 400 500" className={className} role="img" aria-label={name ? `${name} bottle` : "Perfume bottle"}>
      <defs>
        {!bare && (
          <>
            <linearGradient id={id("bg")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={light} stopOpacity={0.16} />
              <stop offset="1" stopColor={light} stopOpacity={0.5} />
            </linearGradient>
            <radialGradient id={id("halo")} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fff" stopOpacity={0.75} />
              <stop offset="1" stopColor="#fff" stopOpacity={0} />
            </radialGradient>
          </>
        )}
        {uses.has("liquid") && (
          <linearGradient id={id("liquid")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={light} stopOpacity={0.95} />
            <stop offset="0.55" stopColor={light} />
            <stop offset="1" stopColor={dark} />
          </linearGradient>
        )}
        {uses.has("glass") && (
          <linearGradient id={id("glass")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity={0.32} />
            <stop offset="0.18" stopColor="#fff" stopOpacity={0.04} />
            <stop offset="0.75" stopColor="#000" stopOpacity={0.04} />
            <stop offset="1" stopColor="#000" stopOpacity={0.22} />
          </linearGradient>
        )}
        {uses.has("cap") && (
          <linearGradient id={id("cap")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={dark} />
            <stop offset="0.35" stopColor={dark} stopOpacity={0.85} />
            <stop offset="0.5" stopColor={light} stopOpacity={0.9} />
            <stop offset="0.62" stopColor={dark} />
            <stop offset="1" stopColor={dark} />
          </linearGradient>
        )}
        {uses.has("gold") && (
          <linearGradient id={id("gold")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8a6332" />
            <stop offset="0.45" stopColor="#ecd09a" />
            <stop offset="0.7" stopColor="#a87d45" />
            <stop offset="1" stopColor="#d8b67c" />
          </linearGradient>
        )}
        {uses.has("crystal") && (
          <linearGradient id={id("crystal")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0.9} />
            <stop offset="0.5" stopColor={light} stopOpacity={0.6} />
            <stop offset="1" stopColor={dark} stopOpacity={0.7} />
          </linearGradient>
        )}
        {uses.has("boxfill") && (
          <linearGradient id={id("boxfill")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={dark} />
            <stop offset="1" stopColor={dark} stopOpacity={0.8} />
          </linearGradient>
        )}
        {uses.has("glow") && (
          <radialGradient id={id("glow")} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffd8a0" stopOpacity={0.8} />
            <stop offset="1" stopColor="#ffd8a0" stopOpacity={0} />
          </radialGradient>
        )}
        {uses.has("flame") && (
          <linearGradient id={id("flame")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff3c4" />
            <stop offset="0.6" stopColor="#f6a943" />
            <stop offset="1" stopColor="#c8561c" />
          </linearGradient>
        )}
        <filter id={id("blur")} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      {!bare && (
        <>
          <rect width="400" height="500" fill="#f4eee5" />
          <rect width="400" height="500" fill={`url(#${id("bg")})`} />
          <circle cx="200" cy="270" r="190" fill="none" stroke={dark} strokeOpacity={0.08} />
          <circle cx="200" cy="270" r="150" fill={`url(#${id("halo")})`} />
        </>
      )}
      {body}
    </svg>
  );
}
