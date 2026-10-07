/**
 * The app's launch sequence: the Qalam mark (a pen-stroke swash) draws
 * itself, its dot lands, the whole mark spins once in place, the bilingual
 * "قلم / Qalam" wordmark reveals, then fades -- settling back on the mark
 * alone before the Home tab takes over. Mirrors the sequence approved in
 * the icon-concepts design pass; coordinates and colors are shared 1:1
 * with that mark (and with `src/constants/theme.ts`'s existing
 * primary/accent tokens) so the two never drift apart.
 *
 * `Path#getTotalLength()` is read from a real native ref rather than a
 * guessed stroke-dasharray value -- react-native-svg exposes this on
 * Shape-based components (lib/typescript/elements/Shape.d.ts).
 */
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { ArabicFonts } from '@/constants/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const EMERALD = '#0F6B4F';
const GOLD = '#C9A24B';
const CREAM = '#FBF7EF';

// Same swash as the web concept, shifted from a (0,0)-centered local frame
// into absolute 0-1024 viewBox coordinates (adding 512 to every point)
// instead of relying on a separate group transform -- a CSS/attribute
// transform mismatch on the web version once wiped out an equivalent
// translate, so this version just bakes the offset into the path data.
const SWASH_D =
  'M 362 692 C 362 572, 302 472, 402 372 C 482 292, 622 312, 662 392 C 692 452, 662 532, 582 552 C 522 567, 472 532, 482 472 C 490 427, 532 412, 567 437';
const DOT_CX = 662;
const DOT_CY = 692;
const DOT_R = 34;

const DRAW_MS = 1100;
const DOT_DELAY_MS = 1000;
const SPIN_DELAY_MS = 1600;
const SPIN_MS = 900;
const WORDMARK_IN_DELAY_MS = 2700;
const WORDMARK_IN_MS = 500;
const WORDMARK_OUT_DELAY_MS = 3900;
const WORDMARK_OUT_MS = 400;

const EASE = Easing.bezier(0.65, 0, 0.35, 1);

export function LaunchAnimation({ onFinish }: { onFinish: () => void }) {
  const pathRef = useRef<Path>(null);
  const [pathLength, setPathLength] = useState<number | null>(null);

  const dashOffset = useSharedValue(0);
  const dotScale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const wordmarkOpacity = useSharedValue(0);
  const wordmarkTranslateY = useSharedValue(8);

  useEffect(() => {
    // getTotalLength() needs the native shape to have already measured its
    // geometry; on the very first frame that isn't always ready yet, so
    // retry on the next frame rather than silently skipping the animation.
    let frame: number;
    const tryMeasure = () => {
      const length = pathRef.current?.getTotalLength();
      if (!length) {
        frame = requestAnimationFrame(tryMeasure);
        return;
      }
      startSequence(length);
    };

    function startSequence(length: number) {
      setPathLength(length);
      dashOffset.value = length;
      dashOffset.value = withTiming(0, { duration: DRAW_MS, easing: EASE });

      dotScale.value = withDelay(DOT_DELAY_MS, withSpring(1, { damping: 9, stiffness: 160 }));

      rotation.value = withDelay(SPIN_DELAY_MS, withTiming(360, { duration: SPIN_MS, easing: EASE }));

      wordmarkOpacity.value = withDelay(
        WORDMARK_IN_DELAY_MS,
        withTiming(1, { duration: WORDMARK_IN_MS })
      );
      wordmarkTranslateY.value = withDelay(
        WORDMARK_IN_DELAY_MS,
        withTiming(0, { duration: WORDMARK_IN_MS })
      );

      wordmarkOpacity.value = withDelay(
        WORDMARK_OUT_DELAY_MS,
        withTiming(0, { duration: WORDMARK_OUT_MS }, (finished) => {
          if (finished) runOnJS(onFinish)();
        })
      );
    }

    tryMeasure();
    return () => cancelAnimationFrame(frame);
    // Runs once on mount -- this is a one-shot launch sequence, not a
    // reactive effect over changing props/state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pathAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  const dotAnimatedProps = useAnimatedProps(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  const stageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const wordmarkAnimatedStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: wordmarkTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.stage, stageAnimatedStyle]}>
        <Svg width={160} height={160} viewBox="0 0 1024 1024">
          {/* Invisible -- exists only so its ref can measure the real path
              length via getTotalLength(), which the visible AnimatedPath
              below (identical geometry) uses for its stroke-dasharray. */}
          <Path ref={pathRef} d={SWASH_D} stroke="none" fill="none" />
          {pathLength !== null && (
            <>
              <AnimatedPath
                d={SWASH_D}
                fill="none"
                stroke={EMERALD}
                strokeWidth={46}
                strokeLinecap="round"
                strokeDasharray={pathLength}
                animatedProps={pathAnimatedProps}
              />
              <AnimatedCircle
                cx={DOT_CX}
                cy={DOT_CY}
                r={DOT_R}
                fill={GOLD}
                animatedProps={dotAnimatedProps}
              />
            </>
          )}
        </Svg>
      </Animated.View>
      <Animated.View style={wordmarkAnimatedStyle}>
        <Text style={styles.arabic}>قلم</Text>
        <Text style={styles.english}>Qalam</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: CREAM,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  stage: {
    width: 180,
    height: 180,
    borderRadius: 40,
    backgroundColor: CREAM,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  arabic: {
    fontFamily: ArabicFonts.quranBold,
    fontSize: 30,
    color: EMERALD,
    textAlign: 'center',
  },
  english: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#60646C',
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
