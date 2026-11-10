import { useState } from "react";
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    Pressable,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import Markdown from 'react-native-markdown-display';
import { GameHeader } from "@/components/Header";
import { Slider } from "@/components/Slider";
import { Colors } from "@/constants/Colors";
import { useGameControls } from "@/context/GameControlsContext";

const imageBaseUrl =
    "https://rqbegbvangiegbnrgxrv.supabase.co/storage/v1/object/public/myKIDS";

const beforeImage = { uri: `${imageBaseUrl}/original.jpg` };
const afterImage = { uri: `${imageBaseUrl}/translated.jpg` };
const segmentedImage = { uri: `${imageBaseUrl}/part1.png` };

interface BookLessonSection {
    id: number;
    title: string;
    arabicName: string;
    translation: string;
    explanation: string;
}

const lessonSections: BookLessonSection[] = [
  {
    id: 1,
    title: "Le nez",
    arabicName: "الأنف",
    translation: "**L’air** entre principalement et naturellement par le nez.",
    explanation:
      "Le nez **filtre, réchauffe et humidifie** l’air avant qu’il ne continue son chemin dans les voies respiratoires.\n\n* **Rôle clé:** Protection contre les poussières et bactéries.",
  },
  {
    id: 2,
    title: "La bouche",
    arabicName: "الفم",
    translation: "L’air peut aussi entrer par la bouche, surtout **en cas d'effort intense**.",
    explanation:
      "La bouche est une autre voie d’entrée de l’air, même si le nez le prépare **mieux** avant son passage.\n\n* *Attention:* L'air n'est ni filtré ni réchauffé de la même manière.",
  },
  {
    id: 3,
    title: "Le larynx",
    arabicName: "الحنجرة",
    translation: "L’air passe ensuite par le **larynx**.",
    explanation:
      "Le larynx relie le pharynx à la trachée et contient les **cordes vocales**.\n\n* Permet également la production des sons et de la voix.",
  },
  {
    id: 4,
    title: "La trachée",
    arabicName: "القصبة الهوائية",
    translation: "La trachée conduit l’air directement vers les **bronches**.",
    explanation:
      "Ce grand conduit transporte l’air du larynx jusqu’aux bronches, qui se divisent ensuite à l’intérieur des poumons.\n\n* **Structure:** Composée d'anneaux cartilagineux souples.",
  },
  {
    id: 5,
    title: "Les bronches",
    arabicName: "الشعب الهوائية",
    translation: "Les bronches distribuent l’air dans **chaque poumon**.",
    explanation:
      "La trachée se sépare en deux bronches principales (droite et gauche).\n\n* Elles se ramifient ensuite en minuscules **bronchioles**.",
  },
  {
    id: 6,
    title: "Les poumons",
    arabicName: "الرئتان",
    translation: "Les poumons permettent les **échanges gazeux** vitaux.",
    explanation:
      "Dans les poumons, l’oxygène passe dans le sang et le dioxyde de carbone est éliminé lors de l’expiration.\n\n* **Organe principal** de la respiration.",
  },
];

interface BookLessonScreenModalProps {
    section: BookLessonSection | null;
    onClose: () => void;
}

function BookLessonScreenModal({
    section,
    onClose,
}: BookLessonScreenModalProps) {
    const { mode } = useGameControls();
    const themeColors = Colors[mode];
    const markdownStyles = {
        body: {
            color: themeColors.text,
            fontSize: 15,
            lineHeight: 23,
        },
        strong: {
            fontWeight: "700" as const,
            color: themeColors.text,
        },
        paragraph: {
            marginTop: 0,
            marginBottom: 8,
        },
    };

    return (
        <Modal
            visible={section !== null}
            animationType="fade" // Radix dialogs typically fade/zoom in place rather than slide from bottom
            transparent
            onRequestClose={onClose}
        >
            {/* Pressing the overlay backdrop closes the dialog, matching Radix UI behavior */}
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                {/* Stop propagation so clicking inside the dialog content doesn't close it */}
                <Pressable
                    style={[
                        styles.modalContainer,
                        { backgroundColor: themeColors.card },
                    ]}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View
                        style={[
                            styles.modalHeader,
                            {
                                borderBottomColor:
                                    mode === "dark" ? "#555" : "#E4E7F0",
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.badgeContainer,
                                { backgroundColor: themeColors.selectedBg },
                            ]}
                        >
                            <ThemedText
                                style={[
                                    styles.badgeText,
                                    { color: themeColors.selectedBorder },
                                ]}
                            >
                                {section?.id}
                            </ThemedText>
                        </View>
                        <ThemedText style={styles.modalTitle}>Explication de la leçon</ThemedText>
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Fermer l’explication"
                            onPress={onClose}
                            style={styles.closeButton}
                        >
                            <ThemedText style={styles.closeButtonText}>×</ThemedText>
                        </TouchableOpacity>
                    </View>

                    {section && (
                        <ScrollView
                            contentContainerStyle={styles.modalContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View
                                style={[
                                    styles.segmentedImageWrapper,
                                    { backgroundColor: themeColors.card },
                                ]}
                            >
                                <Image
                                    source={segmentedImage}
                                    style={styles.segmentedImage}
                                    resizeMode="contain"
                                    accessibilityLabel={`Partie ${section.id} du schéma respiratoire`}
                                />
                            </View>

                            <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
                            <ThemedText
                                style={[
                                    styles.arabicText,
                                    {
                                        color: themeColors.text,
                                        backgroundColor: themeColors.card,
                                    },
                                ]}
                            >
                                {section.arabicName}
                            </ThemedText>
                            <View
                                style={[
                                    styles.separator,
                                    {
                                        backgroundColor:
                                            mode === "dark" ? "#555" : "#E4E7F0",
                                    },
                                ]}
                            />
                            <ThemedText
                                style={[
                                    styles.sectionHeading,
                                    { color: themeColors.selectedBorder },
                                ]}
                            >
                                Traduction
                            </ThemedText>
                            <Markdown style={markdownStyles}>{section.translation}</Markdown>
                            <ThemedText
                                style={[
                                    styles.sectionHeading,
                                    { color: themeColors.selectedBorder },
                                ]}
                            >
                                Explication
                            </ThemedText>
                            <Markdown style={markdownStyles}>{section.explanation}</Markdown>
                        </ScrollView>
                    )}
                </Pressable>
            </Pressable>
        </Modal>
    );
}

export default function BookLessonScreen() {
    const [selectedSection, setSelectedSection] =
        useState<BookLessonSection | null>(null);
    const { mode } = useGameControls();
    const themeColors = Colors[mode];

    return (
        <ThemedSafeAreaView style={styles.screen}>
            <GameHeader
                gameDescription="Les leçons du livre"
                trophiesCount={12}
                coinsCount={45}
                settingsRoute="/games/yachane/settings/SettingsScreen"
                currentProfile={{
                    name: "Dino",
                    avatarSvgName: "DinoProfileAvatarSvg",
                    startScreenRoute: "/games/yachane/StartScreen",
                }}
                otherProfile={{
                    name: "Ayla",
                    avatarSvgName: "PrincessProfileAvatarSvg",
                    startScreenRoute: "/games/ayla/StartScreen",
                }}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <ThemedText style={styles.pageTitle}>L’appareil respiratoire</ThemedText>

                <View style={styles.sliderWrapper}>
                    <Slider beforeImage={beforeImage} afterImage={afterImage} />
                </View>

                <ThemedText style={styles.sectionsHeading}>Explore les différentes parties</ThemedText>
                <ThemedText style={styles.sectionsHint}>
                    Choisis un numéro pour afficher son explication.
                </ThemedText>
                <View style={styles.sectionsGrid}>
                    {lessonSections.map((section) => (
                        <TouchableOpacity
                            key={section.id}
                            accessibilityRole="button"
                            accessibilityLabel={`Afficher l’explication : ${section.title}`}
                            onPress={() => setSelectedSection(section)}
                            style={[
                                styles.sectionButton,
                                {
                                    backgroundColor: themeColors.card,
                                    borderColor:
                                        mode === "dark" ? "#555" : "#E4E7F0",
                                },
                            ]}
                        >
                            <ThemedText
                                style={[
                                    styles.sectionNumber,
                                    {
                                        color: themeColors.selectedBorder,
                                        backgroundColor: themeColors.selectedBg,
                                    },
                                ]}
                            >
                                {section.id}
                            </ThemedText>
                            <ThemedText style={styles.sectionButtonTitle}>{section.title}</ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <BookLessonScreenModal
                section={selectedSection}
                onClose={() => setSelectedSection(null)}
            />
        </ThemedSafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    content: {
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 32,
        gap: 12,
    },
    pageTitle: {
        fontSize: 26,
        fontWeight: "700",
        textAlign: "center",
    },
    sliderWrapper: {
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
        width: "100%",
    },
    sectionsHeading: {
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
    },
    sectionsHint: {
        fontSize: 14,
        marginBottom: 4,
        textAlign: "center",
    },
    sectionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        justifyContent: "center",
        maxWidth: 620,
        width: "100%",
    },
    sectionButton: {
        alignItems: "center",
        borderRadius: 14,
        borderWidth: 1,
        gap: 6,
        minHeight: 92,
        justifyContent: "center",
        padding: 10,
        width: "30%",
    },
    sectionNumber: {
        alignItems: "center",
        borderRadius: 16,
        fontSize: 16,
        fontWeight: "700",
        height: 32,
        lineHeight: 32,
        overflow: "hidden",
        textAlign: "center",
        width: 32,
    },
    sectionButtonTitle: {
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center",
    },
    // Radix UI Dialog styles adjustments:
    modalOverlay: {
        backgroundColor: "rgba(0, 0, 0, 0.6)", // Darker, cleaner backdrop similar to Radix Dialog Overlay
        flex: 1,
        justifyContent: "center", // Center vertically instead of flex-end (sheet style)
        alignItems: "center",     // Center horizontally
        padding: 20,
    },
    modalContainer: {
        borderRadius: 20,          // Even rounded corners all around like a popup dialog
        width: "100%",
        maxWidth: 500,             // Restrict width on larger screens/tablets like a dialog box
        maxHeight: "85%",          // Keep it bounded vertically
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        shadowColor: "#000",       // Add subtle shadow for depth
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8,
    },
    modalHeader: {
        alignItems: "center",
        borderBottomWidth: 1,
        flexDirection: "row",
        paddingVertical: 12,
    },
    badgeContainer: {
        alignItems: "center",
        borderRadius: 18,
        height: 36,
        justifyContent: "center",
        width: 36,
    },
    badgeText: {
        fontSize: 16,
        fontWeight: "700",
    },
    modalTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "700",
        marginLeft: 12,
    },
    closeButton: {
        alignItems: "center",
        height: 36,
        justifyContent: "center",
        width: 36,
    },
    closeButtonText: {
        fontSize: 30,
        lineHeight: 32,
    },
    modalContent: {
        gap: 12,
        paddingBottom: 20,
        paddingTop: 16,
    },
    segmentedImageWrapper: {
        alignItems: "center",
        borderRadius: 14,
        height: 180,
        justifyContent: "center",
        marginBottom: 4,
        overflow: "hidden",
    },
    segmentedImage: {
        height: "100%",
        width: "100%",
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "700",
    },
    arabicText: {
        borderRadius: 8,
        fontSize: 20,
        lineHeight: 32,
        padding: 12,
        textAlign: "right",
        writingDirection: "rtl",
    },
    separator: {
        height: 1,
        marginVertical: 4,
    },
    sectionHeading: {
        fontSize: 16,
        fontWeight: "700",
    },
});