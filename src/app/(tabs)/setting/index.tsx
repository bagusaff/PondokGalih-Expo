import { useRouter } from "expo-router";
import { Alert, FlatList, Pressable, StyleSheet, View } from "react-native";

import { NoConnection } from "@/components/no-connection";
import { AppButton, AppDivider, AppIcon, AppLayout, AppSpinner, AppText, type IconName } from "@/components/ui";
import { logoutHandle, syncAllData, useAppDispatch, useAppSelector } from "@/state";
import { colors, moderateScale } from "@/theme";

// 1:1 port of screens/setting/Setting.screen.js (UI Kitten List/ListItem
// rebuilt with Eva ListItem metrics: 12/16 padding, s1 title, c1 hint
// description, 24px icons).

type SettingRow = {
	title: string;
	description: string;
	iconName: IconName;
	onPress: () => void;
	showSpinnerWhenLoading?: boolean;
};

export default function SettingRoute() {
	const router = useRouter();
	const dispatch = useAppDispatch();

	const { token, loading } = useAppSelector((state) => state.user);

	const syncData = () => {
		dispatch(syncAllData(token));
	};

	const data: SettingRow[] = [
		{
			title: "Sync Data",
			description: "Sinkronisasi data dengan data terbaru dari server.",
			iconName: "sync-outline",
			onPress: () => syncData(),
			showSpinnerWhenLoading: true,
		},
		{
			title: "Printer Device",
			description: "Pilih printer yang akan digunakan.",
			iconName: "printer-outline",
			onPress: () => router.navigate("/setting/printer"),
		},
		{
			title: "Konfigurasi Printer",
			description: "Pengaturan lanjutan printer.",
			iconName: "settings-2-outline",
			onPress: () => router.navigate("/setting/configuration"),
		},
	];

	const logoutButtonHandle = () => {
		dispatch(logoutHandle());
	};

	const showAlertLogout = () => {
		Alert.alert(
			"Log out",
			"Apakah anda yakin ingin log out ?",
			[
				{ text: "Tidak", style: "cancel" },
				{ text: "Ya", onPress: logoutButtonHandle },
			],
			{ cancelable: true },
		);
	};

	return (
		<>
			<NoConnection />
			<AppLayout level="3" style={styles.Wrapper}>
				<View style={styles.container}>
					<FlatList
						data={data}
						style={{ backgroundColor: "#fff" }}
						keyExtractor={(item) => item.title}
						ItemSeparatorComponent={AppDivider}
						renderItem={({ item }) => (
							<Pressable
								disabled={loading}
								onPress={item.onPress}
								style={({ pressed }) => [styles.listItem, pressed && { backgroundColor: colors.backgroundLevel2 }]}
							>
								{loading && item.showSpinnerWhenLoading ? (
									<View style={styles.Spinner}>
										<AppSpinner size="small" status="primary" />
									</View>
								) : (
									<AppIcon name={item.iconName} size={24} fill={colors.textHint} />
								)}
								<View style={{ flex: 1, marginHorizontal: 12 }}>
									<AppText category="s1">{item.title}</AppText>
									<AppText category="c1" appearance="hint">
										{item.description}
									</AppText>
								</View>
								<AppIcon name="arrow-ios-forward-outline" size={24} fill={colors.textHint} />
							</Pressable>
						)}
					/>
					<AppText category="h5" style={{ textAlign: "center" }}>
						Aplikasi Versi 2.0.0
					</AppText>
				</View>
				<View>
					<AppButton onPress={showAlertLogout} disabled={loading}>
						Logout
					</AppButton>
				</View>
			</AppLayout>
		</>
	);
}

const styles = StyleSheet.create({
	Wrapper: {
		flex: 1,
		height: "100%",
		padding: moderateScale(5),
	},
	Spinner: {
		justifyContent: "center",
		alignItems: "center",
	},
	container: {
		flex: 1,
		backgroundColor: "#FFF",
		marginBottom: 15,
	},
	listItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		backgroundColor: "#fff",
	},
});
