import { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { AppButton, AppIcon, AppText } from '@/components/ui';
import { currencyFormatter } from '@/lib/currency-formatter';
import { changeQty, deleteOrderItem, useAppDispatch } from '@/state';
import { colors, scale, verticalScale } from '@/theme';

// 1:1 port of components/cards/OrderMenuCard.js (V-113: shows variant note).
// Memoized per perf charter — a qty change re-renders only affected rows.

type OrderMenuCardProps = {
  data: any;
};

function OrderMenuCardInner({ data }: OrderMenuCardProps) {
  const dispatch = useAppDispatch();

  const handleChangeQty = (
    price: number,
    id: number,
    qty: number,
    variant: number | null | undefined,
  ) => {
    if (qty < 1 && data.quantity == 1) {
      dispatch(deleteOrderItem(id, variant));
    } else {
      dispatch(changeQty(price, id, qty, variant));
    }
  };

  return (
    <TouchableOpacity>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: verticalScale(5),
        }}>
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            flex: 1,
          }}>
          <View style={{ flexDirection: 'row' }}>
            {data?.original_name && data?.original_name !== data?.name ? (
              <AppText
                category="h6"
                numberOfLines={1}
                style={{
                  fontWeight: 'bold',
                  maxWidth: scale(100),
                  fontSize: scale(8),
                }}>
                {`${data?.original_name} `}
              </AppText>
            ) : null}
            <AppText
              category="h6"
              numberOfLines={1}
              style={{
                fontWeight: 'bold',
                maxWidth: scale(100),
                fontSize: scale(8),
              }}>
              {data.name}
            </AppText>
          </View>

          <AppText category="p1" appearance="hint" style={{ fontSize: scale(6) }}>
            {currencyFormatter(data.totalPrice)}
          </AppText>
          {data?.note ? (
            <AppText
              category="p1"
              appearance="hint"
              style={{ fontSize: scale(6), flexWrap: 'wrap' }}>
              Catatan : {data?.note}
            </AppText>
          ) : null}
        </View>
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 5,
            alignItems: 'center',
          }}>
          <AppButton
            style={{ borderRadius: 10, width: scale(20) }}
            accessoryLeft={<AppIcon name="minus" size={20} fill={colors.textHint} />}
            status="basic"
            onPress={() => handleChangeQty(data.price, data.id, -1, data?.variant_id)}
          />
          <AppText category="h6" style={{ marginHorizontal: 15, fontSize: scale(8) }}>
            {data.quantity}
          </AppText>
          <AppButton
            style={{ borderRadius: 10, width: scale(20) }}
            accessoryLeft={<AppIcon name="plus-outline" size={20} fill={colors.textHint} />}
            status="basic"
            onPress={() => handleChangeQty(data.price, data.id, 1, data?.variant_id)}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const OrderMenuCard = memo(OrderMenuCardInner);
