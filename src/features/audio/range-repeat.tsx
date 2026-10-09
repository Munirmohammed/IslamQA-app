import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { useAyahAudioUrl } from './api';

const DISABLED_ICON_COLOR = '#999999';

interface RangeRepeatProps {
  surahNumber: number;
  totalAyahs: number;
  reciterId: number;
}

const REPEAT_OPTIONS = [3, 5, 10];

/** Loop a chosen ayah range back to back, N times -- the "drill this
 * passage" workflow every memorization app offers (A/B repeat), which
 * this app otherwise lacked entirely. Plays each ayah's individual audio
 * file in sequence (not the single combined surah file, which carries no
 * per-ayah timing data), auto-advancing when one finishes. */
export function RangeRepeat({ surahNumber, totalAyahs, reciterId }: RangeRepeatProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [fromAyah, setFromAyah] = useState(1);
  const [toAyah, setToAyah] = useState(Math.min(3, totalAyahs));
  const [repeatCount, setRepeatCount] = useState(3);

  const [isActive, setIsActive] = useState(false);
  const [currentAyah, setCurrentAyah] = useState(fromAyah);
  const [completedLoops, setCompletedLoops] = useState(0);

  const { data: audio } = useAyahAudioUrl(reciterId, surahNumber, isActive ? currentAyah : undefined);
  const player = useAudioPlayer(audio?.url ?? null);

  // A ref, not a dependency-tracked callback, because the listener effect
  // below must attach once per player instance -- refreshing it every
  // render (outside render itself, per React Compiler's purity rule) keeps
  // the closure's view of currentAyah/completedLoops current without
  // re-subscribing the listener on every state change.
  const advanceRef = useRef(() => {});
  useEffect(() => {
    advanceRef.current = () => {
      if (currentAyah < toAyah) {
        setCurrentAyah((a) => a + 1);
      } else if (completedLoops + 1 < repeatCount) {
        setCompletedLoops((c) => c + 1);
        setCurrentAyah(fromAyah);
      } else {
        setIsActive(false);
        setCompletedLoops(0);
      }
    };
  });

  useEffect(() => {
    if (!isActive) return;
    let started = false;
    const sub = player.addListener('playbackStatusUpdate', (s) => {
      if (!started && s.isLoaded) {
        started = true;
        player.play();
      }
      if (s.didJustFinish) advanceRef.current();
    });
    if (player.isLoaded && !started) {
      started = true;
      player.play();
    }
    return () => sub.remove();
  }, [player, isActive]);

  function start() {
    setCurrentAyah(fromAyah);
    setCompletedLoops(0);
    setIsActive(true);
  }

  function stop() {
    setIsActive(false);
    player.pause();
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setExpanded((v) => !v)} hitSlop={8}>
        <ThemedText type="small" themeColor="primary">
          {expanded ? 'Hide drill mode' : 'Drill a passage (repeat)'}
        </ThemedText>
      </Pressable>

      {expanded && (
        <View style={styles.panel}>
          <View style={styles.stepperRow}>
            <AyahStepper
              label="From"
              value={fromAyah}
              min={1}
              max={toAyah}
              onChange={setFromAyah}
              disabled={isActive}
            />
            <AyahStepper
              label="To"
              value={toAyah}
              min={fromAyah}
              max={totalAyahs}
              onChange={setToAyah}
              disabled={isActive}
            />
          </View>

          <View style={styles.repeatRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Repeat
            </ThemedText>
            {REPEAT_OPTIONS.map((count) => {
              const selected = count === repeatCount;
              return (
                <Pressable key={count} onPress={() => setRepeatCount(count)} disabled={isActive} hitSlop={4}>
                  <ThemedView
                    type={selected ? 'primaryMuted' : 'backgroundSelected'}
                    style={styles.repeatChip}>
                    <ThemedText type="small" themeColor={selected ? 'primary' : 'textSecondary'}>
                      {count}x
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={isActive ? stop : start} hitSlop={8}>
            {({ pressed }) => (
              <ThemedView type="primaryMuted" style={[styles.startButton, pressed && styles.pressed]}>
                <Ionicons name={isActive ? 'stop' : 'play'} size={16} color={theme.primary} />
                <ThemedText type="smallBold" themeColor="primary">
                  {isActive
                    ? `Stop (ayah ${currentAyah}, loop ${completedLoops + 1}/${repeatCount})`
                    : `Repeat ayahs ${fromAyah}-${toAyah}`}
                </ThemedText>
              </ThemedView>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

interface AyahStepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled: boolean;
}

function AyahStepper({ label, value, min, max, onChange, disabled }: AyahStepperProps) {
  const theme = useTheme();
  const iconColor = disabled ? DISABLED_ICON_COLOR : theme.primary;

  return (
    <View style={styles.stepper}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <View style={styles.stepperControls}>
        <Pressable onPress={() => onChange(Math.max(min, value - 1))} disabled={disabled} hitSlop={8}>
          <Ionicons name="remove-circle-outline" size={22} color={iconColor} />
        </Pressable>
        <ThemedText type="smallBold" style={styles.stepperValue}>
          {value}
        </ThemedText>
        <Pressable onPress={() => onChange(Math.min(max, value + 1))} disabled={disabled} hitSlop={8}>
          <Ionicons name="add-circle-outline" size={22} color={iconColor} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  panel: {
    gap: Spacing.three,
    paddingTop: Spacing.two,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: Spacing.five,
  },
  stepper: {
    gap: 4,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepperValue: {
    minWidth: 20,
    textAlign: 'center',
  },
  repeatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  repeatChip: {
    borderRadius: Spacing.two,
    paddingVertical: 4,
    paddingHorizontal: Spacing.three,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
