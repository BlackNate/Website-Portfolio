import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import bell from './lottie/bell.json';
import burst from './lottie/burst.json';
import calendarMiss from './lottie/calendar_miss.json';
import chart from './lottie/chart.json';
import checklist from './lottie/checklist.json';
import coins from './lottie/coins.json';
import logo from './lottie/logo.json';
import ping from './lottie/ping.json';
import {Sound} from './Sound';
import {AppTile, Backdrop, C, ChargeCard, FONT, Kinetic, LottieAt, PlayBadge, Wordmark, clamp, outAt, useSpringAt, useT} from './ui';
import {S} from './timing';

const W = 1080;

/* ------------------------------------------------------------------ */
/* Scene 1 — Hook: charges stack up as the VO names them               */
/* ------------------------------------------------------------------ */
const CHARGES = [
  {name: 'Netflix', letter: 'N', tile: '#E50914', amount: '−R129.00', at: S.hook.netflix},
  {name: 'Spotify', letter: 'S', tile: '#1DB954', amount: '−R59.99', at: S.hook.spotify},
  {name: 'Gym membership', letter: 'G', tile: '#FF8A00', amount: '−R399.00', at: S.hook.gym},
];

const Hook: React.FC = () => {
  const {t} = useT();
  const leave = interpolate(t, [S.problem.start - 0.1, S.problem.start + 0.5], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  return (
    <AbsoluteFill>
      {/* headline */}
      <div style={{position: 'absolute', top: 250, left: 80, right: 80}}>
        <Kinetic
          at={S.hook.netflix - 0.05}
          out={S.problem.start - 0.25}
          size={132}
          stagger={0.55}
          words={[{w: 'Netflix.'}, {w: 'Spotify.'}]}
        />
        <Kinetic
          at={S.hook.gym}
          out={S.problem.start - 0.25}
          size={92}
          weight={700}
          color={C.lilac}
          style={{marginTop: 22}}
          words={['That', 'gym', 'you', {w: 'forgot', color: C.yellow, under: true}, 'about.']}
        />
      </div>
      {/* card stack */}
      <div style={{position: 'absolute', top: 960, left: 0, right: 0, height: 900}}>
        {CHARGES.map((c) => (
          <LottieAt key={`p${c.name}`} data={ping} x={W / 2} y={340} size={900} at={c.at} out={c.at + 0.9} pop={false} />
        ))}
        {CHARGES.map((c, i) => {
          const s = useSpringAt(c.at, {damping: 14, stiffness: 150, mass: 0.9});
          const depth = CHARGES.filter((d) => t >= d.at).length - 1 - i; // 0 = newest
          const y = i * 0 + Math.max(0, depth) * -44;
          const sc = 1 - Math.max(0, depth) * 0.06;
          const isGym = i === 2;
          const flag = isGym ? <ForgottenFlag at={S.hook.gym + 0.9} /> : null;
          return (
            <div
              key={c.name}
              style={{
                position: 'absolute',
                left: (W - 780) / 2,
                top: 260 + y + (1 - s) * -260 + leave * (900 + i * 120),
                transform: `scale(${sc * (0.9 + 0.1 * s)}) rotate(${(1 - s) * (i % 2 ? 6 : -6) + leave * (i - 1) * 14}deg)`,
                opacity: Math.min(1, s * 1.5) * (1 - Math.max(0, depth) * 0.18),
                zIndex: i,
              }}
            >
              <ChargeCard {...c} flag={flag} />
            </div>
          );
        })}
      </div>
      <LottieAt data={bell} x={W - 200} y={1000} size={330} at={S.hook.netflix} out={S.problem.start - 0.3} loop speed={1.2} />
    </AbsoluteFill>
  );
};

const ForgottenFlag: React.FC<{at: number}> = ({at}) => {
  const s = useSpringAt(at, {damping: 9, stiffness: 200, mass: 0.6});
  return (
    <div
      style={{
        position: 'absolute',
        right: -24,
        top: -46,
        background: C.yellow,
        color: '#1A0B2E',
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 30,
        padding: '10px 22px',
        borderRadius: 999,
        transform: `scale(${s}) rotate(8deg)`,
        boxShadow: '0 10px 24px rgba(0,0,0,0.35)',
      }}
    >
      Still paying?
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 2 — Problem: the money quietly drains                         */
/* ------------------------------------------------------------------ */
const money = (v: number) =>
  'R' + v.toLocaleString('en-ZA', {minimumFractionDigits: 2, maximumFractionDigits: 2}).replace(/ /g, ',').replace(/,(\d{2})$/, '.$1');

const Problem: React.FC = () => {
  const {t} = useT();
  const {start, year, notice, end} = S.problem;
  const sceneOut = outAt(t, end - 0.15, 0.4);
  const monthly = interpolate(t, [start + 0.5, start + 2.2], [0, 587.99], {...clamp, easing: Easing.out(Easing.cubic)});
  const yearly = interpolate(t, [year, year + 1.2], [587.99, 7055.88], {...clamp, easing: Easing.out(Easing.cubic)});
  const isYear = t >= year;
  const counterSpring = useSpringAt(start + 0.4);
  const swap = useSpringAt(year, {damping: 11, stiffness: 180, mass: 0.7});
  const counterOut = outAt(t, notice - 0.2, 0.35);
  return (
    <AbsoluteFill style={{opacity: sceneOut}}>
      <div style={{position: 'absolute', top: 250, left: 80, right: 80}}>
        <Kinetic at={start + 0.05} out={notice - 0.3} size={104} words={['Small', 'charges.']} />
        <Kinetic
          at={start + 1.4}
          out={notice - 0.3}
          size={84}
          weight={700}
          color={C.lilac}
          style={{marginTop: 14}}
          words={['Quietly', {w: 'draining', color: C.red, under: true}, 'your', 'account.']}
        />
      </div>

      {/* counter */}
      <div
        style={{
          position: 'absolute',
          top: 720,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT,
          opacity: counterSpring * counterOut,
          transform: `scale(${(0.8 + 0.2 * counterSpring) * (1 + 0.08 * Math.sin(Math.PI * Math.min(1, swap)))})`,
        }}
      >
        <div style={{fontWeight: 800, fontSize: 190, color: C.red, letterSpacing: -9, lineHeight: 1}}>
          −{money(isYear ? yearly : monthly)}
        </div>
        <div style={{fontWeight: 700, fontSize: 54, color: C.white, marginTop: 10, letterSpacing: -1}}>
          {isYear ? 'every year' : 'every month'}
        </div>
      </div>
      <LottieAt data={coins} x={W / 2} y={1330} size={520} at={start + 0.5} out={notice - 0.2} loop />

      {/* "most of us never notice" */}
      <LottieAt data={calendarMiss} x={W / 2} y={1180} size={560} at={notice + 0.35} out={end - 0.2} />
      <div style={{position: 'absolute', top: 400, left: 80, right: 80}}>
        <Kinetic
          at={notice}
          out={end - 0.25}
          size={108}
          words={['And', 'most', 'of', 'us', {w: 'never', color: C.yellow}, {w: 'notice.', color: C.yellow, under: true}]}
        />
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 3 — Reveal                                                    */
/* ------------------------------------------------------------------ */
const Reveal: React.FC = () => {
  const {t} = useT();
  const {start, end} = S.reveal;
  const wipe = interpolate(t, [start, start + 0.55], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const out = interpolate(t, [end - 0.1, end + 0.4], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const wm = interpolate(t, [start + 0.75, start + 1.5], [0, 1], clamp);
  const tag = useSpringAt(start + 1.35);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 46%, #9F75FF 0%, ${C.violetD} 55%, #3B1679 100%)`,
          clipPath: `circle(${wipe * 140}% at 50% 46%)`,
          opacity: 1 - out,
        }}
      />
      <AbsoluteFill style={{opacity: 1 - out, transform: `scale(${1 + out * 0.25})`}}>
        <LottieAt data={burst} x={W / 2} y={820} size={900} at={start + 0.3} pop={false} />
        <LottieAt data={logo} x={W / 2} y={820} size={520} at={start + 0.25} />
        <div style={{position: 'absolute', top: 1110, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <Wordmark size={150} reveal={wm} />
        </div>
        <div
          style={{
            position: 'absolute',
            top: 1300,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 46,
            color: 'rgba(255,255,255,0.86)',
            opacity: tag,
            transform: `translateY(${(1 - tag) * 30}px)`,
          }}
        >
          Your subscriptions, finally in view.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 4 — Features (three beats)                                    */
/* ------------------------------------------------------------------ */
const FeatureFrame: React.FC<{
  idx: number;
  at: number;
  out: number;
  icon: unknown;
  iconLoop?: boolean;
  title: (string | {w: string; color?: string; under?: boolean})[];
  children: React.ReactNode;
}> = (props) => {
  const {t} = useT();
  if (t < props.at - 0.1 || t > props.out + 0.5) return null;
  return <FeatureBody {...props} />;
};

const FeatureBody: React.FC<{
  idx: number;
  at: number;
  out: number;
  icon: unknown;
  iconLoop?: boolean;
  title: (string | {w: string; color?: string; under?: boolean})[];
  children: React.ReactNode;
}> = ({idx, at, out, icon, iconLoop, title, children}) => {
  const {t} = useT();
  const inX = interpolate(t, [at - 0.05, at + 0.45], [1, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const outX = interpolate(t, [out, out + 0.4], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const panel = useSpringAt(at + 0.35);
  return (
    <AbsoluteFill style={{transform: `translateX(${inX * 420 - outX * 420}px)`, opacity: (1 - inX) * (1 - outX)}}>
      <div
        style={{
          position: 'absolute',
          top: 230,
          left: 80,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: 6,
          color: C.lilac,
        }}
      >
        0{idx + 1} / 03
      </div>
      <LottieAt data={icon} x={W / 2} y={560} size={470} at={at} loop={iconLoop} />
      <div style={{position: 'absolute', top: 840, left: 80, right: 80}}>
        <Kinetic at={at + 0.12} size={96} words={title} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1170,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: panel,
          transform: `translateY(${(1 - panel) * 80}px)`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

const ListRow: React.FC<{letter: string; tile: string; name: string; meta: string; price: string; at: number}> = ({
  letter,
  tile,
  name,
  meta,
  price,
  at,
}) => {
  const s = useSpringAt(at);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '18px 0',
        borderBottom: '2px solid #EFEAF8',
        opacity: s,
        transform: `translateX(${(1 - s) * 60}px)`,
      }}
    >
      <AppTile letter={letter} color={tile} size={72} />
      <div style={{flex: 1}}>
        <div style={{fontWeight: 800, fontSize: 36, color: '#1A0B2E'}}>{name}</div>
        <div style={{fontWeight: 500, fontSize: 26, color: '#7A6E92'}}>{meta}</div>
      </div>
      <div style={{fontWeight: 800, fontSize: 36, color: '#1A0B2E'}}>{price}</div>
    </div>
  );
};

const Panel: React.FC<{children: React.ReactNode; width?: number}> = ({children, width = 820}) => (
  <div
    style={{
      width,
      background: '#fff',
      borderRadius: 48,
      padding: '30px 40px',
      fontFamily: FONT,
      boxShadow: '0 40px 80px rgba(8,2,20,0.5)',
    }}
  >
    {children}
  </div>
);

const Features: React.FC = () => {
  const {t} = useT();
  const {a, b, c, end} = S.features;
  const total = useSpringAt(c + 0.6);
  const bars = [0.42, 0.18, 0.4];
  return (
    <>
      <FeatureFrame idx={0} at={a} out={b - 0.35} icon={checklist} title={['Track', {w: 'every', color: C.yellow, under: true}, 'subscription.']}>
        <Panel>
          <div style={{fontWeight: 800, fontSize: 30, color: C.violet, letterSpacing: 3, marginBottom: 6}}>MY SUBSCRIPTIONS · 3</div>
          <ListRow letter="N" tile="#E50914" name="Netflix" meta="Monthly · 20 Nov" price="R129.00" at={a + 0.55} />
          <ListRow letter="S" tile="#1DB954" name="Spotify" meta="Monthly · 24 Nov" price="R59.99" at={a + 0.7} />
          <ListRow letter="G" tile="#FF8A00" name="Gym membership" meta="Monthly · 1 Dec" price="R399.00" at={a + 0.85} />
        </Panel>
      </FeatureFrame>

      <FeatureFrame idx={1} at={b} out={c - 0.35} icon={bell} iconLoop title={['Reminders', {w: 'before', color: C.yellow, under: true}, 'you pay.']}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 26, alignItems: 'center'}}>
          <Toast at={b + 0.45} title="Netflix renews in 3 days" body="R129.00 on 20 Nov · Tap to review" accent={C.violet} />
          <Toast at={b + 0.9} title="Gym membership renews tomorrow" body="R399.00 · Still using it?" accent={C.yellow} />
        </div>
      </FeatureFrame>

      <FeatureFrame idx={2} at={c} out={end - 0.2} icon={chart} title={['See', 'exactly', 'what', 'you', {w: 'spend.', color: C.mint, under: true}]}>
        <Panel>
          <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
            <div style={{fontWeight: 700, fontSize: 30, color: '#7A6E92'}}>This month</div>
            <div style={{fontWeight: 800, fontSize: 64, color: '#1A0B2E', letterSpacing: -2}}>
              {money(interpolate(t, [c + 0.5, c + 1.6], [0, 587.99], {...clamp, easing: Easing.out(Easing.cubic)}))}
            </div>
          </div>
          <div style={{display: 'flex', height: 26, borderRadius: 13, overflow: 'hidden', marginTop: 18, background: '#EFEAF8'}}>
            {bars.map((w, i) => (
              <div
                key={i}
                style={{
                  width: `${w * 100 * total}%`,
                  background: ['#E50914', '#1DB954', '#FF8A00'][i],
                  marginRight: 4,
                }}
              />
            ))}
          </div>
          <div style={{display: 'flex', gap: 30, marginTop: 18, fontWeight: 700, fontSize: 26, color: '#4B3F63'}}>
            <span>● Netflix</span>
            <span>● Spotify</span>
            <span>● Gym</span>
          </div>
        </Panel>
      </FeatureFrame>
    </>
  );
};

const Toast: React.FC<{at: number; title: string; body: string; accent: string}> = ({at, title, body, accent}) => {
  const s = useSpringAt(at, {damping: 14, stiffness: 170, mass: 0.8});
  return (
    <div
      style={{
        width: 860,
        display: 'flex',
        gap: 24,
        alignItems: 'center',
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 40,
        padding: '26px 32px',
        fontFamily: FONT,
        boxShadow: '0 30px 60px rgba(8,2,20,0.45)',
        transform: `translateY(${(1 - s) * -120}px) scale(${0.9 + 0.1 * s})`,
        opacity: Math.min(1, s * 1.5),
        borderLeft: `14px solid ${accent}`,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 22,
          background: C.violet,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width={40} height={40} viewBox="0 0 24 24" fill="#fff">
          <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5.5-6.84V3.5a1.5 1.5 0 0 0-3 0v.66A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z" />
        </svg>
      </div>
      <div>
        <div style={{fontWeight: 800, fontSize: 36, color: '#1A0B2E', letterSpacing: -0.5}}>{title}</div>
        <div style={{fontWeight: 500, fontSize: 28, color: '#7A6E92'}}>{body}</div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 5 — CTA                                                       */
/* ------------------------------------------------------------------ */
const CTA: React.FC = () => {
  const {t} = useT();
  const {start, lockup, badge, end} = S.cta;
  const headOut = interpolate(t, [lockup - 0.25, lockup + 0.25], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const wm = interpolate(t, [lockup + 0.15, lockup + 0.8], [0, 1], clamp);
  const b = useSpringAt(badge, {damping: 11, stiffness: 160, mass: 0.8});
  const glow = 0.55 + 0.45 * Math.sin(t * 4);
  const fade = interpolate(t, [end - 0.6, end], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 560,
          left: 70,
          right: 70,
          transform: `translateY(${-headOut * 330}px) scale(${1 - headOut * 0.38})`,
        }}
      >
        <Kinetic
          at={start}
          size={128}
          stagger={0.09}
          words={['Never', 'miss', 'a', 'subscription', {w: 'again.', color: C.yellow, under: true}]}
        />
      </div>
      {t >= lockup && (
        <>
          <LottieAt data={burst} x={W / 2} y={1010} size={760} at={lockup} pop={false} />
          <LottieAt data={logo} x={W / 2} y={1010} size={380} at={lockup} />
          <div style={{position: 'absolute', top: 1230, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
            <Wordmark size={120} reveal={wm} />
          </div>
        </>
      )}
      <div
        style={{
          position: 'absolute',
          top: 1420,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          transform: `scale(${b})`,
          opacity: Math.min(1, b * 1.5),
        }}
      >
        <PlayBadge scale={1.05} glow={glow} />
      </div>
      <AbsoluteFill style={{background: '#000', opacity: fade}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
export const TrackscribeAd: React.FC = () => {
  const {t} = useT();
  const danger = interpolate(t, [S.problem.start, S.problem.start + 1, S.reveal.start, S.reveal.start + 0.3], [0, 1, 1, 0], clamp);
  const bright = interpolate(t, [S.reveal.start, S.reveal.start + 0.6], [0, 1], clamp);
  const startFade = interpolate(t, [0, 0.3], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: C.bg0}}>
      <Backdrop danger={danger} bright={bright} />
      {t <= S.problem.start + 0.6 && <Hook />}
      {t >= S.problem.start - 0.1 && t <= S.problem.end + 0.5 && <Problem />}
      <Features />
      {t >= S.cta.start - 0.1 && <CTA />}
      {t >= S.reveal.start - 0.1 && t <= S.reveal.end + 0.5 && <Reveal />}
      <AbsoluteFill style={{background: '#000', opacity: startFade}} />
      <Sound />
    </AbsoluteFill>
  );
};
