/**
 * Utility to reliably reset window and document scroll position to the very top.
 * Prevents the SPA issue where navigating between views (e.g. Cápsula do Tempo -> Product -> Store)
 * leaves the user stranded at the bottom of the page near the footer on mobile or desktop.
 */
export function scrollToTop(instant: boolean = true) {
  if (typeof window === 'undefined') return;

  const reset = () => {
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: instant ? 'instant' : 'auto',
      });
    } catch {
      window.scrollTo(0, 0);
    }

    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    const main = document.getElementById('main-content');
    if (main) {
      main.scrollTop = 0;
    }

    const root = document.getElementById('root');
    if (root) {
      root.scrollTop = 0;
    }

    // Try scrolling top elements into view if available
    const topTargets = ['product-detail-top', 'time-capsule-top', 'store-top', 'track-top'];
    for (const id of topTargets) {
      const el = document.getElementById(id);
      if (el) {
        try {
          el.scrollIntoView({ block: 'start', inline: 'nearest', behavior: instant ? 'instant' : 'auto' } as any);
        } catch {
          el.scrollIntoView(true);
        }
        break;
      }
    }
  };

  // Run immediately
  reset();

  // Run in next animation frame to catch post-render layout shifts
  requestAnimationFrame(() => {
    reset();
  });

  // Schedule follow-ups to counter any delayed image render or momentum scrolling
  setTimeout(reset, 20);
  setTimeout(reset, 80);
  setTimeout(reset, 200);
}
