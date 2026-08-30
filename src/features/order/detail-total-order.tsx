import { View } from 'react-native';

import { AppDivider, AppText } from '@/components/ui';
import { currencyFormatter } from '@/lib/currency-formatter';
import { scale, verticalScale } from '@/theme';

// 1:1 port of components/cards/DetailTotalOrder.js. The legacy
// useState+useEffect tax computation is a pure derivation — computed inline
// (identical output, one render fewer).

type DetailTotalOrderProps = {
  totalPrice: number;
  tax: number;
};

export function DetailTotalOrder({ totalPrice, tax }: DetailTotalOrderProps) {
  const taxAmount = (tax / 100) * totalPrice;

  return (
    <View style={{ paddingTop: verticalScale(10), padding: scale(5) }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 5,
        }}>
        <View style={{ flexDirection: 'row' }}>
          <AppText category="h6" style={{ fontSize: scale(8) }}>
            Subtotal
          </AppText>
        </View>
        <AppText category="h6" style={{ fontSize: scale(8) }}>
          {currencyFormatter(totalPrice)}
        </AppText>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 5,
        }}>
        <View style={{ flexDirection: 'row' }}>
          <AppText
            category="h6"
            appearance="hint"
            style={{ marginRight: 5, fontSize: scale(8) }}>
            Tax
          </AppText>
          <AppText category="h6" appearance="hint" style={{ fontSize: scale(8) }}>
            ( {tax}% )
          </AppText>
        </View>
        <AppText category="h6" appearance="hint" style={{ fontSize: scale(8) }}>
          {currencyFormatter(taxAmount)}
        </AppText>
      </View>
      <AppDivider style={{ marginVertical: verticalScale(5) }} />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 5,
        }}>
        <AppText category="h5" style={{ fontSize: scale(10) }}>
          Total
        </AppText>
        <AppText category="h5" style={{ fontSize: scale(10) }}>
          {currencyFormatter(totalPrice + taxAmount)}
        </AppText>
      </View>
    </View>
  );
}
