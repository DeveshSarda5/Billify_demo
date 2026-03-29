import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type IntroSplashProps = {
  onAnimationComplete: () => void;
};

export default function IntroSplash({ onAnimationComplete }: IntroSplashProps) {
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.92)).current;
  const contentTranslateY = useRef(new Animated.Value(16)).current;
  const glowOpacity = useRef(new Animated.Value(0.18)).current;
  const glowScale = useRef(new Animated.Value(0.84)).current;
  const accentOpacity = useRef(new Animated.Value(0)).current;
  const accentScaleX = useRef(new Animated.Value(0.72)).current;
  const startedRef = useRef(false);
  const onCompleteRef = useRef(onAnimationComplete);

  useEffect(() => {
    onCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 340,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentScale, {
          toValue: 1,
          duration: 340,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 340,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 460,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 1,
          duration: 460,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(accentOpacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(accentScaleX, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(700),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        onCompleteRef.current();
      }
    });

    return () => {
      animation.stop();
    };
  }, [accentOpacity, accentScaleX, contentOpacity, contentScale, contentTranslateY, glowOpacity, glowScale, overlayOpacity]);

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <LinearGradient colors={['#020617', '#0f172a', '#111c32']} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.glowOrb, styles.glowOrbLeft]} />
      <View style={[styles.glowOrb, styles.glowOrbRight]} />
      <Animated.View style={[styles.centerGlow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />

      <Animated.View
        style={[
          styles.logoLockup,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }, { scale: contentScale }],
          },
        ]}
      >
        <Text style={styles.kicker}>SMART CHECKOUT</Text>
        <Text style={styles.wordmark}>Billify</Text>
        <Text style={styles.tagline}>Scan. Pay. Go.</Text>
        <Animated.View style={[styles.accent, { opacity: accentOpacity, transform: [{ scaleX: accentScaleX }] }]} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLockup: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  glowOrb: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  glowOrbLeft: {
    top: 80,
    left: -48,
  },
  glowOrbRight: {
    right: -36,
    bottom: 110,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  centerGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
  },
  kicker: {
    color: 'rgba(191, 219, 254, 0.8)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3.6,
    marginBottom: 14,
  },
  wordmark: {
    color: '#f8fafc',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(56, 189, 248, 0.22)',
    textShadowOffset: { width: 0, height: 10 },
    textShadowRadius: 28,
  },
  tagline: {
    marginTop: 10,
    color: 'rgba(226, 232, 240, 0.72)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.6,
  },
  accent: {
    width: 116,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#38bdf8',
    marginTop: 24,
  },
});
