import { useState } from "react";
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Pressable,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import Markdown from 'react-native-markdown-display';
import { GameHeader } from "@/components/Header";
import { Slider } from "@/components/Slider";

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

const markdownStyles = StyleSheet.create({
    body: {
        color: "#44495D",
        fontSize: 15,
        lineHeight: 23,
    },
    strong: {
        fontWeight: "700",
        color: "#20243A",
    },
    paragraph: {
        marginTop: 0,
        marginBottom: 8,
    },
});


function BookLessonScreenModal({
    section,
    onClose,
}: BookLessonScreenModalProps) {
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
                <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.modalHeader}>
                        <View style={styles.badgeContainer}>
                            <ThemedText style={styles.badgeText}>{section?.id}</ThemedText>
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
                            <View style={styles.segmentedImageWrapper}>
                                <Image
                                    source={segmentedImage}
                                    style={styles.segmentedImage}
                                    resizeMode="contain"
                                    accessibilityLabel={`Partie ${section.id} du schéma respiratoire`}
                                />
                            </View>

                            <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
                            <ThemedText style={styles.arabicText}>{section.arabicName}</ThemedText>
                            <View style={styles.separator} />
                            <Markdown style={markdownStyles}>Traduction</Markdown>
                            <Markdown style={markdownStyles}>{section.translation}</Markdown>
                            <Markdown style={markdownStyles}>Explication</Markdown>
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
                            style={styles.sectionButton}
                        >
                            <ThemedText style={styles.sectionNumber}>{section.id}</ThemedText>
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
        backgroundColor: "#FFFFFF",
        borderColor: "#E4E7F0",
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
        backgroundColor: "#E9EDFF",
        borderRadius: 16,
        color: "#4659C7",
        fontSize: 16,
        fontWeight: "700",
        height: 32,
        lineHeight: 32,
        overflow: "hidden",
        textAlign: "center",
        width: 32,
    },
    sectionButtonTitle: {
        color: "#353A50",
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
        backgroundColor: "#FFFFFF",
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
        borderBottomColor: "#F0F0F0",
        borderBottomWidth: 1,
        flexDirection: "row",
        paddingVertical: 12,
    },
    badgeContainer: {
        alignItems: "center",
        backgroundColor: "#E9EDFF",
        borderRadius: 18,
        height: 36,
        justifyContent: "center",
        width: 36,
    },
    badgeText: {
        color: "#4659C7",
        fontSize: 16,
        fontWeight: "700",
    },
    modalTitle: {
        color: "#20243A",
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
        color: "#555B70",
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
        backgroundColor: "#F7F8FC",
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
        color: "#20243A",
        fontSize: 22,
        fontWeight: "700",
    },
    arabicText: {
        backgroundColor: "#F7F8FC",
        borderRadius: 8,
        color: "#33384A",
        fontSize: 20,
        lineHeight: 32,
        padding: 12,
        textAlign: "right",
        writingDirection: "rtl",
    },
    separator: {
        backgroundColor: "#EAEAEA",
        height: 1,
        marginVertical: 4,
    },
    sectionHeading: {
        color: "#4659C7",
        fontSize: 16,
        fontWeight: "700",
    },
    bodyText: {
        color: "#44495D",
        fontSize: 15,
        lineHeight: 23,
    },
});