import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";

/**
 * DEPRECATED: PhoneAuthScreen
 * Phone authentication has been removed from the app.
 * All authentication is now handled via email/password through the backend API.
 */
export default function PhoneAuthScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = () => {
    Alert.alert(
      "Feature Removed",
      "Phone authentication is no longer available. Please use email/password login instead."
    );
  };

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: "center" }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Phone Authentication (Deprecated)
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
        editable={false}
      />

      <Button
        title="This feature is no longer available"
        onPress={handleSubmit}
      />

      <Text style={{ marginTop: 20, textAlign: "center", color: "#666" }}>
        Please use email/password login in the Login screen.
      </Text>
    </View>
  );
}