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
import { useData } from "@/context/DataContext";

export function DatasetBackup() {

  const {init}= useData();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Configurações de Backup de Conjunto de Dados</Text>
      <Button onPress={() => {
        store.delTables();
        console.log(store.getTables());
        init();
      }}>
        <Button.Title>reset dataset</Button.Title>
      </Button>
    </View>
  );
}