import { ReactNode, useEffect, useRef } from "react";
import { Modal, View, Text, Animated, Pressable, Dimensions } from "react-native";
import { PanGestureHandler, PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import { theme } from "../../constants/theme";

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

export function Sheet({ visible, onClose, children }: SheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const closeAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (visible) {
      translateY.setValue(SCREEN_HEIGHT);
      dragY.setValue(0);
      const anim = Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      });
      anim.start();
      return () => anim.stop();
    }
  }, [visible, translateY, dragY]);

  useEffect(() => {
    return () => {
      closeAnimRef.current?.stop();
    };
  }, []);

  const close = () => {
    closeAnimRef.current = Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    });
    closeAnimRef.current.start(() => onClose());
  };

  const onGesture = (e: PanGestureHandlerGestureEvent) => {
    const ty = Math.max(0, e.nativeEvent.translationY);
    dragY.setValue(ty);
  };

  const onGestureEnd = (e: PanGestureHandlerGestureEvent) => {
    const ty = e.nativeEvent.translationY;
    const vy = e.nativeEvent.velocityY;
    if (ty > 120 || vy > 800) {
      close();
    } else {
      Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start();
    }
  };

  const combinedY = Animated.add(translateY, dragY);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}>
        <Pressable style={{ flex: 1 }} onPress={close} />
        <Animated.View
          style={{
            transform: [{ translateY: combinedY }],
            backgroundColor: theme.color.bg,
            borderTopLeftRadius: theme.radius.xl,
            borderTopRightRadius: theme.radius.xl,
            ...theme.shadow.md,
          }}
        >
          <PanGestureHandler onGestureEvent={onGesture} onEnded={onGestureEnd as any}>
            <Animated.View>
              <View style={{ alignItems: "center", paddingVertical: theme.space[3] }}>
                <View
                  style={{
                    width: 40,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: theme.color.cream[300],
                  }}
                />
              </View>
            </Animated.View>
          </PanGestureHandler>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

interface SheetHeaderProps {
  title: string;
  subtitle?: string;
}

Sheet.Header = function SheetHeader({ title, subtitle }: SheetHeaderProps) {
  return (
    <View style={{ paddingHorizontal: theme.space[6], paddingBottom: theme.space[4] }}>
      <Text
        style={{
          fontSize: theme.font.title.size,
          fontWeight: "700",
          color: theme.color.ink[900],
        }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={{
            fontSize: theme.font.caption.size,
            color: theme.color.ink[400],
            marginTop: 4,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
};

Sheet.Content = function SheetContent({ children }: { children: ReactNode }) {
  return (
    <View style={{ paddingHorizontal: theme.space[6], paddingBottom: theme.space[4] }}>
      {children}
    </View>
  );
};

Sheet.Footer = function SheetFooter({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        paddingHorizontal: theme.space[6],
        paddingTop: theme.space[4],
        paddingBottom: theme.space[8] + theme.space[1],
      }}
    >
      {children}
    </View>
  );
};
