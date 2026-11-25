import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from "@/services/supabase";

const BUCKET = 'book';

export function BookPagesUpload() {
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef<any>(null);
  
  // Alterado para string para facilitar a digitação fluida no TextInput, convertendo para número na hora do uso
  const [pageNumber, setPageNumber] = useState<string>('1');

  // Se as permissões ainda não foram carregadas
  if (!permission) {
    return <View style={styles.centerContainer} />;
  }

  // Se a permissão não foi concedida, solicita ao usuário
  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.message}>Precisamos de acesso à câmera para tirar a foto do produto.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Função para alternar a câmera (frontal/traseira)
  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  // Funções para manipular o número da página rapidamente
  function decrementPage() {
    const current = parseInt(pageNumber, 10) || 0;
    if (current > 1) {
      setPageNumber(String(current - 1));
    }
  }

  function incrementPage() {
    const current = parseInt(pageNumber, 10) || 0;
    setPageNumber(String(current + 1));
  }

  // Função para tirar a foto e fazer o upload para o Supabase
  async function takePictureAndUpload() {
    if (!cameraRef.current) return;

    try {
      if (!supabase) {
        throw new Error('Supabase is not configured. Check the Supabase environment variables.');
      }

      setUploading(true);

      const pageNumVal = pageNumber || '1';

      // 1. Tira a foto usando a expo-camera
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });

      if (!photo?.uri) {
        throw new Error('Falha ao capturar a imagem.');
      }

      // 2. Prepara o arquivo para o formato que o Supabase aceita (ArrayBuffer)
      const response = await fetch(photo.uri);
      const arrayBuffer = await response.arrayBuffer();

      // Gera o caminho utilizando o número da página dinamicamente
      const autoSlug = `arabic`;
      const path = `${autoSlug}/page-${pageNumVal}.jpg`;

      // 3. Faz o upload para o Supabase Storage
      const { error } = await supabase.storage.from(BUCKET).upload(path, arrayBuffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/jpeg',
      });

      if (error) throw error;

      // 4. Pega a URL pública gerada
      const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const publicUrl = publicUrlData.publicUrl;

      Alert.alert('Sucesso!', `Página ${pageNumVal} enviada com sucesso!\nURL: ${publicUrl}`);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro no Upload', error.message || 'Ocorreu um erro ao enviar a imagem.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Câmera em Tela Cheia absoluta */}
      <CameraView style={styles.fullscreenCamera} facing={facing} ref={cameraRef}>
        
        {/* Camada de Interface Superior e Inferior */}
        <View style={styles.overlay}>
          
          {/* Seletor de Número da Página Reconstruído (Topo) */}
          <View style={styles.pageNumberContainer}>
            <Text style={styles.pageLabel}>Página</Text>
            <View style={styles.pageSelectorRow}>
              <TouchableOpacity style={styles.pageControlButton} onPress={decrementPage}>
                <Text style={styles.pageControlText}>-</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.pageInput}
                onChangeText={setPageNumber}
                value={pageNumber}
                keyboardType="numeric"
                maxLength={4}
                placeholder="1"
                placeholderTextColor="#aaa"
              />

              <TouchableOpacity style={styles.pageControlButton} onPress={incrementPage}>
                <Text style={styles.pageControlText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Área Inferior: Carregamento ou Botões de Ação */}
          {uploading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.loadingText}>Enviando para o Supabase...</Text>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
                <Text style={styles.text}>Virar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.captureButton} onPress={takePictureAndUpload}>
                <View style={styles.captureInner} />
              </TouchableOpacity>
              
              {/* Espaçador invisível para centralizar perfeitamente o botão de captura */}
              <View style={{ width: 50 }} />
            </View>
          )}

        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
    color: '#fff',
  },
  fullscreenCamera: {
    ...StyleSheet.absoluteFillObject, // Força a ocupar 100% da tela inteira
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)', // Leve escurecimento para destacar os elementos por cima da câmera
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  pageNumberContainer: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pageLabel: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  pageSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageControlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageControlText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pageInput: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 45,
    marginHorizontal: 10,
    paddingVertical: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  flipButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  text: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});