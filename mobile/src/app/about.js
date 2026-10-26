import { router, Stack } from "expo-router";
import { Linking, View } from "react-native";
import { mapDirectionsUrl, mapEmbedUrl } from "@shared/lib/maps";
import MapView from "@/components/MapView";
import RichText from "@/components/RichText";
import { Button, Heading, Row, Screen, SectionHeading, T } from "@/components/ui";
import { useColors, useSettings } from "@/context/StoreContext";
import { radius } from "@/lib/theme";

export default function AboutScreen() {
  const colors = useColors();
  const { about } = useSettings().settings;
  const mapSrc = about.showMap ? mapEmbedUrl(about.mapLocation, about.mapAddress) : null;
  const directions = mapDirectionsUrl(about.mapLocation, about.mapAddress);

  return (
    <Screen>
      <Stack.Screen options={{ title: "About Us" }} />
      <SectionHeading eyebrow={about.eyebrow} title={about.title} />
      <RichText text={about.story} />
      {about.values.length > 0 && (
        <View style={{ marginTop: 20, gap: 14 }}>
          {about.values.map((v, i) => (
            <Row key={i} gap={14} style={{ alignItems: "flex-start" }}>
              <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: colors.brand100, alignItems: "center", justifyContent: "center" }}>
                <T size={20}>{v.icon}</T>
              </View>
              <View style={{ flex: 1 }}>
                <T weight="extrabold">{v.title}</T>
                <T size={14} color={colors.grey[500]}>
                  {v.text}
                </T>
              </View>
            </Row>
          ))}
        </View>
      )}
      <Row gap={10} style={{ marginTop: 22, flexWrap: "wrap" }}>
        <Button title="Browse Products" onPress={() => router.push("/products")} />
        <Button title="Contact Us" variant="outline" onPress={() => router.push("/contact")} />
      </Row>

      {about.stats.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 24 }}>
          {about.stats.map((s, i) => (
            <View key={i} style={{ flexBasis: "30%", flexGrow: 1, borderWidth: 1.5, borderColor: colors.grey[200], borderRadius: radius.card, paddingVertical: 18, paddingHorizontal: 8, alignItems: "center" }}>
              <T weight="black" size={22} color={colors.brand600}>
                {s.value}
              </T>
              <T weight="bold" size={11.5} color={colors.grey[500]} center>
                {s.label}
              </T>
            </View>
          ))}
        </View>
      )}

      {mapSrc && (
        <View style={{ marginTop: 32 }}>
          <Heading>{about.mapTitle}</Heading>
          <View style={{ marginTop: 14, borderWidth: 1.5, borderColor: colors.grey[200], borderRadius: radius.panel, overflow: "hidden", backgroundColor: colors.grey[100] }}>
            <MapView key={mapSrc} src={mapSrc} title={`Map: ${about.mapAddress || about.mapTitle}`} style={{ height: 300 }} />
          </View>
          <Row style={{ justifyContent: "space-between", marginTop: 12, flexWrap: "wrap" }}>
            {!!about.mapAddress && <T weight="bold">📍 {about.mapAddress}</T>}
            {directions && <Button title="Get directions ↗" variant="outline" size="sm" onPress={() => Linking.openURL(directions)} />}
          </Row>
        </View>
      )}
    </Screen>
  );
}
