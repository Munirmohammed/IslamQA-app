import { Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { calculateZakat } from '@/lib/zakat';

interface FieldConfig {
  key: keyof typeof INITIAL_VALUES;
  label: string;
  helper?: string;
}

const ASSET_FIELDS: FieldConfig[] = [
  { key: 'cash', label: 'Cash & bank balances' },
  { key: 'goldAndSilver', label: 'Gold & silver (market value)' },
  { key: 'investments', label: 'Investments & stocks' },
  { key: 'businessAssets', label: 'Business inventory' },
  { key: 'moneyOwedToYou', label: 'Money owed to you' },
];

const LIABILITY_FIELDS: FieldConfig[] = [{ key: 'debtsDue', label: 'Debts due now' }];

const INITIAL_VALUES = {
  cash: '',
  goldAndSilver: '',
  investments: '',
  businessAssets: '',
  moneyOwedToYou: '',
  debtsDue: '',
  nisabThreshold: '',
};

function parseAmount(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function NumberField({
  label,
  value,
  onChangeText,
  helper,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  helper?: string;
}) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="0"
        placeholderTextColor={theme.textSecondary}
        keyboardType="decimal-pad"
        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
      />
      {helper && (
        <ThemedText type="small" themeColor="textSecondary">
          {helper}
        </ThemedText>
      )}
    </View>
  );
}

export default function ZakatScreen() {
  const [values, setValues] = useState(INITIAL_VALUES);

  const parsed = {
    cash: parseAmount(values.cash),
    goldAndSilver: parseAmount(values.goldAndSilver),
    investments: parseAmount(values.investments),
    businessAssets: parseAmount(values.businessAssets),
    moneyOwedToYou: parseAmount(values.moneyOwedToYou),
    debtsDue: parseAmount(values.debtsDue),
    nisabThreshold: parseAmount(values.nisabThreshold),
  };
  const result = calculateZakat(parsed);

  const setField = (key: keyof typeof INITIAL_VALUES) => (text: string) =>
    setValues((v) => ({ ...v, [key]: text }));

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Zakat Calculator' }} />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText themeColor="textSecondary">
            Zakat is 2.5% of your net wealth, owed once that wealth has met or exceeded the nisab
            threshold for a full lunar year. Nisab is traditionally defined as 87.48g of gold or
            612.36g of silver -- enter today&apos;s equivalent value in your own currency below (many
            scholars recommend the lower silver standard, since it benefits more recipients).
          </ThemedText>

          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Assets
          </ThemedText>
          {ASSET_FIELDS.map((field) => (
            <NumberField
              key={field.key}
              label={field.label}
              value={values[field.key]}
              onChangeText={setField(field.key)}
            />
          ))}

          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Liabilities
          </ThemedText>
          {LIABILITY_FIELDS.map((field) => (
            <NumberField
              key={field.key}
              label={field.label}
              value={values[field.key]}
              onChangeText={setField(field.key)}
            />
          ))}

          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Nisab
          </ThemedText>
          <NumberField
            label="Today's nisab threshold, in your currency"
            value={values.nisabThreshold}
            onChangeText={setField('nisabThreshold')}
            helper="Look up today's gold/silver price and multiply by 87.48g or 612.36g."
          />

          <ThemedView type="backgroundElement" style={styles.resultCard}>
            <View style={styles.resultRow}>
              <ThemedText themeColor="textSecondary">Total assets</ThemedText>
              <ThemedText>{result.totalAssets.toLocaleString()}</ThemedText>
            </View>
            <View style={styles.resultRow}>
              <ThemedText themeColor="textSecondary">Net zakatable wealth</ThemedText>
              <ThemedText>{result.netWealth.toLocaleString()}</ThemedText>
            </View>
            <View style={styles.divider} />
            {result.meetsNisab ? (
              <View style={styles.resultRow}>
                <ThemedText type="smallBold">Zakat due (2.5%)</ThemedText>
                <ThemedText type="title" themeColor="primary" style={styles.zakatAmount}>
                  {result.zakatDue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </ThemedText>
              </View>
            ) : (
              <ThemedText themeColor="textSecondary">
                {parsed.nisabThreshold > 0
                  ? "Your net wealth is below the nisab threshold -- zakat isn't obligatory this year."
                  : 'Enter a nisab threshold above to see whether zakat is due.'}
              </ThemedText>
            )}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  sectionTitle: {
    marginTop: Spacing.three,
  },
  field: {
    gap: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  resultCard: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(128,128,128,0.2)',
    marginVertical: Spacing.two,
  },
  zakatAmount: {
    fontSize: 24,
    lineHeight: 30,
  },
});
