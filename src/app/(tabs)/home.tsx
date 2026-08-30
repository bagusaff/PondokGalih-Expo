import { FlashList } from '@shopify/flash-list';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppIcon, AppInput, AppLayout, AppSpinner, AppText } from '@/components/ui';
import { EmptyMenu } from '@/features/home/empty-menu';
import { FilterCard } from '@/features/home/filter-card';
import { HomeLayout } from '@/features/home/home-layout';
import { MenuCard } from '@/features/home/menu-card';
import { SalesTypeSelect } from '@/features/home/sales-type-select';
import { usePrinterReconnect } from '@/features/printing/use-printer-reconnect';
import { filterMenuPerSalesType, useAppDispatch, useAppSelector } from '@/state';
import { colors, scale, verticalScale } from '@/theme';

// 1:1 port of screens/home/Home.screen.js. Printer auto-reconnect moved to
// usePrinterReconnect (same effect, plus Android 12+ permissions).
// Perf charter: FlashList grid; narrow selectors (no order/setting
// subscriptions here, so cart changes never re-render the grid).

export default function HomeRoute() {
  const dispatch = useAppDispatch();

  const loading = useAppSelector((state) => state.menu.loading);
  const filteredMenu = useAppSelector((state) => state.menu.filteredMenu);
  const filteredMenuCategory = useAppSelector(
    (state) => state.menu.filteredMenuCategory,
  );
  const selectedCategory = useAppSelector(
    (state) => state.category.selectedCategory,
  );
  const selectedSalesType = useAppSelector(
    (state) => state.salestype.selectedSalesType,
  );

  const [keyword, setKeyword] = useState('');

  const searchedMenu = filteredMenu?.filter((item: any) =>
    item.name.toLowerCase().includes(keyword.toLocaleLowerCase()),
  );

  const isFavourite = selectedCategory == 'favourite';

  useEffect(() => {
    dispatch(filterMenuPerSalesType(selectedSalesType));
    // Legacy deps: only selectedSalesType.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSalesType]);

  usePrinterReconnect();

  return (
    <HomeLayout>
      <AppLayout style={styles.Wrapper} level="3">
        <View style={styles.SearchBox}>
          <AppInput
            value={keyword}
            placeholder="Cari menu disini"
            accessoryLeft={
              <AppIcon name="search-outline" size={24} fill={colors.textHint} />
            }
            onChangeText={setKeyword}
            style={styles.InputSearch}
          />
          <SalesTypeSelect />
        </View>
        <FilterCard />
        <View style={styles.MenuWrapper}>
          <AppText category="h4" style={{ fontSize: scale(8) }}>
            Daftar Menu
          </AppText>
          {!loading ? (
            <FlashList<any>
              data={
                keyword != ''
                  ? searchedMenu
                  : selectedCategory
                    ? filteredMenuCategory
                    : filteredMenu
              }
              ListEmptyComponent={EmptyMenu}
              renderItem={({ item }) => (
                <MenuCard data={item} isFavourite={isFavourite} />
              )}
              keyExtractor={(item) => String(item.id)}
              numColumns={3}
            />
          ) : (
            <View style={styles.Spinner}>
              <AppSpinner size="giant" status="info" />
            </View>
          )}
        </View>
      </AppLayout>
    </HomeLayout>
  );
}

const styles = StyleSheet.create({
  Wrapper: {
    flex: 1,
    height: '100%',
    padding: scale(6),
  },
  MenuWrapper: {
    flex: 7.5,
  },
  SearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(5),
  },
  InputSearch: {
    flex: 5,
    backgroundColor: '#fff',
    marginRight: scale(5),
  },
  Spinner: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});
