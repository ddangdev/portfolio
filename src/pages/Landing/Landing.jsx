import { useEffect } from 'react';
import { initLanding } from './landingEffects';
import './landing.css';

export default function Landing() {
  useEffect(() => {
    const cleanup = initLanding();
    return cleanup;
  }, []);

  return (
    <>
      {/* crawlable, screen-reader-only heading + intro (the visual hero is decorative type) */}
      <h1 className="sr-only">honolulu web designer &amp; developer — custom websites for small businesses</h1>
      <p className="sr-only">
        ddanghnl is dean dang, a freelance web designer and developer based in honolulu, hawaii. i build fast,
        custom, mobile-first websites — plus google business profile setup and website analytics — for small
        businesses across hawaii and the united states. clear pricing, personal service, and quick turnaround.
        got a website? let's build one.
      </p>

      <div className="progress" id="progress"><span className="fill" id="pfill"></span></div>
      <div className="top">
        <span className="logo" id="homeLink" title="back to the start">ddanghnl</span>
        <span className="r">honolulu web developer</span>
      </div>

      {/* scattered background letters + the assembling heading */}
      <div className="filler" id="filler" aria-hidden="true"></div>
      <div className="assembly" id="assembly"></div>
      <div className="subcta" id="subcta"><span className="go">start a project →</span></div>

      {/* floating past-work blobs */}
      <div className="blobs" id="blobs">
        <div className="blob b2" id="workBlob" role="button" tabIndex={0} aria-haspopup="dialog">
          <span className="bname">my work</span>
        </div>
      </div>

      {/* work list modal */}
      <div className="workModal" id="workModal" role="dialog" aria-modal="true" aria-label="my work">
        <div className="wmCard">
          <button className="wmClose" id="wmClose" aria-label="close">×</button>
          <h3 className="wmH">stuff i've built</h3>
          <p className="wmSub">a few honolulu spots i've helped get online.</p>
          <ul className="wmList">
            <li>
              <a className="wmItem" href="https://manipedihnl.com" target="_blank" rel="noopener">
                <span className="wmDot" style={{ background: '#EB0000' }}></span>
                <span className="wmMeta">
                  <span className="wmName">mani pedi spa</span>
                  <span className="wmType">nail salon · honolulu</span>
                </span>
                <span className="wmGo">visit →</span>
              </a>
            </li>
          </ul>
          <p className="wmFoot">more on the way 🤙</p>
        </div>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="chaos">
          <div className="line l1">
            <span style={{ transform: 'rotate(-13deg) translateY(-.03em) scale(1.12)' }}>g</span>
            <span style={{ transform: 'rotate(9deg) translateY(.10em) scale(.86)' }}>o</span>
            <span style={{ transform: 'rotate(-6deg) translateY(-.08em) scale(1.22)' }}>t</span>
            <span style={{ width: '.12em' }}></span>
            <span style={{ transform: 'rotate(16deg) translateY(.14em) scale(.8)' }}>a</span>
          </div>
          <div className="line l2">
            <span style={{ transform: 'rotate(-9deg) translateY(-.05em) scale(1.14)' }}>w</span>
            <span style={{ transform: 'rotate(12deg) translateY(.11em) scale(.9)' }}>e</span>
            <span style={{ transform: 'rotate(-15deg) translateY(-.04em) scale(1.06)' }}>b</span>
            <span style={{ transform: 'rotate(7deg) translateY(.13em) scale(.84)' }}>s</span>
            <span style={{ transform: 'rotate(-11deg) translateY(-.09em) scale(1.1)' }}>i</span>
            <span style={{ transform: 'rotate(10deg) translateY(.06em) scale(.92)' }}>t</span>
            <span style={{ transform: 'rotate(-7deg) translateY(-.11em) scale(1.2)' }}>e</span>
            <span style={{ transform: 'rotate(15deg) translateY(.04em) scale(1.32)' }}>?</span>
          </div>
        </div>
        <span className="cue">scroll ↓</span>
      </section>
      <div className="getZone"></div>

      {/* what you get */}
      <section className="get" id="get">
        <div className="getGlow" id="getGlow"></div>
        <div className="getBg" id="getBg" aria-hidden="true"></div>

        {/* step 0: the essentials */}
        <div className="stepPanel on" id="stepEss">
          <div className="getInner">
            <p className="getKick">the essentials</p>
            <h2 className="getH">everything you need,<br />nothing you don't.</h2>
            <div className="getRow">
              <div className="getCard"><span className="num">01</span><h3>a website</h3><p>fast, custom-built, and made for phones first.</p></div>
              <div className="getCard"><span className="num">02</span><h3>google business</h3><p>set up so locals &amp; tourists actually find you.</p></div>
              <div className="getCard"><span className="num">03</span><h3>analytics</h3><p>see what's working, explained in plain english.</p></div>
            </div>
            <button className="essGo fillbtn" id="essGo"><span className="lbl">let's do it&nbsp;→</span><span className="fill" aria-hidden="true"><span className="lbl">let's do it&nbsp;→</span></span></button>
          </div>
        </div>

        {/* step 1: interests */}
        <div className="stepPanel fstep" id="stepInterest">
          <div className="formInner">
            <p className="fKick">step 1 of 3</p>
            <h2 className="fH">what can i help with?</h2>
            <p className="fSub">pick what you need — one or a few.</p>
            <div className="optRow">
              <div className="opt" data-key="website"><span className="chk">✓</span><span className="oicon" data-ic="web"></span><span className="txt"><span className="oname">a website</span><span className="odesc">fast, custom-built</span></span></div>
              <div className="opt" data-key="gbp"><span className="chk">✓</span><span className="oicon" data-ic="pin"></span><span className="txt"><span className="oname">google business</span><span className="odesc">get found locally</span></span></div>
              <div className="opt" data-key="analytics"><span className="chk">✓</span><span className="oicon" data-ic="chart"></span><span className="txt"><span className="oname">analytics</span><span className="odesc">see what works</span></span></div>
            </div>
            <div><button className="fUnsure" id="iUnsure">not sure yet? i'll help you figure it out</button></div>
          </div>
        </div>

        {/* step 2: adaptive situation questions */}
        <div className="stepPanel fstep" id="stepDetails">
          <div className="formInner">
            <p className="fKick">step 2 of 3</p>
            <h2 className="fH" id="d2H">where are you at?</h2>
            <p className="fSub" id="d2Sub">tap what fits — takes two seconds.</p>
            <div className="q2host" id="q2host"></div>
          </div>
        </div>

        {/* step 3: contact */}
        <div className="stepPanel fstep" id="stepContact">
          <div className="formInner">
            <p className="fKick">step 3 of 3</p>
            <h2 className="fH">how do i reach you?</h2>
            <p className="fSub">just the essentials — i'll follow up personally.</p>
            <div className="fForm">
              <div className="fField" id="fldName"><label>your name</label><input className="fInput" id="cName" type="text" placeholder="jane doe" autoComplete="name" /></div>
              <div className="fField" id="fldContact"><label>email or phone</label><input className="fInput" id="cContact" type="text" placeholder="jane@shop.com  ·  808-555-0123" /></div>
              <div className="fField"><label>anything else? <span style={{ opacity: .55 }}>(optional)</span></label><textarea className="fArea" id="cMsg" placeholder="a link, a deadline, what you're dreaming up…"></textarea></div>
            </div>
            <input className="hp" id="hp" type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <p className="sendErr" id="sendErr" role="alert"></p>
          </div>
        </div>

        {/* confirmation */}
        <div className="stepPanel" id="stepDone">
          <div className="formInner">
            <div className="doneWrap">
              <h2 className="doneH">mahalo!</h2>
              <p className="doneSub">i'll take a look and get back to you personally — usually within a day or two.</p>
              <div className="ticket print" id="ticket"><span className="tkHead">the plan</span><ul className="tkList" id="tkList"></ul><div className="tkDiv"></div><span className="tkStatus">status: <b>sent</b>&nbsp;🤙</span></div>
              <button className="fUnsure" id="doneHome" style={{ marginTop: '26px' }}>← back to the start</button>
            </div>
          </div>
        </div>

        {/* persistent form nav */}
        <div className="formNav" id="formNav">
          <button className="fBack" id="navBack">← back</button>
          <button className="fNext" id="navNext">next&nbsp;→</button>
          <button className="sendBtn fillbtn" id="navSend"><span className="lbl">send it&nbsp;→</span><span className="fill" aria-hidden="true"><span className="lbl">send it&nbsp;→</span></span></button>
        </div>
      </section>
    </>
  );
}
