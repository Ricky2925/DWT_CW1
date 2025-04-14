// components/IndexPage.tsx
import React, { useState } from "react";
import { Linking } from 'react-native';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { setSession } from "../store/locationSlice";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../App";
import * as SMS from "expo-sms";

const { width, height } = Dimensions.get("window");

type Props = StackScreenProps<RootStackParamList, "Index">;

const IndexPage: React.FC<Props> = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [typeSelectVisible, setTypeSelectVisible] = useState(false);
  const [sendType, setSendType] = useState<string>("HTTP");
  const [session, setSessionState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const requestSmsPermission = async () => {
    try {
      if (Platform.OS === "android") {
      
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.SEND_SMS,
          {
            title: "SMS Permission Required",
            message: "Need SMS permission to send location updates",
            buttonPositive: "Allow",
            buttonNegative: "Deny"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED; 
      } else {
        
        const isAvailable = await SMS.isAvailableAsync();
        return isAvailable; 
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };
  
  const generateSessionId = () => {
    return new Date().toISOString().replace(/[-:T.Z]/g, "").slice(2, 14);
  };

  const handleRecord = async () => {
    try {
      setLoading(true);
      const newSession = generateSessionId();
      setSessionState(newSession);
      setModalVisible(true);
    } catch (error) {
      Alert.alert("Error", "Failed to create new session");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (session) {
      dispatch(setSession(session));
      setModalVisible(false);
      navigation.navigate("Loading");
    }
  };

  const copyToClipboard = async () => {
    if (session) {
      await Clipboard.setStringAsync(`http://82.156.194.242:3690/view/${session}`);
      Alert.alert("📋 Link Copied");
    }
  };

  const toggleSendType = (type: string) => {
    setSendType(type); 
    setTypeSelectVisible(false); 
  };
  

  if (loading) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/homeBG.png")}
      style={styles.background}
      
      resizeMode="cover"
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.4)", "rgba(245,245,245,0.45)"]}
        style={styles.gradientOverlay}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <MaterialIcons name="travel-explore" size={44} color="#2c3e50" />
            <Text style={styles.title}>Safe Travel</Text>
            <Text style={styles.subtitle}>Smart Journey Tracking System</Text>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.mainButton}
              onPress={handleRecord}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#4A90E2", "#007BFF"]}
                style={styles.buttonGradient}
              >
                <MaterialIcons name="play-circle-filled" size={28} color="white" />
                <Text style={styles.buttonText}>Start New Trip</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mainButton, styles.modeButton]}
              onPress={() => setTypeSelectVisible(true)}
            >
              <LinearGradient
                colors={["#FFB75E", "#ED8F03"]}
                style={styles.buttonGradient}
              >
                <MaterialIcons name="settings" size={24} color="white" />
                <Text style={styles.buttonText}>Mode: {sendType}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.featureList}>
            {[
              { icon: "gps-fixed", text: "Real-time Tracking" },
              { icon: "camera-alt", text: "Photo Logging" },
              { icon: "sms", text: "Emergency SMS" },
            ].map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <MaterialIcons 
                  name={feature.icon as any} 
                  size={36} 
                  color="#007BFF" 
                />
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>

          <Modal
            animationType="fade"
            transparent
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <MaterialIcons name="link" size={36} color="#007BFF" />
                <Text style={styles.modalTitle}>Session Created</Text>

                <View style={styles.sessionBox}>
                  <Text style={styles.sessionLabel}>Session ID:</Text>
                  <Text style={styles.sessionCode}>{session}</Text>
                </View>

                <Text style={styles.shareHint}>Share this tracking link:</Text>
                <Text style={styles.urlText}>
                  http://82.156.194.242:3690/view/{session}
                </Text>

                <View style={styles.actionGroup}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.copyButton]}
                    onPress={copyToClipboard}
                  >
                    <MaterialIcons name="content-copy" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Copy Link</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.startButton]}
                    onPress={handleConfirm}
                  >
                    <MaterialIcons name="directions-walk" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Start Tracking</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            animationType="slide"
            transparent
            visible={typeSelectVisible}
            onRequestClose={() => setTypeSelectVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modeSelectCard}>
                <MaterialIcons
                  name="settings-remote"
                  size={40}
                  color="#007BFF"
                  style={styles.modalIcon}
                />
                <Text style={styles.modalTitle}>Select Transfer Mode</Text>

                <TouchableOpacity
                  style={[styles.modeOption, styles.httpOption]}
                  onPress={() => toggleSendType("HTTP")}
                >
                  <LinearGradient
                    colors={["#4A90E2", "#007BFF"]}
                    style={styles.modeGradient}
                  >
                    <MaterialIcons name="public" size={24} color="white" />
                    <Text style={styles.modeText}>HTTP Transfer</Text>
                  </LinearGradient>
                </TouchableOpacity>


                <TouchableOpacity
                  style={[styles.modeOption, styles.smsOption]}
                  onPress={async () => {
                    const TIMEOUT = 2000; 
                    const timeoutPromise = new Promise<boolean>((_, reject) =>
                      setTimeout(() => reject("Timeout: Permission request took too long"), TIMEOUT)
                    );

           
                    const checkPermission = await SMS.isAvailableAsync();
                    if (!checkPermission) {
                      Alert.alert(
                        "Permission Required",
                        "SMS permission is needed to use this feature. Please enable it manually in settings.",
                        [
                          {
                            text: "Open Settings",
                            onPress: () => Linking.openSettings(),
                          },
                          {
                            text: "Retry",
                            onPress: async () => {
                              try {
                             
                                const granted = await Promise.race([requestSmsPermission(), timeoutPromise]);
                                if (granted) {
                                  setSendType("SMS");
                                  setTypeSelectVisible(false);
                                } else {
                                  Alert.alert("Permission Required", "SMS permission needed for this feature");
                                }
                              } catch (error) {
                                if (error === "Timeout: Permission request took too long") {
                                  Alert.alert("Permission Timeout", "The permission request took too long. Automatically switching to SMS mode.");
                                  setSendType("SMS");
                                  setTypeSelectVisible(false); 
                                } else {
                                  Alert.alert("Error", error.message || "An error occurred while requesting SMS permission.");
                                }
                              }
                            }
                          }
                        ]
                      );
                    } else {

                      setSendType("SMS");
                      setTypeSelectVisible(false);
                    }
                  }}
                >
                  <LinearGradient
                    colors={["#27ae60", "#2ecc71"]}
                    style={styles.modeGradient}
                  >
                    <MaterialIcons name="sms" size={24} color="white" />
                    <Text style={styles.modeText}>SMS Transfer</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setTypeSelectVisible(false)}
                >
                  <Text style={styles.cancelText}>Close Menu</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
    padding: 24, 
    justifyContent: "space-between" 
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  header: { 
    alignItems: "center", 
    marginTop: height * 0.1 
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#2c3e50",
    marginTop: 12,
  },
  subtitle: { 
    fontSize: 16, 
    color: "#7f8c8d", 
    marginTop: 6 
  },
  buttonGroup: {
    marginVertical: 20,
  },
  mainButton: {
    width: width * 0.8,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    alignSelf: "center",
    marginVertical: 10,
  },
  modeButton: {
    backgroundColor: '#FFB75E',
  },
  buttonGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
  featureList: { 
    marginBottom: height * 0.1 
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureText: { 
    fontSize: 16, 
    color: "#2c3e50", 
    marginLeft: 16, 
    fontWeight: "500" 
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCard: {
    width: width * 0.85,
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2c3e50",
    marginVertical: 16,
  },
  sessionBox: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 16,
  },
  sessionLabel: { 
    color: "#7f8c8d", 
    fontSize: 14 
  },
  sessionCode: { 
    color: "#2c3e50", 
    fontSize: 18, 
    fontWeight: "600" 
  },
  shareHint: { 
    color: "#7f8c8d", 
    fontSize: 14, 
    alignSelf: "flex-start", 
    marginBottom: 8 
  },
  urlText: { 
    color: "#4A90E2", 
    fontSize: 14, 
    marginBottom: 24 
  },
  actionGroup: { 
    width: "100%" 
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 10,
    marginVertical: 8,
    elevation: 2,
  },
  copyButton: { 
    backgroundColor: "#FFB75E" 
  },
  startButton: { 
    backgroundColor: "#27ae60" 
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  closeButton: {
    marginTop: 12,
    padding: 10,
  },
  closeButtonText: {
    color: "#95a5a6",
    fontWeight: "500",
  },
  modeSelectCard: {
    width: width * 0.8,
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  modalIcon: {
    marginBottom: 16,
  },
  modeOption: {
    width: "100%",
    height: 60,
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 8,
  },
  modeGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  httpOption: {
    borderWidth: 1,
    borderColor: "#007BFF",
  },
  smsOption: {
    borderWidth: 1,
    borderColor: "#2ecc71",
  },
  modeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  cancelButton: {
    marginTop: 16,
    padding: 12,
  },
  cancelText: {
    color: "#95a5a6",
    fontWeight: "500",
  },
});

export default IndexPage;
