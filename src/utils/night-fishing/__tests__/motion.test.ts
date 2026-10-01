import { describe, expect, it } from 'vitest';

import { BITE_DURATION, getBiteFrame } from '../bite';
import { FLOATS, LOOP_SECONDS, REFLECTION, STEP_FPS } from '../config';
import { computeLayout } from '../layout';
import { bobShape, getFloatPose } from '../motion';

describe('bobShape', () => {
  it('peaks at the middle and bottoms out at both ends', () => {
    for (const sharpness of [0, 0.5, 1]) {
      expect(bobShape(0, sharpness)).toBeCloseTo(0);
      expect(bobShape(0.5, sharpness)).toBeCloseTo(1);
      expect(bobShape(1, sharpness)).toBeCloseTo(0);
    }
  });
});

describe('getFloatPose', () => {
  it('loops seamlessly every LOOP_SECONDS', () => {
    for (const { motion } of FLOATS) {
      for (const t of [0, 1.37, 5.5, 11.9, 23.99]) {
        const a = getFloatPose(motion, t);
        const b = getFloatPose(motion, t + LOOP_SECONDS);
        expect(b.dx).toBeCloseTo(a.dx, 6);
        expect(b.dy).toBeCloseTo(a.dy, 6);
        expect(b.sink).toBeCloseTo(a.sink, 6);
        expect(b.tilt).toBeCloseTo(a.tilt, 6);
      }
    }
  });

  it('uses integer cycle counts for every periodic component', () => {
    for (const { motion } of FLOATS) {
      const harmonics = [...motion.bobModulation, ...motion.drift, ...motion.sway];
      for (const cycles of [motion.bobCycles, ...harmonics.map(([, c]) => c)]) {
        expect(Number.isInteger(cycles)).toBe(true);
      }
    }
  });

  it('regenerates the reflection wave an integer number of times per loop', () => {
    const drawings = LOOP_SECONDS * (STEP_FPS > 0 ? STEP_FPS : 12);
    expect(Number.isInteger(drawings / REFLECTION.boil.hold)).toBe(true);
  });
});

describe('getBiteFrame', () => {
  it('starts and ends at rest', () => {
    for (const tau of [0, BITE_DURATION]) {
      const frame = getBiteFrame(tau);
      expect(frame.sink).toBeCloseTo(0);
      expect(frame.dx).toBeCloseTo(0);
      expect(frame.tilt).toBeCloseTo(0);
      expect(frame.stretch).toBeCloseTo(1);
      expect(frame.reflection).toBeCloseTo(1);
      expect(frame.line).toBeNull();
    }
  });

  it('drags the float under, then lifts it out of the water on a taut line', () => {
    expect(getBiteFrame(1).sink).toBeGreaterThan(1);
    expect(getBiteFrame(1).line).toBeNull();
    expect(getBiteFrame(15 / 12).line).not.toBeNull();
    expect(getBiteFrame(39 / 12).line?.end).toBe('tip');
    const lifted = getBiteFrame(1.5);
    expect(lifted.sink).toBeLessThan(0);
    expect(lifted.reflection).toBe(0);
    expect(lifted.splashAt).not.toBeNull();
    expect(lifted.rippleAt).toBeNull();
  });

  it('stirs the water on impact and leaves a ripple after landing', () => {
    expect(getBiteFrame(1 / 12).agitation).toBeGreaterThan(0.5);
    const landed = getBiteFrame(40 / 12);
    expect(landed.rippleAt).not.toBeNull();
    expect(landed.reflection).toBe(1);
    expect(getBiteFrame(BITE_DURATION - 0.01).agitation).toBeLessThan(0.05);
  });

  it('mirrors horizontal motion when the rod is on the right', () => {
    const left = getBiteFrame(1.45);
    const right = getBiteFrame(1.45, true);
    expect(right.dx).toBeCloseTo(-left.dx);
    expect(right.tilt).toBeCloseTo(-left.tilt);
    expect(right.sink).toBeCloseTo(left.sink);
    expect(right.line?.rodX).toBeCloseTo(-(left.line?.rodX ?? 0));
  });
});

describe('computeLayout', () => {
  it('keeps the original composition on landscape screens', () => {
    const layout = computeLayout(1920, 1080);
    expect(layout.scale).toBeCloseTo(1);
    expect(layout.anchors[0].x).toBeGreaterThan(layout.anchors[1].x);
    expect(layout.anchors[0].y).toBeLessThan(layout.anchors[1].y);
  });

  it('moves the floats into the lower half on portrait screens', () => {
    const layout = computeLayout(390, 844);
    for (const anchor of layout.anchors) {
      expect(anchor.y).toBeGreaterThan(844 / 2);
    }
  });
});
