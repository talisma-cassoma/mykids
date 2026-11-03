import React from "react";
import type { SvgProps } from "react-native-svg";
import DinoPrincessSvgModule from "@/assets/svg/reading-a-book.svg";
import DinoProfileAvatarSvgModule from "@/assets/svg/dino-profile-avatar.svg";
import PrincessProfileAvatarSvgModule from "@/assets/svg/princess-profile-avatar.svg";
import coinSvgModule from "@/assets/svg/coin.svg";
import trophySvgModule from "@/assets/svg/trophy.svg";

// Trata caso o SVG venha encapsulado em .default
const DinoPrincessSvg = (DinoPrincessSvgModule as any).default || DinoPrincessSvgModule;
const DinoProfileAvatarSvg = (DinoProfileAvatarSvgModule as any).default || DinoProfileAvatarSvgModule;
const PrincessProfileAvatarSvg = (PrincessProfileAvatarSvgModule as any).default || PrincessProfileAvatarSvgModule;
const CoinSvg = (coinSvgModule as any).default || coinSvgModule;
const TrophySvg = (trophySvgModule as any).default || trophySvgModule;

export const Characters = {
    DinoPrincessSvg,
    DinoProfileAvatarSvg,
    PrincessProfileAvatarSvg,
    CoinSvg,
    TrophySvg,
};

interface SvgAssetProps {
    name: keyof typeof Characters;
    width?: SvgProps["width"];
    height?: SvgProps["height"];
    style?: SvgProps["style"];
}

export const SvgAsset: React.FC<SvgAssetProps> = ({
    name,
    width = "100%",
    height = "100%",
    style,
}) => {
    const Component = Characters[name];

    if (!Component) {
        console.warn(`SvgAsset: Componente "${name}" not found.`);
        return null;
    }

    return <Component width={width} height={height} style={style} />;
};