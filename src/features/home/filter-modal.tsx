import { FlatList, StyleSheet, View } from 'react-native';

import { AppButton, AppDivider, AppModal, AppText } from '@/components/ui';
import {
  filterMenuPerCategory,
  setSelectedCategory,
  useAppDispatch,
} from '@/state';

// 1:1 port of components/modals/FilterModal.js (category picker dialog).

type FilterModalProps = {
  isOpen: boolean;
  hideModal: () => void;
  data: any[];
};

export function FilterModal({ isOpen, hideModal, data }: FilterModalProps) {
  const dispatch = useAppDispatch();

  const handleFilter = (id: number) => {
    dispatch(filterMenuPerCategory(id));
    dispatch(setSelectedCategory(id));
    hideModal();
  };

  return (
    <AppModal visible={isOpen} onBackdropPress={hideModal} contentStyle={styles.ContentWrapper}>
      <View style={styles.InnerWrapper}>
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
  ContentWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  InnerWrapper: {
    backgroundColor: '#fff',
    width: '50%',
    maxHeight: '80%',
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
