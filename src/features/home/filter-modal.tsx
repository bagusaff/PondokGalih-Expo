import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppButton, AppDivider, AppModal, AppText } from '@/components/ui';
import {
  filterMenuPerCategory,
  setSelectedCategory,
  useAppDispatch,
} from '@/state';

// 1:1 port of components/modals/FilterModal.js (category picker dialog).
// Owner feedback (2026-08-31): wider + taller than the legacy 50% card,
// centered, backdrop tap closes. Card is absolutely sized so the backdrop
// around it stays tappable.

type FilterModalProps = {
  isOpen: boolean;
  hideModal: () => void;
  data: any[];
};

export function FilterModal({ isOpen, hideModal, data }: FilterModalProps) {
  const dispatch = useAppDispatch();
  const { width, height } = useWindowDimensions();

  const handleFilter = (id: number) => {
    dispatch(filterMenuPerCategory(id));
    dispatch(setSelectedCategory(id));
    hideModal();
  };

  return (
    <AppModal visible={isOpen} onBackdropPress={hideModal}>
      <View
        style={[
          styles.InnerWrapper,
          { width: 0.6 * width, height: 0.85 * height },
        ]}>
        <FlatList
          ListHeaderComponent={
            <View style={{ backgroundColor: '#FFF' }}>
              <View style={styles.HeaderWrapper}>
                <AppText category="h4">Kategori Menu</AppText>
              </View>
              <AppDivider />
            </View>
          }
          stickyHeaderIndices={[0]}
          data={data}
          renderItem={({ item }) => (
            <View>
              <AppButton
                appearance="ghost"
                status="basic"
                size="large"
                onPress={() => handleFilter(item.id)}>
                {item.name}
              </AppButton>
              <AppDivider />
            </View>
          )}
        />
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  InnerWrapper: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 15,
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
  },
  HeaderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
});
