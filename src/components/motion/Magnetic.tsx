import { Children, cloneElement, useCallback, useEffect, useRef } from 'react';
import type { MutableRefObject, ReactElement, Ref } from 'react';
import { EASE, canHover, isStill } from '@/lib/motion';

export interface MagneticProps {
  /** ONE link or button: a DOM element or a forwardRef component (<Link>, <Button>). */
  children: ReactElement;
  /** Share of the pointer's offset from the centre that the element follows. */
  strength?: number;
}

/** However far the pointer is, the element never leaves home by more than this. */
const MAX_PULL_PX = 12;
const FOLLOW = 0.2;
const RELEASE_MS = 700;

/**
 * Magnetic hover for a call to action: the control leans a few pixels towards the
 * pointer and eases home with expo-out when it leaves.
 *
 * Adds no wrapper — the child is cloned with a ref — so it cannot disturb a flex row
 * or a full-width button. It moves the element with the individual `translate`
 * property, not `transform`, and never sets `transition`, so the child's own Tailwind
 * transforms and colour transitions carry on untouched. Fine pointers only.
 */
const Magnetic = ({ children, strength = 0.3 }: MagneticProps) => {
  const child = Children.only(children);
  const nodeRef = useRef<HTMLElement | null>(null);
  const childRef = (child as ReactElement & { ref?: Ref<HTMLElement> }).ref;

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      nodeRef.current = node;
      if (typeof childRef === 'function') childRef(node);
      else if (childRef) (childRef as MutableRefObject<HTMLElement | null>).current = node;
    },
    [childRef]
  );

  useEffect(() => {
    const el = nodeRef.current;
    if (!el || isStill() || !canHover()) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    let release: Animation | undefined;

    const follow = () => {
      x += (targetX - x) * FOLLOW;
      y += (targetY - y) * FOLLOW;
      el.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
      frame = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.1 ? requestAnimationFrame(follow) : 0;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      release?.cancel();
      const rect = el.getBoundingClientRect();
      // The rect includes the current pull; take it back out to find the resting centre.
      const dx = (e.clientX - (rect.left - x + rect.width / 2)) * strength;
      const dy = (e.clientY - (rect.top - y + rect.height / 2)) * strength;
      const reach = Math.hypot(dx, dy);
      const limit = reach > MAX_PULL_PX ? MAX_PULL_PX / reach : 1;
      targetX = dx * limit;
      targetY = dy * limit;
      if (!frame) frame = requestAnimationFrame(follow);
    };

    const onLeave = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      el.style.translate = '';
      if (typeof el.animate === 'function' && (x !== 0 || y !== 0)) {
        release = el.animate(
          { translate: [`${x.toFixed(2)}px ${y.toFixed(2)}px`, '0px 0px'] },
          { duration: RELEASE_MS, easing: EASE.expoOut }
        );
      }
      x = y = targetX = targetY = 0;
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
      release?.cancel();
      el.style.translate = '';
    };
  }, [strength]);

  return cloneElement(child as ReactElement<{ ref?: Ref<HTMLElement> }>, { ref: setRef });
};

export default Magnetic;
