import React, { type ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle, useWindowDimensions } from "react-native";
import { SvgAsset } from "@/components/SvgAssets";

export type CollectibleName = "CoinSvg" | "TrophySvg" | "TestSvg";

export interface PillarCollectibleProps {
    collectibles?: CollectibleName;
    children?: ReactNode;
    style?: StyleProp<ViewStyle>;
}

export function PillarCollectible({
    collectibles,
    children,
    style,
}: PillarCollectibleProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    return (
        <View style={[styles.collectibleAnchor, style]}>
            {children !== undefined ? (
                children
            ) : collectibles ? (
                <SvgAsset name={collectibles} width={isTablet ? 54 : 52} height={isTablet ? 54 : 52} />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    collectibleAnchor: {
        alignItems: "center",
        justifyContent: "center",
    },
});