import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ArabicText } from '@/components/arabic-text';
import { ShareAyahButton } from '@/components/share-ayah-button';
import { TajweedText } from '@/components/tajweed-text';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { AyahListenButton } from '@/features/audio/ayah-listen-button';
import { useMe } from '@/features/auth/api';
import { useAddToMemorization } from '@/features/memorization/api';
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
  const [showTajweed, setShowTajweed] = useState(false);
  const { data: tajweed } = useAyahTajweed(ayah.surah_number, ayah.ayah_number, showTajweed);

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
                <ThemedText type="small" themeColor="primary">
                  🎙 Check my recitation
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

      {showTajweed && tajweed ? (
        <TajweedText plainText={tajweed.plain_text} rules={tajweed.rules} />
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
              <ThemedText
                type="small"
                themeColor="primary"
                style={{ opacity: pressed || addToMemorization.isPending ? 0.6 : 1 }}>
                {addToMemorization.isSuccess ? 'Added to Hifz ✓' : 'Add to Hifz'}
              </ThemedText>
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

        <Pressable onPress={() => setShowTajweed((v) => !v)}>
          {({ pressed }) => (
            <ThemedText type="small" themeColor="primary" style={{ opacity: pressed ? 0.6 : 1 }}>
              {showTajweed ? 'Hide tajweed' : 'Tajweed'}
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
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    alignItems: 'center',
  },
});
