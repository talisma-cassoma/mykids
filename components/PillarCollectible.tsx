import React, { type ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
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
    if (children !== undefined) {
        return (
            <View style={[styles.collectibleAnchor, style]}>
                {children}
            </View>
        );
    }

    if (!collectibles) return null;

    return (
        <View style={[styles.collectibleAnchor, style]}>
            <SvgAsset name={collectibles} width={32} height={32} />
        </View>
    );
}

const styles = StyleSheet.create({
    collectibleAnchor: {
        position: "absolute",
        zIndex: 2,
        alignItems: "center",
        justifyContent: "center",
    },
});