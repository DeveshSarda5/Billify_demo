import React, { useRef, useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { auth, firebaseConfig } from "../config/firebase";
import {
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import Constants from "expo-constants";

export default function PhoneAuthScreen() {
  const recaptchaVerifier = useRef<any>(null);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const sendVerification = async () => {
    if (!phoneNumber) {
      Alert.alert("Enter phone number with country code");
      return;
    }

    try {
      setLoading(true);

      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier.current
      );

      setVerificationId(confirmation.verificationId);
      Alert.alert("OTP Sent Successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmCode = async () => {
    if (!verificationId) return;

    try {
      setLoading(true);

      const credential = PhoneAuthProvider.credential(
        verificationId,
        code
      );

      await signInWithCredential(auth, credential);

      Alert.alert("Phone Verified Successfully 🎉");
    } catch (error: any) {
      Alert.alert("Invalid Code");
    } finally {
      setLoading(false);
    }
  };

return (
  <View style={{ padding: 20, flex: 1, justifyContent: "center" }}>
    <FirebaseRecaptchaVerifierModal
  ref={recaptchaVerifier}
  firebaseConfig={firebaseConfig}
/>

      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Phone Authentication
      </Text>

      <TextInput
        placeholder="+91XXXXXXXXXX"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        style={{
          borderWidth: 1,
          padding: 12,
          borderRadius: 8,
          marginBottom: 15,
        }}
      />

      <Button
        title={loading ? "Sending..." : "Send OTP"}
        onPress={sendVerification}
        disabled={loading}
      />

      {verificationId && (
        <>
          <TextInput
            placeholder="Enter OTP"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            style={{
              borderWidth: 1,
              padding: 12,
              borderRadius: 8,
              marginVertical: 15,
            }}
          />

          <Button
            title={loading ? "Verifying..." : "Confirm OTP"}
            onPress={confirmCode}
            disabled={loading}
          />
        </>
      )}
    </View>
  );
}