import './worldflight.css';

export default function Home() {
  return (
    <main>
      {/* Pre-scroll hero — visible before user scrolls */}
      <section className="pre-hero">
        <div className="pre-hero__inner">
          <p className="pre-hero__tag">Bangpho, Bangkok</p>
          <h1 className="pre-hero__h">Your new workspace<br />between coffee &amp; craft beer.</h1>
          <p className="pre-hero__sub">First specialty coffee workspace in Bangpho. Scroll to explore ↓</p>
        </div>
      </section>

      {/* Worldflight: one continuous stage, 5 legs crossfade */}
      <div data-sc-mode="worldflight" data-sc-seam="0.12">
        <div data-sc-world>
          {/* Leg 1 — Hero workspace */}
          <div
            data-sc-segment
            data-sc-w="1.5"
            data-sc-linger="0.2"
            data-sc-waypoint="The Space"
          >
            <img
              className="sc-world__poster"
              src="/assets/poster-leg1.webp"
              alt="Warm workspace with coffee, laptop, and power outlets"
            />
          </div>

          {/* Leg 2 — Problem: cafe-hopping pain */}
          <div
            data-sc-segment
            data-sc-w="1.4"
            data-sc-linger="0.3"
            data-sc-waypoint="The Problem"
          >
            <img
              className="sc-world__poster"
              src="/assets/poster-leg2.webp"
              alt="Crowded cafe, frustrating wifi search"
            />
          </div>

          {/* Leg 3 — Solution reveal */}
          <div
            data-sc-segment
            data-sc-w="1.4"
            data-sc-linger="0.2"
            data-sc-waypoint="The Answer"
          >
            <img
              className="sc-world__poster"
              src="/assets/poster-leg3.webp"
              alt="Bright clean workspace with fast internet"
            />
          </div>

          {/* Leg 4 — Features: evening craft beer */}
          <div
            data-sc-segment
            data-sc-w="1.4"
            data-sc-linger="0.3"
            data-sc-waypoint="After Hours"
          >
            <img
              className="sc-world__poster"
              src="/assets/poster-leg4.webp"
              alt="Craft beer evening with community vibe"
            />
          </div>

          {/* Leg 5 — CTA: community gathering */}
          <div
            data-sc-segment
            data-sc-w="1.3"
            data-sc-linger="0.2"
            data-sc-waypoint="Join Us"
          >
            <img
              className="sc-world__poster"
              src="/assets/poster-leg5.webp"
              alt="Community gathering of remote workers"
            />
          </div>
        </div>

        {/* Copy layer — overlays on the fixed stage */}
        <div data-sc-world-copy>
          {/* Scrim for text contrast */}
          <div className="sc-world__scrim sc-scrim sc-scrim--band" />

          {/* Leg 1 copy — Hero */}
          <div data-sc-copy data-sc-window="hero" className="sc-copy--center">
            <h2 className="wf-h">Bangpho&apos;s First<br />Coffee Workspace</h2>
            <p className="wf-p">
              Specialty coffee by day. Craft beer by night.<br />
              100+ Mbps WiFi. Every seat has a power outlet.
            </p>
            <a href="#waitlist" className="wf-cta">Join the Waitlist</a>
          </div>

          {/* Leg 2 copy — Problem */}
          <div data-sc-copy data-sc-window="0.20 0.38" className="sc-copy--lead">
            <p className="wf-label">The problem</p>
            <h2 className="wf-h2">Tired of cafe-hopping?</h2>
            <ul className="wf-list">
              <li>WiFi that dies mid-call</li>
              <li>No outlets within arm&apos;s reach</li>
              <li>No meeting rooms, ever</li>
            </ul>
          </div>

          {/* Leg 3 copy — Solution */}
          <div data-sc-copy data-sc-window="0.40 0.58" className="sc-copy--trail">
            <p className="wf-label">The answer</p>
            <h2 className="wf-h2">Everything you need. One price.</h2>
            <div className="wf-stats">
              <div className="wf-stat">
                <span className="wf-stat__num">฿40</span>
                <span className="wf-stat__lbl">Americano</span>
              </div>
              <div className="wf-stat">
                <span className="wf-stat__num">100+</span>
                <span className="wf-stat__lbl">Mbps WiFi</span>
              </div>
              <div className="wf-stat">
                <span className="wf-stat__num">∞</span>
                <span className="wf-stat__lbl">Outlets</span>
              </div>
            </div>
          </div>

          {/* Leg 4 copy — Features */}
          <div data-sc-copy data-sc-window="0.60 0.78" className="sc-copy--lead">
            <p className="wf-label">More than coffee</p>
            <h2 className="wf-h2">Work hard. Unwind harder.</h2>
            <ul className="wf-features">
              <li>🎥 Conference rooms for client calls</li>
              <li>🍺 Craft beer on tap after 5pm</li>
              <li>🤝 Community of builders &amp; creators</li>
            </ul>
          </div>

          {/* Leg 5 copy — CTA */}
          <div data-sc-copy data-sc-window="finale" className="sc-copy--center">
            <h2 className="wf-h">Be first in.</h2>
            <p className="wf-p">
              Join the waitlist. Early members get<br />
              <strong>one month free</strong> + founding member pricing.
            </p>
            <form id="waitlist" className="wf-signup" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                aria-label="Email address"
                required
                className="wf-input"
              />
              <button type="submit" className="wf-cta">
                Join Waitlist
              </button>
            </form>
            <p className="wf-fine">Opening Q1 2027 · Bangpho, MRT Blue Line</p>
          </div>
        </div>

        {/* Spacer — engine sets height to sum of segment weights + 1vh */}
        <div data-sc-spacer aria-hidden="true" />
      </div>
    </main>
  );
}
