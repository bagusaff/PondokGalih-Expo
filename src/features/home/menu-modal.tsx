import { useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  AppButton,
  AppDivider,
  AppInput,
  AppModal,
  AppText,
} from '@/components/ui';
import { currencyFormatter } from '@/lib/currency-formatter';
import { addOrderItem, useAppDispatch, useAppSelector } from '@/state';
import { scale, verticalScale } from '@/theme';

// 1:1 port of components/modals/MenuModal/MenuModal.js (variant picker).
// V-113 behavior: keeps original_name + note on the order item.

type MenuModalProps = {
  isOpen: boolean;
  hideModal: () => void;
  data: any;
};

export function MenuModal({ isOpen, hideModal, data }: MenuModalProps) {
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();

  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const selectedSalesType = useAppSelector(
    (state) => state.salestype.selectedSalesType,
  );

  const handleSetVariant = (id: number, index: number) => {
    setSelectedVariant(id);
    setSelectedItem(index);
  };

  const handleSetQuantity = (value: number) => {
    if (value < 1) {
      quantity > 1 && setQuantity((prevValue) => prevValue + value);
    } else {
      setQuantity((prevValue) => prevValue + value);
    }
  };

  const handleHideModal = () => {
    setSelectedVariant(null);
    setSelectedItem(null);
    setQuantity(1);
    hideModal();
    setNotes('');
  };

  const filteredVariant = data.variant.filter(
    (item: any) => item.sale_type_id == selectedSalesType,
  );

  const handleAddItem = () => {
    const item = {
      id: data?.id,
      name: filteredVariant[selectedItem!]?.name,
      price: filteredVariant[selectedItem!]?.price,
      quantity: quantity,
      totalPrice: filteredVariant[selectedItem!]?.price * quantity,
      variant_id: selectedVariant,
      original_name: data?.name,
      note: notes,
    };
    dispatch(addOrderItem(item));
    handleHideModal();
  };

  return (
    <AppModal visible={isOpen} onBackdropPress={hideModal}>
      <KeyboardAvoidingView behavior="height">
        <View style={[styles.Wrapper, { width: (3 / 4) * width }]}>
          <View style={styles.HeaderContainer}>
            <AppButton
              onPress={handleHideModal}
              appearance="outline"
              status="danger"
              size="large">
              Cancel
            </AppButton>
            <AppText category="h5" style={{ fontSize: scale(10) }}>
              {currencyFormatter(
                filteredVariant[selectedItem!]?.price * quantity || 0,
              )}
            </AppText>
            <AppButton
              appearance="outline"
              status="info"
              size="large"
              onPress={handleAddItem}
              disabled={selectedVariant == null}>
              Simpan
            </AppButton>
          </View>
          <AppDivider />
          <ScrollView>
            <View style={{ flexDirection: 'column' }}>
              <View
                style={{
                  flexDirection: 'column',
                  marginVertical: verticalScale(10),
                }}>
                <View
                  style={{ flexDirection: 'row', marginBottom: verticalScale(5) }}>
                  <AppText category="h6" style={{ fontSize: scale(6) }}>
                    VARIANT{' '}
                  </AppText>
                  <AppText appearance="hint" style={{ fontSize: scale(6) }}>
                    {' | '} CHOOSE ONE
                  </AppText>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                  }}>
                  {filteredVariant.map((item: any, index: number) => (
                    <AppButton
                      key={item.id}
                      status="basic"
                      style={{ width: '32%', marginBottom: verticalScale(5) }}
                      appearance={item.id == selectedVariant ? 'filled' : 'outline'}
                      onPress={() => handleSetVariant(item.id, index)}>
                      {item.name}
                    </AppButton>
                  ))}
                </View>
              </View>
              <AppDivider />
              <View
                style={{
                  flexDirection: 'column',
                  marginVertical: verticalScale(5),
                }}>
                <View
                  style={{ flexDirection: 'row', marginBottom: verticalScale(5) }}>
                  <AppText category="h6" style={{ fontSize: scale(6) }}>
                    QUANTITY
                  </AppText>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <AppInput
                    style={{ flex: 1, padding: scale(2) }}
                    keyboardType="numeric"
                    size="large"
                    value={String(quantity)}
                    onChangeText={(value) => setQuantity(parseInt(value))}
                    disabled={selectedVariant == null}
                  />
                  <View style={{ flex: 1, padding: scale(2), flexDirection: 'row' }}>
                    <AppButton
                      style={{ flex: 1 }}
                      status="basic"
                      appearance="outline"
                      onPress={() => handleSetQuantity(-1)}
                      disabled={selectedVariant == null}>
                      -
                    </AppButton>
                    <AppButton
                      style={{ flex: 1 }}
                      status="basic"
                      appearance="outline"
                      onPress={() => handleSetQuantity(1)}
                      disabled={selectedVariant == null}>
                      +
                    </AppButton>
                  </View>
                </View>
              </View>
              <AppDivider />
              <View
                style={{
                  flexDirection: 'column',
                  marginVertical: verticalScale(5),
                }}>
                <View
                  style={{ flexDirection: 'row', marginBottom: verticalScale(5) }}>
                  <AppText category="h6" style={{ fontSize: scale(6) }}>
                    CATATAN
                  </AppText>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <AppInput
                    style={{ flex: 1, padding: scale(2) }}
                    size="large"
                    value={notes}
                    onChangeText={setNotes}
                  />
                </View>
              </View>
              <AppDivider />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  Wrapper: {
    backgroundColor: '#fff',
    padding: scale(10),
    borderRadius: 15,
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
    maxHeight: '95%',
  },
  HeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(5),
  },
});
