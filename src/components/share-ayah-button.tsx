import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { useTheme } from '@/hooks/use-theme';

import { ShareableAyahCard, type ShareableAyahCardProps } from './shareable-ayah-card';
import { ThemedText } from './themed-text';

/**
 * Renders the ayah card off-screen (not display:none -- that would skip
 * layout entirely and captureRef needs real laid-out geometry) and, on tap,
 * captures it to a PNG and opens the native share sheet. One-tap by
 * design: no preview/edit step, matching the "lowest-effort growth
 * feature" framing this was scoped under.
 */
export function ShareAyahButton(props: ShareableAyahCardProps) {
  const theme = useTheme();
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        width: 1080,
        height: 1920,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share this ayah' });
      }
    } catch (error) {
      console.warn('Failed to share ayah card:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <View style={styles.offscreen}>
        <ShareableAyahCard ref={cardRef} {...props} />
      </View>

      <Pressable onPress={handleShare} disabled={isSharing} style={styles.button}>
        {isSharing ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          <ThemedText type="small" themeColor="primary">
            Share this ayah ↗
          </ThemedText>
        )}
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  offscreen: {
    position: 'absolute',
    left: -10000,
    top: 0,
    pointerEvents: 'none',
  },
  button: {
    alignSelf: 'flex-start',
  },
});
