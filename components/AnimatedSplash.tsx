import { useEffect, useRef } from "react";
import { View, Text, Dimensions, Animated } from "react-native";
import { Image } from "expo-image";

const { width, height } = Dimensions.get("window");

interface AnimatedSplashProps {
  onFinish: () => void;
}

function Star({ delay, x, y, size, color }: { delay: number; x: number; y: number; size: number; color: string }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, delay, useNativeDriver: false }),
        Animated.timing(opacity, { toValue: 0.2, duration: 600, useNativeDriver: false }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const symbol = x > width / 2 ? "★" : "♥";

  return (
    <Animated.View style={{ position: "absolute", left: x, top: y, opacity }}>
      <Text style={{ fontSize: size, color }}>{symbol}</Text>
    </Animated.View>
  );
}

const STARS = [
  { x: width * 0.12, y: height * 0.22, size: 14, color: "#FFB5C2", delay: 0 },
  { x: width * 0.82, y: height * 0.18, size: 10, color: "#D4BBFF", delay: 200 },
  { x: width * 0.25, y: height * 0.35, size: 12, color: "#B5EAD7", delay: 400 },
  { x: width * 0.75, y: height * 0.32, size: 16, color: "#FFD93D", delay: 150 },
  { x: width * 0.15, y: height * 0.55, size: 10, color: "#FF8FA3", delay: 300 },
  { x: width * 0.85, y: height * 0.50, size: 12, color: "#FFB5C2", delay: 500 },
  { x: width * 0.40, y: height * 0.20, size: 8, color: "#BBDEFB", delay: 100 },
  { x: width * 0.60, y: height * 0.58, size: 14, color: "#D4BBFF", delay: 350 },
];

export default function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const babyOpacity = useRef(new Animated.Value(0)).current;
  const babyTranslateY = useRef(new Animated.Value(30)).current;
  const babyScale = useRef(new Animated.Value(0.8)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(15)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const floatY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1단계: 아기+달 등장
    Animated.parallel([
      Animated.timing(babyOpacity, { toValue: 1, duration: 600, useNativeDriver: false }),
      Animated.timing(babyTranslateY, { toValue: 0, duration: 800, useNativeDriver: false }),
      Animated.timing(babyScale, { toValue: 1, duration: 800, useNativeDriver: false }),
    ]).start(() => {
      // 2단계: 둥실둥실
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatY, { toValue: -8, duration: 1000, useNativeDriver: false }),
          Animated.timing(floatY, { toValue: 8, duration: 1000, useNativeDriver: false }),
        ])
      ).start();
    });

    // 3단계: 텍스트 페이드인
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: false }),
        Animated.timing(textTranslateY, { toValue: 0, duration: 500, useNativeDriver: false }),
      ]).start();
    }, 600);

    // 4단계: 페이드아웃 후 종료 (4.5초 후)
    setTimeout(() => {
      Animated.timing(containerOpacity, { toValue: 0, duration: 400, useNativeDriver: false }).start(() => {
        onFinish();
      });
    }, 4500);
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#FFF0F3",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
        opacity: containerOpacity,
      }}
    >
      {STARS.map((star, i) => (
        <Star key={i} {...star} />
      ))}

      <Animated.View
        style={{
          alignItems: "center",
          opacity: babyOpacity,
          transform: [
            { translateY: babyTranslateY },
            { scale: babyScale },
          ],
        }}
      >
        <Animated.View style={{ transform: [{ translateY: floatY }] }}>
          <Image
            source={require("../assets/splash-icon.png")}
            style={{ width: width * 0.55, height: width * 0.55 }}
            contentFit="contain"
          />
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={{
          marginTop: 20,
          alignItems: "center",
          opacity: textOpacity,
          transform: [{ translateY: textTranslateY }],
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "700", color: "#FF6B81", letterSpacing: 2 }}>
          베이비로그
        </Text>
        <Text style={{ fontSize: 13, color: "#9B9B9B", marginTop: 6 }}>
          우리 아기의 첫 번째 이야기
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
