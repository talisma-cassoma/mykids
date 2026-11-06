import React from "react";
import type { SvgProps } from "react-native-svg";
import DinoPrincessSvgModule from "@/assets/svg/reading-a-book.svg";
import DinoProfileAvatarSvgModule from "@/assets/svg/dino-profile-avatar.svg";
import PrincessProfileAvatarSvgModule from "@/assets/svg/princess-profile-avatar.svg";
import coinSvgModule from "@/assets/svg/coin.svg";
import trophySvgModule from "@/assets/svg/trophy.svg";
import pillarCubeSmModule from "@/assets/svg/pillar/pillar-cube-sm.svg"
import pillarCubeLgModule from "@/assets/svg/pillar/pillar-cube-lg.svg"
import pillarCylinderSmModule from "@/assets/svg/pillar/pillar-cylinder-sm.svg"
import pillarCylinderLgModule from "@/assets/svg/pillar/pillar-cylinder-lg.svg"
import testSvgModule from "@/assets/svg/pillar/collectibles/test.svg"

// Trata caso o SVG venha encapsulado em .default
const DinoPrincessSvg = (DinoPrincessSvgModule as any).default || DinoPrincessSvgModule;
const DinoProfileAvatarSvg = (DinoProfileAvatarSvgModule as any).default || DinoProfileAvatarSvgModule;
const PrincessProfileAvatarSvg = (PrincessProfileAvatarSvgModule as any).default || PrincessProfileAvatarSvgModule;
const CoinSvg = (coinSvgModule as any).default || coinSvgModule;
const TrophySvg = (trophySvgModule as any).default || trophySvgModule;
const TestSvg= (testSvgModule as any).default || testSvgModule;

const PillarCubeLgSvg = (pillarCubeLgModule as any).default || pillarCubeLgModule
const PillarCubeSmSvg = (pillarCubeSmModule as any).default || pillarCubeSmModule
const PillarCylinderLgSvg = (pillarCylinderLgModule as any).default || pillarCylinderLgModule
const PillarCylinderSmSvg = (pillarCylinderSmModule as any).default || pillarCylinderSmModule


export const Characters = {
    DinoPrincessSvg,
    DinoProfileAvatarSvg,
    PrincessProfileAvatarSvg,
    CoinSvg,
    TrophySvg,
    PillarCubeLgSvg,
    PillarCubeSmSvg,
    PillarCylinderLgSvg,
    PillarCylinderSmSvg,
    TestSvg
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