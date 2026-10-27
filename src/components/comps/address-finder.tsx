import { useRef, useState } from "react";
import { View, StyleSheet, Text, TextInput, Pressable, ActivityIndicator } from "react-native";

interface AddressFinderProps {
  onAddressSelect: (data: { address: string; suburb: string; state: string; postcode: string }) => void;
  defaultValue?: string;
  showLabel?: boolean
}

interface Prediction {
  place_id: string;
  description: string;
}

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function AddressFinder({ onAddressSelect, defaultValue, showLabel = true }: AddressFinderProps) {
  const [query, setQuery] = useState(defaultValue || "");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);

  const search = (text: string) => {
    setQuery(text);
    if (timer.current) clearTimeout(timer.current);

    if (text.trim().length < 2) {
      setPredictions([]);
      setLoading(false);
      return;
    }

    timer.current = setTimeout(async () => {
      const id = ++requestId.current;
      setLoading(true);
      try {
        const url =
          "https://maps.googleapis.com/maps/api/place/autocomplete/json" +
          `?input=${encodeURIComponent(text)}&key=${API_KEY}&language=en&components=country:au`;
        const res = await fetch(url);
        const json = await res.json();
        if (id !== requestId.current) return;
        setPredictions(json.status === "OK" ? json.predictions : []);
      } catch {
        if (id === requestId.current) setPredictions([]);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, 300);
  };

  const select = async (item: Prediction) => {
    setPredictions([]);
    setQuery(item.description);
    setLoading(true);
    try {
      const url =
        "https://maps.googleapis.com/maps/api/place/details/json" +
        `?place_id=${item.place_id}&fields=address_component&key=${API_KEY}&language=en`;
      const res = await fetch(url);
      const json = await res.json();
      const components: { long_name: string; short_name: string; types: string[] }[] =
        json.result?.address_components || [];

      let suburb = "";
      let state = "";
      let postcode = "";

      components.forEach((component) => {
        if (component.types.includes("locality") || component.types.includes("sublocality_level_1")) {
          suburb = component.long_name;
        }
        if (component.types.includes("administrative_area_level_1")) {
          state = component.short_name;
        }
        if (component.types.includes("postal_code")) {
          postcode = component.long_name;
        }
      });

      const streetNumber = components.find((c) => c.types.includes("street_number"))?.long_name || "";
      const route = components.find((c) => c.types.includes("route"))?.long_name || "";
      const fullAddress = `${streetNumber} ${route}`.trim();

      onAddressSelect({
        address: fullAddress || item.description,
        suburb,
        state,
        postcode,
      });
    } catch {
      onAddressSelect({ address: item.description, suburb: "", state: "", postcode: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {showLabel && <Text style={styles.label}>Address</Text>}
      <View>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={search}
          placeholder="Start typing your address..."
          placeholderTextColor="#A8A29E"
          autoCorrect={false}
        />
        {loading ? <ActivityIndicator size="small" color="#A8A29E" style={styles.loader} /> : null}
      </View>
      {predictions.length > 0 ? (
        <View style={styles.listView}>
          {predictions.map((item, index) => (
            <Pressable
              key={item.place_id}
              style={[styles.row, index === predictions.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => select(item)}
            >
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 100,
    position: "relative",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#44403C",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#292524",
    backgroundColor: "#FFFFFF",
  },
  loader: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  listView: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7E5E4",
    marginTop: 4,
  },
  row: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
  },
  description: {
    color: "#292524",
    fontSize: 14,
  },
});