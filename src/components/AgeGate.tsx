import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { EASE, ENTERED_EVENT, holdEntrancesUntil, isStill } from '@/lib/motion';
import { site } from '@/content/site';
import Logo from './Logo';

// index.html repeats the key and the validity in its pre-paint script — change both together.
const STORAGE_KEY = 'aktcl-age-ok';
const VALID_FOR_MS = 30 * 24 * 60 * 60 * 1000;

/** The gate leaves the way the route curtain does: lifted off the top, expo-in-out. */
const LIFT_MS = 600;
/** The page's entrance starts this far into the lift, as the sheet clears the headline. */
const ENTRANCE_LEAD_MS = 260;

function hasConfirmed() {
  try {
    const confirmedAt = Number(window.localStorage.getItem(STORAGE_KEY));
    return confirmedAt > 0 && Date.now() - confirmedAt < VALID_FOR_MS;
  } catch {
    // Storage blocked (private mode, strict cookie settings): ask on every visit.
    return false;
  }
}

const BUTTON =
  'inline-flex min-h-12 w-full items-center justify-center rounded-md px-6 font-sans text-sm font-semibold uppercase tracking-[0.16em] transition-colors focus-visible:ring-gold focus-visible:ring-offset-ink';

/**
 * Legal-age gate, mounted once in App.tsx.
 *
 * Skipped for the prerenderer, so crawlers and link previews get the real page, and
 * for visitors who confirmed within the last 30 days. That check runs inside the
 * useState initialiser — synchronously, before the first paint — so a returning
 * visitor never sees the gate flash up.
 *
 * Deliberately not dismissable: no close button, Escape and backdrop clicks do
 * nothing, and "No" leaves no way in.
 *
 * On "Yes" the page is released at once — no longer inert, scroll unlocked — and the
 * sheet, by then only a picture, lifts away over it ("leaving"). It never stands
 * between the visitor and the page: it takes no pointer events and is hidden from
 * assistive tech while it goes. Under isStill() it is simply gone.
 */
const AgeGate = () => {
  const [state, setState] = useState<'passed' | 'asking' | 'leaving' | 'refused'>(() => {
    const passed = window.__PRERENDER__ || hasConfirmed();
    // Entrance choreography (useEntered in lib/motion) reads this. Set here, ahead of
    // the pages' first render, so a returning visitor's hero starts without a beat lost.
    if (passed) window.__aktclEntered = true;
    return passed ? 'passed' : 'asking';
  });
  const sheetRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const liftTimer = useRef<number>();
  const titleId = useId();
  const textId = useId();
  const leaving = state === 'leaving';
  // Asking or refused: the gate is a modal. Leaving: it is only an animation.
  const open = state === 'asking' || state === 'refused';

  useEffect(() => () => window.clearTimeout(liftTimer.current), []);

  // Layout effect: the lift starts on the same frame the page behind is released.
  useLayoutEffect(() => {
    const sheet = sheetRef.current;
    if (!leaving || !sheet || typeof sheet.animate !== 'function') return;
    const lift = sheet.animate(
      { clipPath: ['inset(0% 0% 0% 0%)', 'inset(0% 0% 100% 0%)'] },
      { duration: LIFT_MS, easing: EASE.expoInOut, fill: 'both' }
    );
    return () => lift.cancel();
  }, [leaving]);

  useEffect(() => {
    if (!open) return;

    // The dialog is portalled to <body>, so the whole app can be made inert: not
    // focusable, not clickable, not read out. Scroll is locked on top of that.
    const app = document.getElementById('root');
    const previousOverflow = document.body.style.overflow;
    app?.setAttribute('inert', '');
    document.body.style.overflow = 'hidden';
    // SmoothScroll also watches the body lock; saying it outright keeps the gate
    // correct whichever of the two mounts first.
    window.__lenis?.stop();

    // Tab loop for browsers without `inert`, and for focus arriving from the
    // browser's own UI. With no buttons left ("refused") focus stays on the dialog.
    const onKeyDown = (e: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (e.key !== 'Tab' || !dialog) return;
      const buttons = dialog.querySelectorAll<HTMLElement>('button');
      const first = buttons[0] ?? dialog;
      const last = buttons[buttons.length - 1] ?? dialog;
      const active = document.activeElement;
      if (!dialog.contains(active) || active === (e.shiftKey ? first : last)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      app?.removeAttribute('inert');
      document.body.style.overflow = previousOverflow;
      window.__lenis?.start();
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // index.html keeps the prerendered page unpainted until this component has taken
  // over; from here on the overlay below does the hiding.
  useLayoutEffect(() => {
    document.documentElement.classList.remove('age-pending');
  }, []);

  useEffect(() => {
    if (state === 'asking') confirmRef.current?.focus();
    // Moving focus to the dialog makes screen readers announce the refusal.
    if (state === 'refused') dialogRef.current?.focus();
  }, [state]);

  if (!open && !leaving) return null;

  const confirm = () => {
    // Enter held down on the focused button must not confirm twice.
    if (state !== 'asking') return;
    confirmRef.current?.blur();
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // Not remembered; the visitor is simply asked again next time.
    }
    const lifts = !isStill();
    setState(lifts ? 'leaving' : 'passed');
    if (lifts) {
      liftTimer.current = window.setTimeout(() => setState('passed'), LIFT_MS);
      // Seen, not spent under the sheet: the same hand-off the route curtain uses.
      holdEntrancesUntil(performance.now() + ENTRANCE_LEAD_MS);
    }
    // The page behind the gate has been holding its entrance for this.
    window.__aktclEntered = true;
    window.dispatchEvent(new Event(ENTERED_EVENT));
  };

  return createPortal(
    <div
      ref={sheetRef}
      aria-hidden={leaving || undefined}
      className={cn(
        'fixed inset-0 z-[200] overflow-y-auto overscroll-contain bg-ink/95 backdrop-blur-md animate-in fade-in duration-500 ease-quart-out',
        leaving && 'pointer-events-none'
      )}
    >
      <div className="flex min-h-full items-center justify-center px-4 py-10">
        <div
          ref={dialogRef}
          // A sheet on its way out is no longer a dialog anyone has to answer.
          role={leaving ? undefined : 'dialog'}
          aria-modal={leaving ? undefined : true}
          aria-labelledby={titleId}
          aria-describedby={state === 'asking' ? textId : undefined}
          tabIndex={-1}
          className="w-full max-w-lg border border-ink-border bg-ink px-6 py-10 text-center text-ink-foreground shadow-2xl shadow-ink focus-visible:ring-0 focus-visible:ring-offset-0 sm:px-12 sm:py-14"
        >
          <Logo variant="onDark" size="md" className="items-center" />

          {state !== 'refused' ? (
            <>
              <h2 id={titleId} className="mt-10 text-3xl font-medium sm:text-4xl">
                Are you of legal age?
              </h2>
              <p id={textId} className="mt-5 text-sm leading-relaxed text-ink-muted sm:text-base">
                This website contains information about tobacco products and is intended for tobacco
                trade professionals. You must be at least {site.legalAge} years old, or of legal age in
                your country, to enter.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <button
                  ref={confirmRef}
                  type="button"
                  onClick={confirm}
                  tabIndex={leaving ? -1 : undefined}
                  className={cn(BUTTON, 'bg-gold text-ink hover:bg-gold/90')}
                >
                  Yes, I am {site.legalAge} or over
                </button>
                <button
                  type="button"
                  onClick={() => setState('refused')}
                  tabIndex={leaving ? -1 : undefined}
                  className={cn(BUTTON, 'border border-ink-foreground/30 text-ink-foreground hover:bg-ink-foreground/10')}
                >
                  No
                </button>
              </div>
            </>
          ) : (
            <h2 id={titleId} className="mt-10 text-2xl font-medium leading-snug sm:text-3xl">
              Sorry — you must be of legal age to view this website.
            </h2>
          )}

          <p className="mt-10 border-t border-ink-border pt-6 text-xs leading-relaxed text-ink-muted">
            {site.compliance.healthWarning}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AgeGate;
