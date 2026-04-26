import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { theme } from "../../constants/theme";

interface SkeletonCardProps {
  lines?: number;
  hasAvatar?: boolean;
}

export function SkeletonCard({ lines = 3, hasAvatar = false }: SkeletonCardProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  const bar = (width: string | number, height: number) => (
    <Animated.View
      style={{
        backgroundColor: theme.color.cream[100],
        height,
        width: width as any,
        borderRadius: theme.radius.sm / 2,
        opacity,
      }}
    />
  );

  return (
    <View
      style={{
        backgroundColor: theme.color.ink[0],
        borderRadius: theme.radius.lg,
        padding: theme.space[4],
        ...theme.shadow.sm,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space[3] }}>
        {hasAvatar && (
          <Animated.View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.color.cream[100],
              opacity,
            }}
          />
        )}
        <View style={{ flex: 1, gap: theme.space[2] }}>
          {bar("60%", 14)}
          {Array.from({ length: lines - 1 }).map((_, i) => (
            <View key={i}>{bar(i === lines - 2 ? "70%" : "90%", 10)}</View>
          ))}
        </View>
      </View>
    </View>
  );
}
