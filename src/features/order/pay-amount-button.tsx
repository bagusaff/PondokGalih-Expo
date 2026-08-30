import { View } from 'react-native';

import { AppButton, AppText } from '@/components/ui';
import { currencyFormatter } from '@/lib/currency-formatter';
import { scale } from '@/theme';

// 1:1 port of components/modals/OrderModal/PayAmountButton.js — quick cash
// denominations (round up to 1k / 10k / 50k / 100k).

type PayAmountButtonProps = {
  value: number;
  onPress: (value: number) => void;
};

export function PayAmountButton({ value, onPress }: PayAmountButtonProps) {
  const roundUp = (number: number, near: number) => {
    if (number % near === 0) return number;
    return Math.trunc(number / near) * near + near;
  };

  const renderAmount = (near: number) => (
    <AppButton
      style={{ flex: 1, margin: scale(1) }}
      size="small"
      appearance="outline"
      status="basic"
      onPress={() => onPress(roundUp(value, near))}>
      <AppText category="h6" appearance="hint" style={{ fontSize: scale(5.5) }}>
        {currencyFormatter(roundUp(value, near))}
      </AppText>
    </AppButton>
  );

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      {renderAmount(1000)}
      {value % 10000 != 0 && renderAmount(10000)}
      {value <= 40000 && renderAmount(50000)}
      {value >= 20000 && renderAmount(100000)}
    </View>
  );
}
