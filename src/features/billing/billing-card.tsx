import moment from 'moment';
import 'moment/locale/id';
import { Alert, View } from 'react-native';

import { AppButton, AppIcon, AppText } from '@/components/ui';
import {
  changeSalesType,
  deleteBill,
  filterMenuPerCategory,
  filterMenuPerSalesType,
  loadOrderItems,
  selectBill,
  useAppDispatch,
  useAppSelector,
} from '@/state';
import { scale, statusColors } from '@/theme';

moment.locale('id');

// 1:1 port of components/cards/BillingCard.js.
// COMPAT: legacy bills persisted `sales_index` as a UI Kitten IndexPath
// object ({row: n}); new bills store a plain number — read both shapes.

type BillingCardProps = {
  data: any;
  onPressPrint: (data: any) => void;
};

export function BillingCard({ data, onPressPrint }: BillingCardProps) {
  const dispatch = useAppDispatch();
  const selectedCategory = useAppSelector(
    (state) => state.category.selectedCategory,
  );
  const token = useAppSelector((state) => state.user.token);

  const onPressCheckout = () => {
    const orderDetails = JSON.parse(data?.data || '');
    const salesIndex =
      orderDetails.sales_index?.row ?? orderDetails.sales_index ?? 0;
    dispatch(selectBill({ ...data, methodType: 'updateBill' }));
    dispatch(changeSalesType(orderDetails.sales_type, salesIndex));
    dispatch(filterMenuPerSalesType(orderDetails.sales_type));
    dispatch(filterMenuPerCategory(selectedCategory));
    dispatch(loadOrderItems(orderDetails.items));
  };

  const handleDelete = () => {
    dispatch(deleteBill(data.id, token));
  };

  const onPressDelete = () => {
    Alert.alert(
      'Menghapus Tagihan',
      'Apakah anda yakin ingin menghapus tagihan ini ?',
      [
        { text: 'Tidak', style: 'cancel' },
        { text: 'Ya', onPress: handleDelete },
      ],
      { cancelable: true },
    );
  };

  return (
    <View
      style={{
        width: '100%',
        padding: scale(5),
        borderRadius: 5,
        flexDirection: 'row',
        backgroundColor: '#FFF',
        marginBottom: scale(2),
      }}>
      <AppText
        style={{
          flex: 1,
          textAlign: 'center',
          alignSelf: 'center',
          fontSize: scale(10),
        }}
        category="h6">
        #{data?.no}
      </AppText>
      <AppText style={{ flex: 3, alignSelf: 'center', textAlign: 'left' }} category="p1">
        {data?.name}
      </AppText>
      <AppText style={{ flex: 3, alignSelf: 'center', textAlign: 'left' }} category="p1">
        {moment(data?.updated_at).local().startOf('seconds').fromNow()}
      </AppText>
      <View
        style={{
          flex: 2,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}>
        <AppButton
          status="basic"
          accessoryRight={<AppIcon name="printer" size={20} fill="#8F9BB3" />}
          appearance="outline"
          onPress={() => onPressPrint(data)}
        />
        <AppButton
          status="info"
          accessoryRight={
            <AppIcon name="shopping-cart" size={20} fill={statusColors.info} />
          }
          appearance="outline"
          onPress={onPressCheckout}
        />
        <AppButton
          status="danger"
          accessoryRight={
            <AppIcon name="trash-2" size={20} fill={statusColors.danger} />
          }
          appearance="outline"
          onPress={onPressDelete}
        />
      </View>
    </View>
  );
}
