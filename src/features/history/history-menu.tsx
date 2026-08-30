import moment from 'moment';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppDivider, AppLayout, AppText } from '@/components/ui';
import { currencyFormatter } from '@/lib/currency-formatter';
import { refundOrder, useAppDispatch, useAppSelector } from '@/state';
import { scale, verticalScale } from '@/theme';

// 1:1 port of components/sidebar/HistoryMenu.js (transaction list,
// long-press to refund).

type HistoryMenuProps = {
  data: any[];
  onPressHistory: (item: any) => void;
  loadMore: () => void;
  loading?: boolean;
};

export function HistoryMenu({ data, onPressHistory, loadMore }: HistoryMenuProps) {
  const token = useAppSelector((state) => state.user.token);
  const dispatch = useAppDispatch();

  const handleRefund = (id: number | string) => {
    Alert.alert(
      'Refund transaksi ini?',
      `Apakah anda yakin ingin merefund untuk transaksi ini ?`,
      [
        { text: 'Tidak', style: 'cancel' },
        {
          text: 'Ya',
          onPress: () => {
            dispatch(refundOrder(id, token));
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <AppLayout style={styles.layout}>
      <View style={styles.header}>
        <AppText category="h5" style={{ fontSize: scale(10) }}>
          Order History
        </AppText>
      </View>
      <View style={{ flex: 1 }}>
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <View key={item.id}>
              <TouchableOpacity
                style={{ padding: scale(5), width: '100%' }}
                onPress={() => onPressHistory(item)}
                onLongPress={() => handleRefund(item?.id)}>
                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <AppText category="s2" style={{ fontSize: scale(7) }}>
                    Invoice : {item?.invoice}
                  </AppText>
                  <AppText
                    category="s2"
                    appearance="hint"
                    style={{ fontSize: scale(7) }}>
                    {moment(item?.created_at).format('DD MMM YYYY, HH:mm:ss')}
                  </AppText>
                </View>
                <AppText>{currencyFormatter(item?.net_amount)}</AppText>
              </TouchableOpacity>
              <AppDivider />
            </View>
          )}
          keyExtractor={(item) => String(item.id)}
          initialNumToRender={15}
          maxToRenderPerBatch={15}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          removeClippedSubviews
        />
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  layout: { padding: scale(5), flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
});
