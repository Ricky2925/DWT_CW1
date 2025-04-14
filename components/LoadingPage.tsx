// components/LoadingPage.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  TouchableOpacity,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../App";
import * as Location from "expo-location";
import { useDispatch, useSelector } from "react-redux";
import { addLocation, updateLocation } from "../store/locationSlice";
import { RootState } from "../store/store";
import axios from "axios";

type Props = StackScreenProps<RootStackParamList, "Loading">;

const LoadingPage: React.FC<Props> = ({ navigation }) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const dispatch = useDispatch();
  const session = useSelector((state: RootState) => state.location.session);

  // Fetch location data
  const getLocation = async () => {
    setIsLoading(true);
    try {
      // Check permission status
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        status = newStatus;
      }

      if (status !== "granted") {
        setErrorMsg("Location permission is required to continue");
        return;
      }

      // Get coordinates
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
      });
      setLocation(location);
      setErrorMsg(null);

      // Store in Redux
      const locationData = {
        latitude: location.coords.latitude.toFixed(7),
        longitude: location.coords.longitude.toFixed(7),
        datetime: new Date().toISOString().replace(/[-:T.Z]/g, ""),
        session: session || "",
        is_send: 0,
        send_time: null,
      };
      dispatch(addLocation(locationData));

      // Auto-upload
      await uploadLocationData(locationData);

    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Upload to server
  const uploadLocationData = async (data: any) => {
    setUploading(true);
    try {
      const response = await axios.post("http://82.156.194.242:3690/upload", data);
      dispatch(updateLocation({ ...data, is_send: 1 }));
      return response.data;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Periodic location updates (every 30 seconds)
  useEffect(() => {
    getLocation();
    const interval = setInterval(getLocation, 30000);
    return () => clearInterval(interval);
  }, []);

  // Location display text
  const locationText = location
    ? `Latitude: ${location.coords.latitude.toFixed(7)}\nLongitude: ${location.coords.longitude.toFixed(7)}`
    : "Acquiring location...";

  return (
    <ImageBackground
      source={require("../assets/homeBG.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.9)", "rgba(245,245,245,0.85)"]}
        style={styles.gradientOverlay}
      >
        <View style={styles.container}>
          <MaterialIcons
            name={location ? "location-on" : "location-searching"}
            size={80}
            color="#007BFF"
            style={styles.icon}
          />
          
          <Text style={styles.title}>
            {location ? "Location Acquired" : "Acquiring Location"}
          </Text>

          {isLoading && (
            <ActivityIndicator size="large" color="#007BFF" style={styles.spinner} />
          )}

          <Text style={styles.locationText}>
            {errorMsg || locationText}
          </Text>

          {errorMsg?.toLowerCase().includes("permission") && (
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => Linking.openSettings()}
            >
              <Text style={styles.settingsText}>Open Settings to Enable Permissions</Text>
            </TouchableOpacity>
          )}

          {!isLoading && (
            <TouchableOpacity
              style={[styles.button, uploading && styles.disabledButton]}
              onPress={() => navigation.navigate("Camera")}
              disabled={uploading}
            >
              <LinearGradient
                colors={["#4A90E2", "#007BFF"]}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {uploading ? "Uploading..." : "Proceed to Camera"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  gradientOverlay: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  icon: { marginBottom: 30 },
  title: {
    fontSize: 28,
    fontFamily: "Roboto",
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 20,
  },
  spinner: { marginBottom: 30 },
  locationText: {
    fontSize: 18,
    color: "#4a4a4a",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    width: "80%",
    borderRadius: 25,
    overflow: "hidden",
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  settingsButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
  },
  settingsText: {
    color: "#007BFF",
    fontSize: 16,
  },
});

export default LoadingPage;