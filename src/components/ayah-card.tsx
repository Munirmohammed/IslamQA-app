import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ArabicText } from '@/components/arabic-text';
import { ShareAyahButton } from '@/components/share-ayah-button';
import { TajweedText } from '@/components/tajweed-text';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WordByWordText } from '@/components/word-by-word-text';
import { Spacing } from '@/constants/theme';
import { AyahListenButton } from '@/features/audio/ayah-listen-button';
import { useMe } from '@/features/auth/api';
import { useAddToMemorization } from '@/features/memorization/api';
import { useWordByWord } from '@/features/quran/api';
import { useAyahTajweed } from '@/features/tajweed/api';
import { useTheme } from '@/hooks/use-theme';

import type { Ayah } from '@/features/quran/types';

interface AyahCardProps {
  ayah: Ayah;
  surahNameEn: string;
}

/** A single ayah: Uthmani text (+ Basmalah, when this ayah carries one --
 * see Backend Phase 1's Basmalah-splitting fix), translation, a mic
 * shortcut into the Practice tab preset to check *this* ayah (Phase 2), and
 * a one-tap share button (Phase F2's shareable ayah cards). Tajweed
 * coloring and a fuller long-press action menu (Explain / Memorize) are
 * later phases layered onto this same component. */
export function AyahCard({ ayah, surahNameEn }: AyahCardProps) {
  const theme = useTheme();
  const { data: me } = useMe();
  const addToMemorization = useAddToMemorization();
  const [displayMode, setDisplayMode] = useState<'plain' | 'tajweed' | 'wordByWord'>('plain');
  const { data: tajweed } = useAyahTajweed(ayah.surah_number, ayah.ayah_number, displayMode === 'tajweed');
  const { data: wordByWord } = useWordByWord(
    ayah.surah_number,
    ayah.ayah_number,
    displayMode === 'wordByWord'
  );

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <View style={styles.headerRow}>
        <View style={[styles.numberBadge, { backgroundColor: theme.primaryMuted }]}>
          <ThemedText type="small" themeColor="primary" style={styles.numberText}>
            {ayah.ayah_number}
          </ThemedText>
        </View>

        <Link
          href={`/quran/practice?surah=${ayah.surah_number}&ayah=${ayah.ayah_number}&surahNameEn=${encodeURIComponent(surahNameEn)}`}
          asChild>
          <Pressable hitSlop={8}>
            {({ pressed }) => (
              <View style={[styles.micBadge, { opacity: pressed ? 0.6 : 1 }]}>
                <Ionicons name="mic-outline" size={14} color={theme.primary} />
                <ThemedText type="small" themeColor="primary">
                  Check my recitation
                </ThemedText>
              </View>
            )}
          </Pressable>
        </Link>
      </View>

      {ayah.basmalah && (
        <ArabicText size="ayahCompact" style={styles.basmalah} themeColor="textSecondary">
          {ayah.basmalah}
        </ArabicText>
      )}

      {displayMode === 'tajweed' && tajweed ? (
        <TajweedText plainText={tajweed.plain_text} rules={tajweed.rules} />
      ) : displayMode === 'wordByWord' && wordByWord ? (
        <WordByWordText words={wordByWord} />
      ) : (
        <ArabicText>{ayah.text_uthmani}</ArabicText>
      )}

      <ThemedText themeColor="textSecondary" style={styles.translation}>
        {ayah.translation_en}
      </ThemedText>

      <View style={styles.actionsRow}>
        <AyahListenButton surah={ayah.surah_number} ayah={ayah.ayah_number} />

        <ShareAyahButton
          textUthmani={ayah.text_uthmani}
          translationEn={ayah.translation_en}
          surahNameEn={surahNameEn}
          surahNumber={ayah.surah_number}
          ayahNumber={ayah.ayah_number}
        />

        {me && (
          <Pressable
            disabled={addToMemorization.isPending}
            onPress={() =>
              addToMemorization.mutate({
                surah: ayah.surah_number,
                ayah_from: ayah.ayah_number,
                ayah_to: ayah.ayah_number,
              })
            }>
            {({ pressed }) => (
              <View style={[styles.addToHifzRow, { opacity: pressed || addToMemorization.isPending ? 0.6 : 1 }]}>
                {addToMemorization.isSuccess && (
                  <Ionicons name="checkmark-circle" size={14} color={theme.primary} />
                )}
                <ThemedText type="small" themeColor="primary">
                  {addToMemorization.isSuccess ? 'Added to Hifz' : 'Add to Hifz'}
                </ThemedText>
              </View>
            )}
          </Pressable>
        )}

        <Link
          href={{
            pathname: '/quran/tafsir',
            params: { surah: ayah.surah_number, ayah: ayah.ayah_number, surahNameEn },
          }}
          asChild>
          <Pressable>
            {({ pressed }) => (
              <ThemedText type="small" themeColor="primary" style={{ opacity: pressed ? 0.6 : 1 }}>
                Explain
              </ThemedText>
            )}
          </Pressable>
        </Link>

        <Pressable onPress={() => setDisplayMode((m) => (m === 'tajweed' ? 'plain' : 'tajweed'))}>
          {({ pressed }) => (
            <ThemedText type="small" themeColor="primary" style={{ opacity: pressed ? 0.6 : 1 }}>
              {displayMode === 'tajweed' ? 'Hide tajweed' : 'Tajweed'}
            </ThemedText>
          )}
        </Pressable>

        <Pressable onPress={() => setDisplayMode((m) => (m === 'wordByWord' ? 'plain' : 'wordByWord'))}>
          {({ pressed }) => (
            <ThemedText type="small" themeColor="primary" style={{ opacity: pressed ? 0.6 : 1 }}>
              {displayMode === 'wordByWord' ? 'Hide word-by-word' : 'Word by word'}
            </ThemedText>
          )}
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontWeight: '700',
  },
  micBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  basmalah: {
    textAlign: 'center',
    alignSelf: 'center',
  },
  translation: {
    textAlign: 'left',
  },
  addToHifzRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    alignItems: 'center',
  },
});
