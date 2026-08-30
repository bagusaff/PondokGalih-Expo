import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { AppButton, AppIcon } from '@/components/ui';
import {
  filterMenuPerCategory,
  setSelectedCategory,
  useAppDispatch,
  useAppSelector,
} from '@/state';
import { colors, scale, verticalScale } from '@/theme';

import { FilterModal } from './filter-modal';

// 1:1 port of components/cards/FilterCard.js (category chips row).

export function FilterCard() {
  const dispatch = useAppDispatch();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const categoryItems = useAppSelector((state) => state.category.categoryItems);
  const selectedCategory = useAppSelector(
    (state) => state.category.selectedCategory,
  );
  const selectedSalesType = useAppSelector(
    (state) => state.salestype.selectedSalesType,
  );
  const token = useAppSelector((state) => state.user.token);

  const handleFilter = (id?: number | string) => {
    dispatch(setSelectedCategory(id ?? null));
    dispatch(filterMenuPerCategory(id ?? null, selectedSalesType, token));
  };

  return (
    <View style={styles.FilterWrapper}>
      <View style={{ flex: 7 }}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <FlatList
            data={categoryItems}
            renderItem={({ item }) => (
              <AppButton
                appearance={selectedCategory == item.id ? 'filled' : 'outline'}
                status={selectedCategory == item.id ? 'primary' : 'basic'}
                style={styles.FilterButton}
                size="small"
                onPress={() => handleFilter(item.id)}>
                {item.name}
              </AppButton>
            )}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{
              alignItems: 'center',
              justifyContent: 'center',
            }}
            horizontal
            ListHeaderComponent={
              <View style={{ flexDirection: 'row' }}>
                <AppButton
                  appearance={selectedCategory == undefined ? 'filled' : 'outline'}
                  status={selectedCategory == undefined ? 'primary' : 'basic'}
                  style={styles.FilterButton}
                  size="small"
                  onPress={() => handleFilter()}>
                  Semua
                </AppButton>
                <AppButton
                  appearance={
                    selectedCategory == 'favourite' ? 'filled' : 'outline'
                  }
                  status={selectedCategory == 'favourite' ? 'primary' : 'basic'}
                  style={styles.FilterButton}
                  size="small"
                  onPress={() => handleFilter('favourite')}>
                  Favorit
                </AppButton>
              </View>
            }
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </View>
      <View style={styles.FilterHamburgerWrapper}>
        <AppButton
          onPress={() => setIsModalVisible(true)}
          size="giant"
          status="basic"
          appearance="ghost"
          accessoryLeft={<AppIcon name="menu" size={24} fill={colors.textHint} />}
        />
      </View>
      {isModalVisible && (
        <FilterModal
          isOpen={isModalVisible}
          hideModal={() => setIsModalVisible(false)}
          data={categoryItems}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  FilterWrapper: {
    flexDirection: 'row',
    marginBottom: verticalScale(2),
    alignItems: 'center',
  },
  FilterButton: {
    borderRadius: 25,
    margin: scale(1),
  },
  FilterHamburgerWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
