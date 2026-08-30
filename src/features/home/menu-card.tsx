import { memo, useState } from 'react';
import {
  Alert,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { AppText } from '@/components/ui';
import { currencyFormatter } from '@/lib/currency-formatter';
import {
  addOrderItem,
  addToFavourite,
  deleteFromFavourite,
  useAppDispatch,
  useAppSelector,
} from '@/state';
import { scale } from '@/theme';

import { MenuModal } from './menu-modal';

// 1:1 port of components/cards/MenuCard.js.
// Perf charter: the per-card MenuModal is now mounted lazily (legacy mounted
// one closed modal per card — hundreds of off-screen modals).

const imagePlaceholder = require('../../assets/images/food_placeholder.png');

type MenuCardProps = {
  data: any;
  isFavourite?: boolean;
};

function MenuCardInner({ data, isFavourite = false }: MenuCardProps) {
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const dataHasVariants = data.variant.length > 0;
  const token = useAppSelector((state) => state.user.token);

  const addMenuToOrder = (qty: number) => {
    const item = {
      id: data.id,
      name: data.name,
      price: data.price,
      quantity: qty,
      totalPrice: data.price * qty,
      variant_id: null,
    };
    dispatch(addOrderItem(item));
  };

  const addItemToFavourites = () => {
    dispatch(addToFavourite(data?.id, token));
  };

  const deleteItemFromFavourites = () => {
    dispatch(deleteFromFavourite(data?.id, token));
  };

  const handleAddToFavourites = () => {
    Alert.alert(
      'Tambahkan ke favorit',
      `Apakah anda yakin ingin menambahkan menu ${data?.name} ke favorit ?`,
      [
        { text: 'Tidak', style: 'cancel' },
        { text: 'Ya', onPress: addItemToFavourites },
      ],
      { cancelable: true },
    );
  };

  const handleDeleteFromFavourites = () => {
    Alert.alert(
      'Tambahkan ke favorit',
      `Apakah anda yakin ingin menghapus ${data?.name} dari favorit ?`,
      [
        { text: 'Tidak', style: 'cancel' },
        { text: 'Ya', onPress: deleteItemFromFavourites },
      ],
      { cancelable: true },
    );
  };

  return (
    <View
      style={{
        flex: 1,
        maxWidth: width / 4.5 - 10,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
      }}>
      <TouchableOpacity
        activeOpacity={0.5}
        style={{
          backgroundColor: 'white',
          borderWidth: 0.5,
          borderColor: '#c6c6c6',
          padding: 15,
          borderRadius: 5,
          flexDirection: 'row',
        }}
        onPress={
          dataHasVariants ? () => setIsModalVisible(true) : () => addMenuToOrder(1)
        }
        onLongPress={
          isFavourite ? handleDeleteFromFavourites : handleAddToFavourites
        }>
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View>
            <AppText
              category="h6"
              numberOfLines={2}
              ellipsizeMode="tail"
              style={{ fontSize: scale(7) }}>
              {data.name}
            </AppText>
          </View>
          <AppText category="h6" style={{ fontSize: scale(7) }}>
            {dataHasVariants ? 'Harga variasi' : currencyFormatter(data.price)}
          </AppText>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Image
            source={imagePlaceholder}
            style={{ width: scale(40), height: scale(40), resizeMode: 'contain' }}
          />
        </View>
      </TouchableOpacity>

      {isModalVisible && (
        <MenuModal
          isOpen={isModalVisible}
          hideModal={() => setIsModalVisible(false)}
          data={data}
        />
      )}
    </View>
  );
}

export const MenuCard = memo(MenuCardInner);
