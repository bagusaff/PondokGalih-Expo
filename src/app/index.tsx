import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui";
import { useAppSelector } from "@/state";
import { scale } from "@/theme";

// 1:1 port of screens/SplashScreen.js — the app entry route. Routes to
// /login when logged out, /prefetch when a session is persisted.

const logoSplash = require("../assets/images/logo_splash.png");

export default function SplashRoute() {
	const router = useRouter();
	const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);

	useEffect(() => {
		SplashScreen.hideAsync();
		// replace on both branches: the boot flow must leave no history, so
		// hardware back on Home exits the app (legacy behavior).
		if (!isLoggedIn) {
			router.replace("/login");
		} else {
			router.replace("/prefetch");
		}
		// Legacy effect ran once on mount.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<View style={styles.Container}>
			<Image source={logoSplash} style={{ width: scale(220), height: scale(90) }} resizeMode="contain" />
			<AppText category="h3" appearance="alternative" style={{ marginTop: 25 }}>
				Aplikasi Versi 2.0.0
			</AppText>
		</View>
	);
}

const styles = StyleSheet.create({
	Container: {
		backgroundColor: "#009900",
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
});
