import { Platform } from "react-native";

export const theme = {
  color: {
    pink: {
      50: "#FFF5F8",
      100: "#FFE5EC",
      200: "#FFC2D1",
      400: "#FF8FA3",
      500: "#FF4D6D",
      600: "#D63A57",
    },
    cream: {
      50: "#FAF5EE",
      100: "#F5EDE0",
      200: "#E8D5C4",
      300: "#C8B8A8",
      400: "#A8907E",
    },
    ink: {
      0: "#FFFFFF",
      50: "#F5F1EB",
      400: "#8B7E73",
      700: "#5C5048",
      900: "#3D3530",
    },
    semantic: {
      hospital: "#64B5F6",
      checkup: "#81C784",
      symptom: "#FFB74D",
      medicine: "#BA68C8",
      danger: "#E57373",
    },
    tint: {
      hospital: "#E3F2FD",
      checkup: "#E8F5E9",
      symptom: "#FFF3E0",
      medicine: "#F3E5F5",
      danger: "#FFEBEE",
    },
    bg: "#FAF5EE",
  },
  font: {
    display: { size: 32, weight: "800" as const, lineHeight: 38 },
    title: { size: 22, weight: "700" as const, lineHeight: 28 },
    heading: { size: 17, weight: "700" as const, lineHeight: 22 },
    body: { size: 14, weight: "400" as const, lineHeight: 20 },
    bodyLg: { size: 15, weight: "400" as const, lineHeight: 22 },
    label: { size: 13, weight: "600" as const, lineHeight: 18 },
    caption: { size: 11, weight: "400" as const, lineHeight: 15 },
    overline: { size: 10, weight: "700" as const, lineHeight: 14, letterSpacing: 0.5 },
    hero: { size: 18, weight: "800" as const, lineHeight: 24 },
  },
  space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32 },
  iconBox: { sm: 32, md: 40, lg: 56, xl: 80, xxl: 96 },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 },
  shadow: {
    none: Platform.select({
      ios: { shadowColor: "transparent", shadowOpacity: 0 },
      android: { elevation: 0 },
      default: {},
    })!,
    sm: Platform.select({
      ios: {
        shadowColor: "#3D3530",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
      },
      android: { elevation: 2 },
      default: {},
    })!,
    md: Platform.select({
      ios: {
        shadowColor: "#3D3530",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
      },
      android: { elevation: 6 },
      default: {},
    })!,
  },
  opacity: {
    pressed: 0.85,
    pressedSubtle: 0.9,
    pressedStrong: 0.5,
    disabledMuted: 0.4,
  },
  scrim: "rgba(0, 0, 0, 0.4)",
} as const;

export type Theme = typeof theme;
export type SemanticColor = keyof typeof theme.color.semantic;
