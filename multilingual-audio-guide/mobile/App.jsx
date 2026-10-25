import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Image,
  ImageBackground,
  Linking,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { errorMessage } from "./services/apiClient";
import {
  words,
  mapPoints,
  userGps,
  fetchPlacesFromAPI,
  API_BASE_URL,
} from "./services/mobileData";

import { createVisitorId } from '../shared/utils/visitorId.js';
import { startPresence } from '../shared/utils/presence.js';
const mobileSessionId = createVisitorId();

const C = {
  ink: "#17212b",
  muted: "#65717d",
  pink: "#d63384",
  soft: "#e9f4f2",
  line: "#e5e9ec",
  cream: "#f7f8f6",
};

const photo = (url) => {
  if (!url) return { uri: "" };
  return { uri: url };
};

const limit = (value) => Math.min(2.8, Math.max(0.7, value));

// Khoảng cách đường chim bay (km) giữa hai toạ độ.
const haversineKm = (a, b) => {
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};
const formatTime = (millis) => {
  if (!millis || isNaN(millis)) return "00:00";
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const touchPoint = (event) => {
  const touches = event.nativeEvent.touches;
  if (!touches.length) return null;
  if (touches.length === 1)
    return { x: touches[0].pageX, y: touches[0].pageY, count: 1 };
  const [a, b] = touches;
  return {
    x: (a.pageX + b.pageX) / 2,
    y: (a.pageY + b.pageY) / 2,
    distance: Math.hypot(b.pageX - a.pageX, b.pageY - a.pageY),
    angle: Math.atan2(b.pageY - a.pageY, b.pageX - a.pageX),
    count: 2,
  };
};

function Choice({ children, selected, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.choice, selected && styles.choiceSelected, style]}
    >
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>
        {children}
      </Text>
    </Pressable>
  );
}

function MapArea({
  placesList,
  lang,
  selected,
  onSelect,
  navigating,
  view,
  onChangeView,
}) {
  const previous = useRef(null);
  const panResponder = useMemo(
    () =>
      // PanResponder retains gesture state internally via refs.
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          previous.current = touchPoint(event);
        },
        onPanResponderMove: (event) => {
          const next = touchPoint(event),
            last = previous.current;
          if (!next) return;
          if (last && last.count === next.count) {
            onChangeView((old) => ({
              x: old.x + next.x - last.x,
              y: old.y + next.y - last.y,
              scale:
                last.distance && next.distance
                  ? limit((old.scale * next.distance) / last.distance)
                  : old.scale,
              rotation:
                last.count > 1
                  ? old.rotation + ((next.angle - last.angle) * 180) / Math.PI
                  : old.rotation,
            }));
          }
          previous.current = next;
        },
        onPanResponderRelease: () => {
          previous.current = null;
        },
        onPanResponderTerminate: () => {
          previous.current = null;
        },
      }),
    [onChangeView]
  );

  const target = selected == null ? null : mapPoints[selected % mapPoints.length];
  const line =
    target && navigating
      ? [
          {
            left: `${Math.min(userGps.x, target.x)}%`,
            top: `${target.y}%`,
            width: `${Math.abs(target.x - userGps.x)}%`,
            height: 4,
          },
          {
            left: `${userGps.x}%`,
            top: `${Math.min(userGps.y, target.y)}%`,
            width: 4,
            height: `${Math.abs(target.y - userGps.y)}%`,
          },
        ]
      : [];

  return (
    <View style={styles.mapViewport} {...panResponder.panHandlers}>
      <View
        style={[
          styles.mapLayer,
          {
            transform: [
              { translateX: view.x },
              { translateY: view.y },
              { scale: view.scale },
              { rotate: `${view.rotation}deg` },
            ],
          },
        ]}
      >
        <View style={[styles.mapRiver, { transform: [{ rotate: "18deg" }] }]} />
        {[
          { x: -55, y: 22, r: 26 },
          { x: -50, y: 66, r: -20 },
          { x: 45, y: 2, r: 55 },
          { x: 25, y: 45, r: -65 },
        ].map((road, i) => (
          <View
            key={i}
            style={[
              styles.mapRoad,
              {
                left: `${road.x}%`,
                top: `${road.y}%`,
                transform: [{ rotate: `${road.r}deg` }],
              },
            ]}
          />
        ))}
        {line.map((position, i) => (
          <View key={i} style={[styles.routeLine, position]} />
        ))}
        {placesList.map((place, i) => {
          const pt = mapPoints[i % mapPoints.length];
          return (
            <Pressable
              key={place.id || i}
              onPress={() => onSelect(i)}
              style={[
                styles.mapPin,
                { left: `${pt.x}%`, top: `${pt.y}%` },
                selected === i && styles.mapPinSelected,
              ]}
            >
              <View style={styles.pinDot} />
              <Text style={styles.mapPinText} numberOfLines={1}>
                {place.name[lang]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function App() {
  const [lang, setLang] = useState("vi");
  const [welcomeLang, setWelcomeLang] = useState("vi");
  const [entered, setEntered] = useState(false);
  const [page, setPage] = useState("home");
  const [placesList, setPlacesList] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(true);
  const [placesError, setPlacesError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [userLoc, setUserLoc] = useState(null); // { lat, lng } vị trí thật
  const [locStatus, setLocStatus] = useState("idle"); // idle | loading | ok | denied | error
  const [currentPlace, setCurrentPlace] = useState(0);
  const [playingPlaceIndex, setPlayingPlaceIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [navigating, setNavigating] = useState(false);
  const [busVisible, setBusVisible] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [mapView, setMapView] = useState({ x: 0, y: 0, scale: 1, rotation: 0 });

  const scroll = useRef(null);
  const tr = (key, fallback = key) =>
    words[lang]?.[key] ?? words.vi?.[key] ?? fallback;

  // M04: nhớ ngôn ngữ đã chọn lần trước, bỏ qua màn chào nếu đã chọn.
  useEffect(() => {
    AsyncStorage.getItem("guideLang")
      .then((saved) => {
        if (saved === "vi" || saved === "en") {
          setLang(saved);
          setWelcomeLang(saved);
          setEntered(true);
        }
      })
      .catch(() => {});
  }, []);

  // M01-M03 + M10: tải danh sách địa danh, có thể tải lại khi lỗi.
  useEffect(() => {
    let active = true;
    async function loadData() {
      setPlacesLoading(true);
      setPlacesError("");
      try {
        const apiData = await fetchPlacesFromAPI();
        if (active) setPlacesList(apiData);
      } catch (error) {
        if (active) setPlacesError(errorMessage(error, lang));
      } finally {
        if (active) setPlacesLoading(false);
      }
    }
    void loadData();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  useEffect(() => startPresence({
    send: active => {
      void fetch(`${API_BASE_URL}/api/analytics/ping`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: mobileSessionId, visitorId: mobileSessionId, platform: 'mobile', active }),
      }).catch(() => {});
    },
    isActive: () => AppState.currentState === 'active',
    subscribe: ping => {
      const subscription = AppState.addEventListener('change', ping);
      return () => subscription.remove();
    },
  }), []);

  const place = placesList[currentPlace] || placesList[0] || {
    id: "",
    name: { vi: "", en: "" },
    image: "",
    gallery: [],
    desc: { vi: "", en: "" },
    history: { vi: "", en: "" },
    audioUrl: {},
  };
  const playingPlace = placesList[playingPlaceIndex] || place;
  
  // Audio Player phát nguồn audio của địa danh đang phát
  const player = useAudioPlayer(null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const sourceRef = useRef('');
  const pendingRef = useRef(null);
  const analyticsRef = useRef(null);
  const [audioError, setAudioError] = useState('');
  const [audioLoading, setAudioLoading] = useState(false); // M06: đang tải audio
  const [audioEnded, setAudioEnded] = useState(false);     // M06: đã phát xong
  const loadTimer = useRef(null);
  const barWidth = useRef(0);
  const clearLoadTimer = () => {
    if (loadTimer.current) { clearTimeout(loadTimer.current); loadTimer.current = null; }
  };
  const [playingLanguage, setPlayingLanguage] = useState('vi');
  const matchesSelection = playingPlaceIndex === currentPlace && playingLanguage === lang;
  const transcriptText = place.history?.[lang] || '';
  const transcriptParagraphs = transcriptText.split(/\n+/).filter(Boolean);

  // Wait for the replacement source to load before seeking or starting playback.
  useEffect(() => {
    const subscription = player.addListener('playbackStatusUpdate', async next => {
      if (next.isLoaded) { clearLoadTimer(); setAudioLoading(false); }
      if (next.didJustFinish) setAudioEnded(true);
      if (next.playing && analyticsRef.current) {
        const event = analyticsRef.current;
        analyticsRef.current = null;
        void fetch(`${API_BASE_URL}/api/analytics/play`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorId: mobileSessionId, ...event }),
        }).catch(() => {});
      }
      const request = pendingRef.current;
      if (!request || !next.isLoaded) return;
      pendingRef.current = null;
      try {
        if (request.start > 0) await player.seekTo(request.start);
        if (sourceRef.current !== request.src) return;
        player.play();
      } catch { setAudioError('Không thể phát đoạn audio đã chọn.'); }
    });
    return () => subscription.remove();
  }, [player]);

  if (placesLoading || placesError || placesList.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.pageHeading}>
          <Text style={styles.title}>Saigon Audio Guide</Text>
          {placesLoading ? (
            <>
              <ActivityIndicator color={C.pink} style={{ marginTop: 16 }} />
              <Text style={styles.paragraph}>
                {lang === "vi" ? "Đang tải địa danh..." : "Loading places..."}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.paragraph}>
                {placesError ||
                  (lang === "vi"
                    ? "Chưa có địa danh trong cơ sở dữ liệu."
                    : "No places available yet.")}
              </Text>
              <Pressable style={styles.primary} onPress={() => setReloadKey((k) => k + 1)}>
                <Text style={styles.primaryText}>{lang === "vi" ? "Thử lại" : "Retry"}</Text>
              </Pressable>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const showPage = (next) => {
    setPage(next);
    scroll.current?.scrollTo({ y: 0, animated: true });
  };

  const openDetail = (index) => {
    setCurrentPlace(index);
    showPage("detail");
  };

  const setLanguage = (next) => {
    pendingRef.current = null;
    analyticsRef.current = null;
    sourceRef.current = '';
    player.pause();
    setAudioLoading(false);
    setAudioEnded(false);
    clearLoadTimer();
    setLang(next);
    AsyncStorage.setItem("guideLang", next).catch(() => {});
  };

  // GPS: xin quyền và lấy vị trí hiện tại của người dùng.
  const requestLocation = async () => {
    setLocStatus("loading");
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== "granted") {
        setLocStatus("denied");
        return null;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserLoc(loc);
      setLocStatus("ok");
      return loc;
    } catch {
      setLocStatus("error");
      return null;
    }
  };

  const onMyLocation = () => {
    if (locStatus === "denied") void Linking.openSettings();
    else void requestLocation();
  };

  const distanceLabel = (p) => {
    const vi = lang === "vi";
    if (!p || p.lat == null || p.lng == null) return vi ? "Chưa có toạ độ" : "No coordinates";
    if (locStatus === "loading") return vi ? "Đang lấy vị trí..." : "Getting location...";
    if (locStatus === "denied") return vi ? "Chưa cấp quyền vị trí" : "Location permission denied";
    if (!userLoc) return vi ? "Chưa có vị trí của bạn" : "Your location is unavailable";
    const km = haversineKm(userLoc, p);
    const text = km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
    return `${text} ${vi ? "(đường chim bay)" : "(straight line)"}`;
  };

  // Mở Google Maps chỉ đường đi bộ từ vị trí hiện tại tới địa danh.
  const openDirections = async (p) => {
    if (!p || p.lat == null || p.lng == null) {
      setAudioError(lang === "vi" ? "Địa danh này chưa có toạ độ." : "This place has no coordinates yet.");
      return;
    }
    const origin = userLoc ? `&origin=${userLoc.lat},${userLoc.lng}` : "";
    const url =
      `https://www.google.com/maps/dir/?api=1${origin}` +
      `&destination=${p.lat},${p.lng}&travelmode=walking`;
    try {
      await Linking.openURL(url);
    } catch {
      setAudioError(lang === "vi" ? "Không mở được Google Maps." : "Could not open Google Maps.");
    }
  };

  const choosePin = (index) => {
    if (!userLoc && locStatus !== "denied" && locStatus !== "loading") void requestLocation();
    setSelected(index);
    setNavigating(false);
    setBusVisible(false);
    setDestinationOpen(false);
  };

  const closePanel = () => {
    setSelected(null);
    setNavigating(false);
    setBusVisible(false);
  };

  const playAudio = async (targetIndex, start = null) => {
    const targetPlace = placesList[targetIndex];
    const src = targetPlace?.audioUrl?.[lang];
    if (!src) { setAudioError('Chưa có audio cho ngôn ngữ đang chọn.'); return; }
    setAudioError('');
    setAudioEnded(false);
    analyticsRef.current = { landmarkId: targetPlace.id, lang };
    setPlayingPlaceIndex(targetIndex);
    setPlayingLanguage(lang);
    try {
      if (sourceRef.current !== src) {
        player.pause();
        sourceRef.current = src;
        pendingRef.current = { src, start: start ?? 0 };
        setAudioLoading(true);
        clearLoadTimer();
        loadTimer.current = setTimeout(() => {
          // M10: quá 15 giây không tải được audio thì báo lỗi, cho thử lại.
          setAudioLoading(false);
          pendingRef.current = null;
          sourceRef.current = '';
          player.pause();
          setAudioError(lang === 'vi'
            ? 'Không tải được audio. Kiểm tra mạng rồi bấm phát lại.'
            : 'Could not load audio. Check your network and tap play again.');
        }, 15000);
        player.replace(src);
      } else {
        if (start != null || player.currentTime >= player.duration) await player.seekTo(start ?? 0);
        player.play();
      }
    } catch {
      setAudioLoading(false);
      setAudioError(lang === 'vi' ? 'Không thể phát audio.' : 'Unable to play audio.');
    }
  };
  // M05: chạm vào thanh tiến trình để tua
  const seekToRatio = async (ratio) => {
    if (!matchesSelection || !status.duration) return;
    try {
      await player.seekTo(Math.min(1, Math.max(0, ratio)) * status.duration);
    } catch { /* bỏ qua */ }
  };
  const toggleAudio = (targetIndex = currentPlace) => {
    if (targetIndex === playingPlaceIndex && playingLanguage === lang && player.playing) player.pause();
    else void playAudio(targetIndex);
  };

  const welcome = (
    <ScrollView contentContainerStyle={styles.welcomeBody}>
      <ImageBackground
        source={photo(placesList[2]?.image || placesList[0]?.image)}
        resizeMode="cover"
        imageStyle={styles.welcomeImage}
        style={styles.welcomeHero}
      >
        <View style={styles.heroShade} />
        <Text style={styles.whiteBrand}>◉ SAIGON AUDIO GUIDE</Text>
        <View>
          <Text style={styles.heroEyebrow}>YOUR CITY, YOUR STORY</Text>
          <Text style={styles.welcomeHeadline}>
            {lang === "vi"
              ? "Chạm vào nhịp sống Sài Gòn"
              : "Feel the rhythm of Saigon"}
          </Text>
          <Text style={styles.welcomeSummary}>
            {lang === "vi"
              ? "Khám phá lịch sử Quận 1 qua từng câu chuyện."
              : "Discover District 1, one story at a time."}
          </Text>
        </View>
      </ImageBackground>
      <View style={styles.welcomeForm}>
        <Text style={styles.eyebrow}>{tr("welcomeStep")}</Text>
        <Text style={styles.title}>{tr("welcomeHello")}</Text>
        <Text style={styles.script}>{tr("welcomeScript")}</Text>
        <Text style={styles.paragraph}>{tr("welcomePrompt")}</Text>
        <Choice
          selected={welcomeLang === "vi"}
          onPress={() => setWelcomeLang("vi")}
        >
          VN Tiếng Việt · Thuyết minh tiếng Việt
        </Choice>
        <Choice
          selected={welcomeLang === "en"}
          onPress={() => setWelcomeLang("en")}
        >
          EN English · Audio guide in English
        </Choice>
        <Pressable
          style={styles.primary}
          onPress={() => {
            setLanguage(welcomeLang);
            setEntered(true);
            showPage("home");
          }}
        >
          <Text style={styles.primaryText}>{tr("continueBtn")} →</Text>
        </Pressable>
      </View>
    </ScrollView>
  );

  const home = (
    <>
      <View style={styles.pageHeading}>
        <Text style={styles.eyebrow}>
          {lang === "vi"
            ? "BẢN ĐỒ MINH HỌA · QUẬN 1"
            : "ILLUSTRATIVE MAP · DISTRICT 1"}
        </Text>
        <Text style={styles.title}>{tr("homeTitle")}</Text>
        <Text style={styles.paragraph}>{tr("homeSubtitle")}</Text>
      </View>
      <View style={styles.mapCard}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setDestinationOpen((value) => !value)}
          style={styles.destination}
        >
          <Text style={styles.destinationText}>
            📍{" "}
            {selected == null
              ? lang === "vi"
                ? "Chọn điểm đến"
                : "Select destination"
              : placesList[selected]?.name[lang]}{" "}
            ▾
          </Text>
        </Pressable>
        {destinationOpen && (
          <ScrollView nestedScrollEnabled style={styles.destinationList}>
            {placesList.map((p, i) => (
              <Pressable
                key={p.id || i}
                onPress={() => choosePin(i)}
                style={styles.destinationOption}
              >
                <Text style={styles.text}>{p.name[lang]}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
        <MapArea
          placesList={placesList}
          lang={lang}
          selected={selected}
          onSelect={choosePin}
          navigating={navigating}
          view={mapView}
          onChangeView={setMapView}
        />
        <View style={styles.mapControls}>
          <Pressable
            style={styles.mapButton}
            onPress={() =>
              setMapView((v) => ({ ...v, scale: limit(v.scale + 0.2) }))
            }
          >
            <Text style={styles.controlText}>+</Text>
          </Pressable>
          <Pressable
            style={styles.mapButton}
            onPress={() =>
              setMapView((v) => ({ ...v, scale: limit(v.scale - 0.2) }))
            }
          >
            <Text style={styles.controlText}>−</Text>
          </Pressable>
          <Pressable
            style={styles.mapButton}
            onPress={() =>
              setMapView((v) => ({ ...v, rotation: v.rotation + 45 }))
            }
          >
            <Text style={styles.controlText}>↺</Text>
          </Pressable>
          <Pressable
            style={styles.mapButton}
            onPress={() => setMapView({ x: 0, y: 0, scale: 1, rotation: 0 })}
          >
            <Text style={styles.controlText}>⌖</Text>
          </Pressable>
        </View>
        {selected != null && (
          <View style={styles.actionPanel}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>
                  {placesList[selected]?.name[lang]}
                </Text>
                <Text style={styles.note}>
                  {lang === "vi" ? "Khoảng cách: " : "Distance: "}
                  {distanceLabel(placesList[selected])}
                </Text>
              </View>
              <Pressable onPress={closePanel}>
                <Text style={styles.close}>✕</Text>
              </Pressable>
            </View>
            <View style={styles.actionButtons}>
              <Pressable
                style={styles.primarySmall}
                onPress={() => openDirections(placesList[selected])}
              >
                <Text style={styles.whiteText}>
                  ➔ {lang === "vi" ? "Chỉ đường" : "Directions"}
                </Text>
              </Pressable>
              <Pressable style={styles.secondarySmall} onPress={onMyLocation}>
                <Text style={styles.pinkText}>
                  📍 {locStatus === "denied"
                    ? (lang === "vi" ? "Mở cài đặt" : "Settings")
                    : (lang === "vi" ? "Vị trí của tôi" : "My location")}
                </Text>
              </Pressable>
              <Pressable
                style={styles.secondarySmall}
                onPress={() => setBusVisible((value) => !value)}
              >
                <Text style={styles.pinkText}>🚌 {tr("busConnect")}</Text>
              </Pressable>
              {navigating && (
                <Pressable style={styles.secondarySmall} onPress={closePanel}>
                  <Text style={styles.pinkText}>✕ {tr("exitNav")}</Text>
                </Pressable>
              )}
            </View>
            {busVisible && (
              <Text style={styles.busInfo}>
                🚌 {lang === "vi" ? "Tuyến minh họa" : "Illustrative bus lines"}
                : {placesList[selected]?.bus}
              </Text>
            )}
          </View>
        )}
      </View>
      <Text style={[styles.eyebrow, { margin: 16 }]}>DANH SÁCH KHÁM PHÁ</Text>
      {placesList.map((p, i) => (
        <Pressable
          key={p.id || i}
          onPress={() => openDetail(i)}
          style={styles.placeCard}
        >
          <Image source={photo(p.image)} style={styles.placePhoto} />
          <View style={styles.placeCopy}>
            <Text style={styles.placeTitle}>{p.name[lang]}</Text>
            <Text style={styles.meta}>
              ⌖ {p.time} · {tr("walking")}
            </Text>
            <Text style={styles.paragraph}>{p.desc[lang]}</Text>
            <Text style={styles.pinkText}>{tr("readMore")}</Text>
          </View>
        </Pressable>
      ))}
    </>
  );

  const detail = (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickChips}
        contentContainerStyle={styles.quickChipsContent}
      >
        {placesList.map((p, i) => (
          <Choice
            key={p.id || i}
            selected={i === currentPlace}
            onPress={() => openDetail(i)}
            style={{ marginRight: 8 }}
          >
            {p.name[lang]}
          </Choice>
        ))}
      </ScrollView>
      <Pressable onPress={() => showPage("home")} style={styles.back}>
        <Text style={styles.pinkText}>← {tr("backHome")}</Text>
      </Pressable>
      <ImageBackground
        source={photo(place.image)}
        style={styles.detailHero}
        imageStyle={styles.detailHeroImage}
      >
        <View style={styles.heroShade} />
        <View style={styles.detailHeroCopy}>
          <Text style={styles.detailHeroTitle}>{place.name[lang]}</Text>
          <Text style={styles.welcomeSummary}>{place.short[lang]}</Text>
        </View>
      </ImageBackground>
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>{tr("audioTitle")}</Text>
          <Text style={styles.meta}>{place.time}</Text>
        </View>
        <View style={styles.player}>
          <Pressable
            style={styles.playButton}
            onPress={() => toggleAudio(currentPlace)}
            disabled={audioLoading && matchesSelection}
          >
            {audioLoading && matchesSelection ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.whiteText}>
                {status.playing && matchesSelection ? "Ⅱ" : audioEnded && matchesSelection ? "↺" : "▶"}
              </Text>
            )}
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.textStrong}>{place.name[lang]}</Text>
            <Pressable
              hitSlop={8}
              onLayout={(e) => { barWidth.current = e.nativeEvent.layout.width; }}
              onPress={(e) => seekToRatio(e.nativeEvent.locationX / (barWidth.current || 1))}
            >
              <View style={styles.progress}>
                <View
                  style={[
                    styles.progressFilled,
                    {
                      width: `${
                        status.duration && matchesSelection
                          ? (status.currentTime / status.duration) * 100
                          : 0
                      }%`,
                    },
                  ]}
                />
              </View>
            </Pressable>
          </View>
          <Text style={styles.meta}>
            {matchesSelection
              ? `${formatTime(status.currentTime * 1000)} / ${formatTime(status.duration * 1000)}`
              : "00:00 / 00:00"}
          </Text>
        </View>
        {audioLoading && matchesSelection ? (
          <Text style={styles.note}>{lang === "vi" ? "Đang tải audio..." : "Loading audio..."}</Text>
        ) : null}
        {audioEnded && matchesSelection ? (
          <Text style={styles.note}>
            {lang === "vi" ? "Đã phát xong. Bấm ↺ để nghe lại." : "Finished. Tap ↺ to replay."}
          </Text>
        ) : null}
        {audioError ? (
          <Text accessibilityRole="alert" style={styles.errorText}>{audioError}</Text>
        ) : null}
      </View>
      <View style={styles.section}>
        <Text style={styles.cardTitle}>{tr("transcriptTitle")}</Text>
        <View style={{ marginTop: 12, gap: 10 }}>
          {transcriptParagraphs.length === 0 ? (
            <Text style={styles.paragraph}>
              {lang === "vi" ? "Chưa có nội dung văn bản." : "No transcript available."}
            </Text>
          ) : (
            transcriptParagraphs.map((text, idx) => (
              <Text key={idx} style={{ fontSize: 14, lineHeight: 22, color: C.ink }}>
                {text}
              </Text>
            ))
          )}
        </View>
      </View>
      {place.gallery && place.gallery.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.cardTitle}>{tr("galleryTitle")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {[place.image, ...place.gallery].map((url, i) => (
              <Image key={i} source={photo(url, 400)} style={styles.galleryPhoto} />
            ))}
          </ScrollView>
        </View>
      )}
    </>
  );

  const settings = (
    <>
      <View style={styles.pageHeading}>
        <Text style={styles.eyebrow}>PREFERENCES</Text>
        <Text style={styles.title}>{tr("settingsTitle")}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.cardTitle}>{tr("languageSettings")}</Text>
        <Text style={styles.paragraph}>{tr("languageSettingsDesc")}</Text>
        <Choice selected={lang === "vi"} onPress={() => setLanguage("vi")}>
          VN Tiếng Việt
        </Choice>
        <Choice selected={lang === "en"} onPress={() => setLanguage("en")}>
          EN English
        </Choice>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {entered ? (
        <>
          <View style={styles.header}>
            <Text style={styles.brand}>◉ SAIGON GUIDE</Text>
            <Pressable onPress={() => showPage("settings")}>
              <Text style={styles.language}>◉ {lang.toUpperCase()}</Text>
            </Pressable>
          </View>
          <ScrollView
            ref={scroll}
            style={styles.screen}
            contentContainerStyle={styles.scrollContent}
          >
            {page === "home" ? home : page === "detail" ? detail : settings}
            <Text style={styles.footer}>
              SAIGON GUIDE · APP PROTOTYPE · QUẬN 1
            </Text>
          </ScrollView>

          {/* ----- MINI AUDIO PLAYER TOÀN CỤC ----- */}
          {status.playing && page !== "detail" && (
            <Pressable 
              style={styles.miniPlayer} 
              onPress={() => openDetail(playingPlaceIndex)}
            >
              <Pressable 
                style={styles.playButtonSmall} 
                onPress={() => toggleAudio(playingPlaceIndex)}
              >
                <Text style={styles.whiteText}>{status.playing ? "Ⅱ" : "▶"}</Text>
              </Pressable>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.miniTitle} numberOfLines={1}>
                  🎧 {playingPlace?.name?.[lang]}
                </Text>
                <Text style={styles.miniSub}>Chạm để mở lại bài thuyết minh</Text>
              </View>
            </Pressable>
          )}

          <View style={styles.bottomNav}>
            {[
              ["home", "🗺️", tr("mapTab")],
              ["detail", "🎧", tr("detailEyebrow")],
              ["settings", "⚙️", tr("settingsTab")],
            ].map(([name, icon, label]) => (
              <Pressable
                key={name}
                onPress={() => showPage(name)}
                style={styles.navItem}
              >
                <Text style={styles.navIcon}>{icon}</Text>
                <Text style={[styles.navText, page === name && styles.navActive]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        welcome
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.cream,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
  },
  header: {
    height: 52,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  brand: { fontSize: 13, fontWeight: "900", letterSpacing: 1, color: C.ink },
  whiteBrand: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  language: { color: C.pink, fontWeight: "800", fontSize: 12 },
  screen: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  welcomeBody: { flexGrow: 1, backgroundColor: "#fff" },
  welcomeHero: { minHeight: 310, padding: 25, justifyContent: "space-between" },
  welcomeImage: { backgroundColor: C.pink },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(9,34,35,.56)",
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#ffe3ef",
  },
  welcomeHeadline: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    marginTop: 10,
  },
  welcomeSummary: { fontSize: 13, lineHeight: 21, color: "#fff", marginTop: 8 },
  welcomeForm: { flex: 1, padding: 25 },
  eyebrow: {
    color: C.pink,
    fontSize: 10,
    letterSpacing: 1.7,
    fontWeight: "900",
  },
  title: { fontSize: 27, fontWeight: "900", color: C.ink, marginTop: 7 },
  script: {
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
    fontSize: 22,
    fontStyle: "italic",
    color: C.pink,
    marginTop: 5,
  },
  paragraph: { fontSize: 13, lineHeight: 21, color: C.muted, marginTop: 9 },
  choice: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fff",
    marginTop: 10,
  },
  choiceSelected: { borderColor: C.pink, backgroundColor: "#fce7f3" },
  choiceText: { fontSize: 13, color: C.ink, fontWeight: "700" },
  choiceTextSelected: { color: C.pink },
  primary: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: C.pink,
    alignItems: "center",
    marginTop: 20,
  },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  pageHeading: { padding: 16 },
  mapCard: {
    marginHorizontal: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 17,
    overflow: "hidden",
  },
  destination: {
    margin: 12,
    padding: 11,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
    backgroundColor: "#f6f9f8",
  },
  destinationText: { color: C.ink, fontWeight: "700", fontSize: 12 },
  destinationList: {
    maxHeight: 184,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
  },
  destinationOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  mapViewport: { height: 360, backgroundColor: "#fff0f6", overflow: "hidden" },
  mapLayer: { flex: 1 },
  mapRiver: {
    position: "absolute",
    width: 76,
    height: 600,
    backgroundColor: "#b8e3e6",
    top: -110,
    left: "21%",
  },
  mapRoad: {
    position: "absolute",
    height: 9,
    width: "150%",
    backgroundColor: "#fff",
  },
  routeLine: { position: "absolute", backgroundColor: "#d63384", zIndex: 2 },
  userDot: {
    position: "absolute",
    width: 17,
    height: 17,
    borderRadius: 10,
    backgroundColor: "#d63384",
    borderWidth: 3,
    borderColor: "#fff",
    zIndex: 3,
  },
  mapPin: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    paddingRight: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#f4d9e5",
    backgroundColor: "#fff",
    zIndex: 4,
    maxWidth: 152,
  },
  mapPinSelected: { borderWidth: 2, borderColor: C.pink },
  pinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.pink,
    marginRight: 4,
  },
  mapPinText: { fontSize: 9, color: C.ink, fontWeight: "700", flexShrink: 1 },
  mapControls: { position: "absolute", right: 8, top: 68, gap: 8, zIndex: 5 },
  mapButton: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  controlText: { fontSize: 20, color: C.ink, fontWeight: "700" },
  actionPanel: { padding: 14, borderTopWidth: 1, borderColor: C.line },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: { fontSize: 15, fontWeight: "800", color: C.ink },
  close: { fontSize: 17, color: C.muted, padding: 6 },
  actionButtons: { flexDirection: "row", gap: 8, marginTop: 13 },
  primarySmall: { padding: 11, backgroundColor: C.pink, borderRadius: 10 },
  secondarySmall: { padding: 10, backgroundColor: C.soft, borderRadius: 10 },
  whiteText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  pinkText: { color: C.pink, fontSize: 12, fontWeight: "800" },
  busInfo: {
    marginTop: 12,
    padding: 10,
    backgroundColor: C.soft,
    color: C.ink,
    fontSize: 12,
    lineHeight: 18,
  },
  placeCard: {
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginBottom: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: C.line,
    overflow: "hidden",
  },
  placePhoto: { width: "100%", height: 170, backgroundColor: "#f4d9e5" },
  placeCopy: { padding: 16 },
  placeTitle: { fontSize: 19, color: C.ink, fontWeight: "900" },
  meta: { color: C.muted, fontSize: 10, marginTop: 5 },
  text: { color: C.ink, fontSize: 13 },
  textStrong: { color: C.ink, fontSize: 12, fontWeight: "800" },
  note: { color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 4 },
  quickChips: { flexGrow: 0, marginTop: 10 },
  quickChipsContent: { paddingHorizontal: 14, paddingBottom: 10 },
  back: { paddingHorizontal: 16, paddingVertical: 10 },
  detailHero: {
    marginHorizontal: 14,
    height: 205,
    justifyContent: "flex-end",
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#f4d9e5",
  },
  detailHeroImage: { borderRadius: 16 },
  detailHeroCopy: { padding: 20 },
  detailHeroTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  section: {
    marginHorizontal: 14,
    marginTop: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: C.line,
  },
  player: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 13,
    backgroundColor: "#fff5f9",
    padding: 10,
    borderRadius: 11,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 22,
    backgroundColor: C.pink,
    alignItems: "center",
    justifyContent: "center",
  },
  progress: {
    height: 4,
    backgroundColor: "#f4d9e5",
    marginTop: 8,
    borderRadius: 3,
  },
  progressFilled: { height: 4, backgroundColor: C.pink, borderRadius: 3 },
  errorText: { color: "#b3261e", fontSize: 12, lineHeight: 18, marginTop: 6 },
  galleryPhoto: {
    width: 145,
    height: 145,
    marginRight: 10,
    backgroundColor: "#f4d9e5",
    borderRadius: 12,
  },
  miniPlayer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#17212b",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#334155",
  },
  playButtonSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.pink,
    alignItems: "center",
    justifyContent: "center",
  },
  miniTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  miniSub: {
    color: "#94a3b8",
    fontSize: 10,
  },
  bottomNav: {
    height: 62,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: C.line,
  },
  navItem: { flex: 1, justifyContent: "center", alignItems: "center" },
  navIcon: { fontSize: 18 },
  navText: { fontSize: 10, color: C.muted, fontWeight: "700" },
  navActive: { color: C.pink },
  footer: { textAlign: "center", color: "#8a9698", fontSize: 9, padding: 18 },
});