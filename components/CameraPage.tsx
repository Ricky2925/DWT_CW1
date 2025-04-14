import React, { useRef, useState } from "react";
import {
  CameraView,
  useCameraPermissions,
  CameraType,
} from "expo-camera";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, FontAwesome6 } from "@expo/vector-icons";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { addLocation, updateLocation } from "../store/locationSlice";
import axios from "axios";

const { width, height } = Dimensions.get("window");

const CameraPage = ({ navigation }: { navigation: any }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [isCapturing, setIsCapturing] = useState(false);
  
  const session = useSelector((state: any) => state.location.session);
  const locations = useSelector((state: any) => state.location.locations);
  const dispatch = useDispatch();

  const toggleFacing = () => {
    setFacing(current => (current === "back" ? "front" : "back"));
  };


  const takePicture = async () => {
    if (ref.current && !isCapturing) {
      try {
        setIsCapturing(true);
        const photo = await ref.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: true,
        });
        setUri(photo.uri);
      } catch (error) {
        Alert.alert("Error "," Could not take photo");
      } finally {
        setIsCapturing(false);
      }
    }
  };


  const sendPhoto = async () => {
    if (!uri) return;

    const latestLocation = locations[locations.length - 1];
    const datetime = new Date().toISOString().replace(/[-:T.Z]/g, "");

    const photoData = {
      datetime,
      session,
      latitude: latestLocation?.latitude || "0.0000000",
      longitude: latestLocation?.longitude || "0.0000000",
      img: uri,
      is_send: 0,
      send_time: null,
    };

    dispatch(addLocation(photoData));

    try {
      const response = await axios.post(
        "http://82.156.194.242:3690/upload",
        photoData,
        { headers: { "Content-Type": "application/json" } }
      );
      
      dispatch(updateLocation({
        ...photoData,
        is_send: 1,
        send_time: new Date().toISOString().replace(/[-:T.Z]/g, ""),
      }));
      
      Alert.alert("Upload successful "," Photo and location uploaded");
      navigation.navigate("Loading");
    } catch (error) {
      console.error("Upload failed:", error);
      Alert.alert("Upload failed "," Please try again");
    }
  };


  const saveToGallery = async () => {
    if (!uri) return;
    Alert.alert("Saved successfully "," Photo saved to album");
    setUri(null);
  };


  const renderCameraControls = () => (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <LinearGradient
        colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0.2)"]}
        style={styles.controlsWrapper}
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.buttonPressed
            ]}
          >
            <MaterialIcons name="arrow-back" size={28} color="white" />
          </Pressable>
          
          <Pressable
            onPress={toggleFacing}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.buttonPressed
            ]}
          >
            <FontAwesome6 name="rotate" size={24} color="white" />
          </Pressable>
        </View>

        <View style={styles.mainControls}>
          <View style={styles.sideGroup}>
            <Pressable style={styles.sideButton}>
              <Feather name="settings" size={24} color="white" />
            </Pressable>
          </View>

          <Pressable 
            onPress={takePicture}
            disabled={isCapturing}
            style={({ pressed }) => [
              styles.captureButton,
              pressed && { transform: [{ scale: 0.95 }] }
            ]}
          >
            <LinearGradient
              colors={isCapturing ? ["#007BFF", "#0051A2"] : ["#FFFFFF", "#E0E0E0"]}
              style={styles.captureOuter}
            >
              <View style={styles.captureInner} />
            </LinearGradient>
          </Pressable>

          <View style={styles.sideGroup}>
            <Pressable style={styles.sideButton}>
              <MaterialIcons name="photo-library" size={24} color="white" />
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );

 
  const renderPreviewControls = () => (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <LinearGradient
        colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0.2)"]}
        style={styles.previewControls}
      >
        <View style={styles.previewButtonGroup}>
          <Pressable 
            onPress={() => setUri(null)}
            style={({ pressed }) => [
              styles.actionButton,
              styles.cancelButton,
              pressed && styles.buttonPressed
            ]}
          >
            <MaterialIcons name="close" size={24} color="white" />
            <Text style={styles.actionText}>Rephotograph</Text>
          </Pressable>

          <Pressable
            onPress={sendPhoto}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.buttonPressed
            ]}
          >
            <MaterialIcons name="send" size={24} color="white" />
            <Text style={styles.actionText}>Send</Text>
          </Pressable>

          <Pressable
            onPress={saveToGallery}
            style={({ pressed }) => [
              styles.actionButton,
              styles.saveButton,
              pressed && styles.buttonPressed
            ]}
          >
            <MaterialIcons name="save-alt" size={24} color="white" />
            <Text style={styles.actionText}>Save</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <LinearGradient
        colors={["#1a1a1a", "#2d2d2d"]}
        style={styles.permissionContainer}
      >
        <View style={styles.permissionContent}>
          <MaterialIcons
            name="photo-camera"
            size={64}
            color="#007BFF"
            style={styles.cameraIcon}
          />
          <Text style={styles.permissionTitle}>Require camera permissions</Text>
          <Text style={styles.permissionText}>
          Please allow access to the camera to use the shooting function
          </Text>
          <Pressable
            onPress={requestPermission}
            style={styles.permissionButton}
          >
            <LinearGradient
              colors={["#4A90E2", "#007BFF"]}
              style={styles.buttonGradient}
            >
              <Text style={styles.permissionButtonText}>grant permission</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {uri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri }} style={styles.previewImage} />
          {renderPreviewControls()}
        </View>
      ) : (
        <CameraView 
          ref={ref} 
          style={styles.camera} 
          facing={facing}
          enableTorch={false}
        >
          {renderCameraControls()}
        </CameraView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  safeArea: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  controlsWrapper: {
    paddingTop: 16,
    paddingBottom: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideGroup: {
    flex: 1,
    alignItems: 'center',
  },
  sideButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  captureButton: {
    width: 80,
    height: 80,
    marginHorizontal: 20,
  },
  captureOuter: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  captureInner: {
    width: '90%',
    height: '90%',
    borderRadius: 35,
    backgroundColor: '#007BFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionContent: {
    alignItems: "center",
    padding: 24,
  },
  cameraIcon: {
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 24,
    color: "white",
    fontWeight: "600",
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 40,
  },
  permissionButton: {
    borderRadius: 30,
    overflow: "hidden",
    width: width * 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  permissionButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
  camera: {
    flex: 1,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  previewImage: {
    flex: 1,
  },
  previewControls: {
    paddingVertical: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  previewButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: '#007BFF',
  },
  actionText: {
    color: "white",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: "#ff4444",
  },
  saveButton: {
    backgroundColor: "#ffbb33",
  },
});

export default CameraPage;