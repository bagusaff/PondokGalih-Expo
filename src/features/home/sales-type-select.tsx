import { StyleSheet } from 'react-native';

import { AppSelect } from '@/components/ui/app-select';
import {
  changeSalesType,
  filterMenuPerCategory,
  filterMenuPerSalesType,
  useAppDispatch,
  useAppSelector,
} from '@/state';

// 1:1 port of components/selector/SalesType.js (IndexPath -> plain number).
// Narrow selectors per perf charter: subscribes to order length, not items.

export function SalesTypeSelect() {
  const dispatch = useAppDispatch();

  const salesItems = useAppSelector((state) => state.salestype.salesItems);
  const selectedSalesIndex = useAppSelector(
    (state) => state.salestype.selectedSalesIndex,
  );
  const hasOrderItems = useAppSelector(
    (state) => state.order.orderItems.length > 0,
  );
  const token = useAppSelector((state) => state.user.token);
  const selectedCategory = useAppSelector(
    (state) => state.category.selectedCategory,
  );

  const displayValue = salesItems[selectedSalesIndex]?.name;

  const handleChangeType = (type: number, index: number) => {
    dispatch(changeSalesType(type, index));
    dispatch(filterMenuPerSalesType(type));
    dispatch(filterMenuPerCategory(selectedCategory, type, token));
  };

  return (
    <AppSelect
      style={styles.select}
      placeholder="Default"
      value={displayValue}
      disabled={hasOrderItems}
      options={salesItems}
      onSelect={(option, index) => {
        handleChangeType(Number(option.id), index);
      }}
    />
  );
}

const styles = StyleSheet.create({
  select: {
    flex: 2,
  },
});
