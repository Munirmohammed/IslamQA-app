import { Alert, Text, useColorScheme } from 'react-native';

import { ArabicText } from '@/components/arabic-text';
import { familyForRule, tajweedColor } from '@/constants/tajweed-colors';

import type { TajweedRule } from '@/features/tajweed/types';

interface TajweedTextProps {
  plainText: string;
  rules: TajweedRule[];
}

/**
 * Renders `plainText` (the tajweed endpoint's own Uthmani string -- NOT
 * Phase 1's text_uthmani; the two sources can differ in minor rendering
 * details, so character offsets must only ever be applied to the string
 * they were computed against, see tajweed_service.py's own warning) with
 * each rule's character span colored by its family, falling back to the
 * default text color elsewhere. Tapping a colored span surfaces the rule's
 * name/description -- a plain Alert rather than a custom popover
 * component, since that's all "tap a letter, see what rule it is" needs.
 */
export function TajweedText({ plainText, rules }: TajweedTextProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const sortedRules = [...rules].sort((a, b) => a.start - b.start);

  const segments: { text: string; rule: TajweedRule | null }[] = [];
  let cursor = 0;
  for (const rule of sortedRules) {
    if (rule.start > cursor) {
      segments.push({ text: plainText.slice(cursor, rule.start), rule: null });
    }
    segments.push({ text: plainText.slice(rule.start, rule.end), rule });
    cursor = rule.end;
  }
  if (cursor < plainText.length) {
    segments.push({ text: plainText.slice(cursor), rule: null });
  }

  return (
    <ArabicText>
      {segments.map((segment, index) => {
        if (!segment.rule) {
          return <Text key={index}>{segment.text}</Text>;
        }
        const family = familyForRule(segment.rule.rule);
        const color = tajweedColor(family, scheme);
        return (
          <Text
            key={index}
            style={{ color }}
            onPress={() =>
              Alert.alert(segment.rule!.name, segment.rule!.description ?? undefined)
            }>
            {segment.text}
          </Text>
        );
      })}
    </ArabicText>
  );
}
