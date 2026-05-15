import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from "react-native";
import { Button } from "@/components/Button";
import { store } from '@/database/tinybase';


export function DatasetBackup() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Configurações de Backup de Conjunto de Dados</Text>
      <Button onPress={() => {
        store.delTables();
        console.log(store.getTables());
      }}>
        <Button.Title>delete dataset</Button.Title>
      </Button>
    </View>
  );
}