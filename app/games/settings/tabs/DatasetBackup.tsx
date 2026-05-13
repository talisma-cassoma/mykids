import React, { useMemo, useRef, useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Pressable,
    StyleSheet,
} from "react-native";

export function DatasetBackup() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Configurações de Backup de Conjunto de Dados</Text>
    </View>
  );
}