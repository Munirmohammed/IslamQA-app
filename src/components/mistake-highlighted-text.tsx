import { Text } from 'react-native';

import { ArabicText } from '@/components/arabic-text';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

import type { Mistake } from '@/features/recitation/types';

interface MistakeHighlightedTextProps {
  textUthmani: string;
  mistakes: Mistake[];
}

/**
 * Renders an ayah with its recitation mistakes overlaid: a word the user
 * said incorrectly is highlighted red, a word they skipped is struck
 * through. Rendered as nested `Text` spans inside one `ArabicText` parent
 * (not separate sibling components in a row `View`) -- Arabic text must
 * wrap as one paragraph across lines, which only works with RN's native
 * nested-Text inheritance, not a flex row of independent Text nodes.
 *
 * `position` indexes into the canonical ayah's own word list, so it maps
 * directly onto `textUthmani.split(' ')` -- "extra" mistakes have no such
 * slot (the reciter said a word that isn't part of the ayah at all) and
 * are listed separately below instead.
 */
export function MistakeHighlightedText({ textUthmani, mistakes }: MistakeHighlightedTextProps) {
  const theme = useTheme();
  const words = textUthmani.split(' ');

  const mistakeByPosition = new Map<number, Mistake>();
  const extraMistakes: Mistake[] = [];
  for (const mistake of mistakes) {
    if (mistake.type === 'extra') {
      extraMistakes.push(mistake);
    } else {
      mistakeByPosition.set(mistake.position, mistake);
    }
  }

  return (
    <>
      <ArabicText>
        {words.map((word, index) => {
          const mistake = mistakeByPosition.get(index);
          const isLast = index === words.length - 1;

          if (!mistake) {
            return <Text key={index}>{word + (isLast ? '' : ' ')}</Text>;
          }

          return (
            <Text
              key={index}
              style={
                mistake.type === 'missed'
                  ? { color: theme.textSecondary, textDecorationLine: 'line-through' }
                  : { color: '#C0392B' }
              }>
              {word + (isLast ? '' : ' ')}
            </Text>
          );
        })}
      </ArabicText>

      {extraMistakes.length > 0 && (
        <ThemedText type="small" themeColor="textSecondary">
          Extra words recited: {extraMistakes.map((m) => m.recited).join(', ')}
        </ThemedText>
      )}
    </>
  );
}
