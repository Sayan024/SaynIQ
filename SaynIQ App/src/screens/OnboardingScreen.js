import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Dimensions, 
  TouchableOpacity, Animated 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';



const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'AI-Powered Notes',
    description: 'Transform your thoughts into structured knowledge with advanced AI summarization.',
    icon: 'document-text',
    color: '#A855F7'
  },
  {
    id: '2',
    title: 'Smart Study Assistant',
    description: 'Organize your learning with AI-driven study plans and topic explanations.',
    icon: 'school',
    color: '#8B5CF6'
  },
  {
    id: '3',
    title: 'SaynIQ AI Chat',
    description: 'Chat with your "Second Brain" to find answers and explore your data instantly.',
    icon: 'sparkles',
    color: '#7C3AED'
  },
  {
    id: '4',
    title: 'Secure Vault',
    description: 'Keep your passwords and sensitive data encrypted and accessible in your private vault.',
    icon: 'key',
    color: '#6D28D9'
  },
  {
    id: '5',
    title: 'Task Manager',
    description: 'Track your productivity with a modern task tracking and time logging system.',
    icon: 'list',
    color: '#5B21B6'
  },
  {
    id: '6',
    title: 'Trending Tech',
    description: 'Stay ahead with a curated live feed of the latest technology and AI insights.',
    icon: 'flash',
    color: '#4C1D95'
  }
];

export default function OnboardingScreen({ onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);
  const insets = useSafeAreaInsets();


  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ 
        index: currentIndex + 1,
        animated: true 
      });
    } else {
      AsyncStorage.setItem('@onboarding_completed', 'true').catch(() => {});
      onFinish();
    }
  };

  const handleSkip = () => {
    AsyncStorage.setItem('@onboarding_completed', 'true').catch(() => {});
    onFinish();
  };



  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <View style={[styles.iconBox, { backgroundColor: `${item.color}20`, borderColor: item.color }]}>
        <Ionicons name={item.icon} size={80} color={item.color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A0533', '#2D0A4E', '#1A0533']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={{ flex: 1 }} pointerEvents="box-none">
        <View style={{ flex: 1 }} pointerEvents="box-none">
          <FlatList
            data={SLIDES}
            renderItem={renderSlide}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            bounces={false}
            keyExtractor={(item) => item.id}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
              useNativeDriver: false,
            })}
            scrollEventThrottle={16}
            onViewableItemsChanged={viewableItemsChanged}
            viewabilityConfig={viewConfig}
            ref={slidesRef}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />
        </View>

        <View style={styles.footer} pointerEvents="box-none">
          <View style={styles.pagination}>
            {SLIDES.map((_, i) => {
              const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [10, 24, 10],
                extrapolate: 'clamp',
              });
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View 
                  key={i.toString()} 
                  style={[styles.dot, { width: dotWidth, opacity }]} 
                />
              );
            })}
          </View>

          <TouchableOpacity 
            style={styles.nextBtn} 
            onPress={handleNext}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#A855F7', '#7C3AED']}
              style={styles.gradientBtn}
            >
              <Text style={styles.nextText}>
                {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Skip button on top of everything */}
      <TouchableOpacity 
        style={[styles.skipBtn, { top: insets.top + 10 }]} 
        onPress={handleSkip}
        hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
        activeOpacity={0.5}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: { width, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  iconBox: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  textContainer: { alignItems: 'center' },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  skipBtn: {
    position: 'absolute',
    right: 25,
    padding: 10,
    zIndex: 999,
  },
  skipText: { color: 'rgba(255,255,255,0.5)', fontWeight: '800', fontSize: 16 },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    width: '100%',
    zIndex: 100,
  },

  pagination: {
    flexDirection: 'row',
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#A855F7',
    marginHorizontal: 4,
  },
  nextBtn: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#A855F7',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  gradientBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  nextText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
});

