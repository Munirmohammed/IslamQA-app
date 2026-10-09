import { Alert, Text } from 'react-native';

import { ArabicText } from '@/components/arabic-text';

import type { WordByWord } from '@/features/quran/types';

interface WordByWordTextProps {
  words: WordByWord[];
}

/** Renders each word of an ayah as its own tappable span -- tapping one
 * shows its translation/transliteration via a plain Alert, the same "tap
 * to reveal" convention TajweedText already uses for tajweed rules,
 * rather than a bespoke popover component. */
export function WordByWordText({ words }: WordByWordTextProps) {
  return (
    <ArabicText>
      {words.map((word, index) => (
        <Text
          key={word.position}
          onPress={() =>
            Alert.alert(
              word.text_uthmani,
              word.transliteration ? `${word.translation}\n(${word.transliteration})` : word.translation
            )
          }>
          {word.text_uthmani}
          {index < words.length - 1 ? ' ' : ''}
        </Text>
      ))}
    </ArabicText>
  );
}
