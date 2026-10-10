import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  ImageBackground,
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
import { places, words, mapPoints, userGps } from "./services/mobileData";

const C = {
  ink: "#17212b",
  muted: "#65717d",
  pink: "#d63384",
  soft: "#e9f4f2",
  line: "#e5e9ec",
  cream: "#f7f8f6",
};
const photo = (url, width = 650) => ({
  uri: `${url}${url.includes("?") ? "&" : "?"}width=${width}`,
});
const limit = (value) => Math.min(2.8, Math.max(0.7, value));
const formatTime = (value) =>
  `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
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
    [onChangeView],
  );
  const target = selected == null ? null : mapPoints[selected];
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
        <View
          style={[
            styles.userDot,
            { left: `${userGps.x}%`, top: `${userGps.y}%` },
          ]}
        />
        {placesList.map((place, i) => (
          <Pressable
            key={place.name.en}
            onPress={() => onSelect(i)}
            style={[
              styles.mapPin,
              { left: `${mapPoints[i].x}%`, top: `${mapPoints[i].y}%` },
              selected === i && styles.mapPinSelected,
            ]}
          >
            <View style={styles.pinDot} />
            <Text style={styles.mapPinText} numberOfLines={1}>
              {place.name[lang]}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function App() {
  const [lang, setLang] = useState("vi");
  const [welcomeLang, setWelcomeLang] = useState("vi");
  const [entered, setEntered] = useState(false);
  const [page, setPage] = useState("home");
  const [currentPlace, setCurrentPlace] = useState(0);
  const [selected, setSelected] = useState(null);
  const [navigating, setNavigating] = useState(false);
  const [busVisible, setBusVisible] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [mapView, setMapView] = useState({ x: 0, y: 0, scale: 1, rotation: 0 });
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const scroll = useRef(null);
  const tr = (key, fallback = key) =>
    words[lang]?.[key] ?? words.vi?.[key] ?? fallback;
  useEffect(() => {
    if (!playing || elapsed >= 200) return undefined;
    const timer = setInterval(
      () => setElapsed((value) => Math.min(200, value + 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [playing, elapsed]);
  const showPage = (next) => {
    setPage(next);
    scroll.current?.scrollTo({ y: 0, animated: true });
  };
  const openDetail = (index) => {
    if (index !== currentPlace) {
      setPlaying(false);
      setElapsed(0);
    }
    setCurrentPlace(index);
    showPage("detail");
  };
  const setLanguage = (next) => {
    setLang(next);
    setPlaying(false);
    setElapsed(0);
  };
  const choosePin = (index) => {
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
  const toggleAudio = () => {
    if (elapsed >= 200) {
      setElapsed(0);
      setPlaying(true);
    } else setPlaying((value) => !value);
  };
  const place = places[currentPlace];
  const audioPlaying = playing && elapsed < 200;

  const welcome = (
    <ScrollView contentContainerStyle={styles.welcomeBody}>
      <ImageBackground
        source={photo(places[2].image)}
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
              : places[selected].name[lang]}{" "}
            ▾
          </Text>
        </Pressable>
        {destinationOpen && (
          <ScrollView nestedScrollEnabled style={styles.destinationList}>
            {places.map((p, i) => (
              <Pressable
                key={p.name.en}
                onPress={() => choosePin(i)}
                style={styles.destinationOption}
              >
                <Text style={styles.text}>{p.name[lang]}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
        <MapArea
          placesList={places}
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
                  {places[selected].name[lang]}
                </Text>
                <Text style={styles.note}>
                  {lang === "vi" ? "Khoảng cách mẫu: " : "Demo distance: "}
                  {places[selected].dist}
                </Text>
              </View>
              <Pressable onPress={closePanel} accessibilityLabel="Close">
                <Text style={styles.close}>✕</Text>
              </Pressable>
            </View>
            <View style={styles.actionButtons}>
              {!navigating && (
                <Pressable
                  style={styles.primarySmall}
                  onPress={() => setNavigating(true)}
                >
                  <Text style={styles.whiteText}>➔ {tr("startNav")}</Text>
                </Pressable>
              )}
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
                : {places[selected].bus}
              </Text>
            )}
          </View>
        )}
      </View>
      <Text style={[styles.eyebrow, { margin: 16 }]}>DANH SÁCH KHÁM PHÁ</Text>
      {places.map((p, i) => (
        <Pressable
          key={p.name.en}
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
        {places.map((p, i) => (
          <Choice
            key={p.name.en}
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
            onPress={toggleAudio}
            accessibilityLabel={audioPlaying ? tr("pause") : tr("listen")}
          >
            <Text style={styles.whiteText}>{audioPlaying ? "Ⅱ" : "▶"}</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.textStrong}>{place.name[lang]}</Text>
            <Text style={styles.note}>
              {audioPlaying
                ? lang === "vi"
                  ? "Đang mô phỏng phát…"
                  : "Simulating playback…"
                : tr("audioDemo")}
            </Text>
            <View style={styles.progress}>
              <View
                style={[styles.progressFilled, { width: `${elapsed / 2}%` }]}
              />
            </View>
          </View>
          <Text style={styles.meta}>{formatTime(elapsed)}</Text>
        </View>
        <Text style={styles.note}>
          {lang === "vi"
            ? "Trình phát mẫu, chưa có tệp âm thanh."
            : "Demo player; no audio file connected."}
        </Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.cardTitle}>{tr("transcriptTitle")}</Text>
        <Text style={[styles.paragraph, { marginTop: 12 }]}>
          {place.history[lang]}
        </Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.cardTitle}>{tr("galleryTitle")}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12 }}
        >
          {[place.image, ...place.gallery].map((url, i) => (
            <Image
              key={`${url}-${i}`}
              source={photo(url, 400)}
              style={styles.galleryPhoto}
              accessibilityLabel={`${place.name[lang]} ${i + 1}`}
            />
          ))}
        </ScrollView>
      </View>
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
          {(audioPlaying || elapsed > 0) && (
            <View style={styles.miniPlayer}>
              <Pressable onPress={toggleAudio} style={styles.playButton}>
                <Text style={styles.whiteText}>
                  {audioPlaying ? "Ⅱ" : "▶"}
                </Text>
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={styles.textStrong} numberOfLines={1}>
                  {place.name[lang]}
                </Text>
                <Text style={styles.note}>
                  {audioPlaying
                    ? lang === "vi"
                      ? "Đang mô phỏng"
                      : "Simulating"
                    : lang === "vi"
                      ? "Đã tạm dừng"
                      : "Paused"}
                </Text>
              </View>
              <Pressable onPress={() => showPage("detail")}>
                <Text style={styles.pinkText}>
                  {lang === "vi" ? "Mở ↗" : "Open ↗"}
                </Text>
              </Pressable>
            </View>
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
                <Text
                  style={[styles.navText, page === name && styles.navActive]}
                >
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
    gap: 10,
    padding: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: C.line,
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
