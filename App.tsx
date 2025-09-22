import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, Theme, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, BackHandler, Platform } from 'react-native';
import { ActionSheetProvider, useActionSheet } from '@expo/react-native-action-sheet';
import Toast from 'react-native-toast-message';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { CalendarList } from 'react-native-calendars';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Contacts from 'expo-contacts';
import { useEffect, useRef, useState } from 'react';
import { FIAP_PINK, FIAP_BG, FIAP_TEXT } from './src/theme/colors';

type RootStackParamList = {
  Home: {};
  CameraDemo: {};
  ToastDemo: {};
  ActionSheetDemo: {};
  CalendarDemo: {};
  MapDemo: {};
  BiometricsDemo: {};
  ContactsDemo: {};
};

const Stack = createStackNavigator<RootStackParamList>();

// Cores FIAP importadas do arquivo centralizado em src/theme/colors.ts

const AppTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: FIAP_PINK,
    background: '#ffffff',
    card: FIAP_PINK,
    text: '#ffffff',
    border: '#f5c1d1',
    notification: FIAP_PINK,
  },
};

// Tela inicial com navegação para todos os demos de permissões e recursos
function HomeScreen({ navigation }: any) {
  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>FIAP Permissions Lab</Text>
        <Text style={styles.subtitle}>Testando diferentes Permissões abaixo:</Text>
      </View>
      <View style={styles.grid}>
        <DemoButton label="Câmera" onPress={() => navigation.navigate('CameraDemo')} />
        <DemoButton label="Toast" onPress={() => navigation.navigate('ToastDemo')} />
        <DemoButton label="ActionSheet" onPress={() => navigation.navigate('ActionSheetDemo')} />
        <DemoButton label="Calendário" onPress={() => navigation.navigate('CalendarDemo')} />
        <DemoButton label="Mapa" onPress={() => navigation.navigate('MapDemo')} />
        <DemoButton label="Biometria" onPress={() => navigation.navigate('BiometricsDemo')} />
        <DemoButton label="Contatos" onPress={() => navigation.navigate('ContactsDemo')} />
      </View>
    </ScrollView>
  );
}

function DemoButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.cardText}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function App() {
  const navRef = useNavigationContainerRef<RootStackParamList>();
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (navRef.canGoBack()) {
        navRef.goBack();
        return true; // handled
      }
      return false; // let Android handle (exit app)
    });
    return () => sub.remove();
  }, [navRef]);

  return (
    <SafeAreaProvider>
      <ActionSheetProvider>
        <>
          <NavigationContainer ref={navRef} theme={AppTheme}>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerStyle: { backgroundColor: FIAP_PINK },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: '700' },
                headerBackTitle: 'Voltar',
              }}
            >
              <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'FIAP Permissions' }} />
              <Stack.Screen name="CameraDemo" component={CameraDemoScreen} options={{ title: 'Câmera' }} />
              <Stack.Screen name="ToastDemo" component={ToastDemoScreen} options={{ title: 'Toast' }} />
              <Stack.Screen name="ActionSheetDemo" component={ActionSheetDemoScreen} options={{ title: 'ActionSheet' }} />
              <Stack.Screen name="CalendarDemo" component={CalendarDemoScreen} options={{ title: 'Calendário' }} />
              <Stack.Screen name="MapDemo" component={MapDemoScreen} options={{ title: 'Mapa' }} />
              <Stack.Screen name="BiometricsDemo" component={BiometricsDemoScreen} options={{ title: 'Biometria' }} />
              <Stack.Screen name="ContactsDemo" component={ContactsDemoScreen} options={{ title: 'Contatos' }} />
            </Stack.Navigator>
            <StatusBar style="light" />
          </NavigationContainer>
          <Toast />
        </>
      </ActionSheetProvider>
    </SafeAreaProvider>
  );
}

// Tela de demonstração de Toasts (sucesso/erro/info)
function ToastDemoScreen() {
  return (
    <View style={styles.centerBox}>
      {Platform.OS !== 'ios' && (
        <>
          <DemoButton
            label="Mostrar sucesso"
            onPress={() => Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Operação concluída' })}
          />
          <View style={{ height: 12 }} />
          <DemoButton
            label="Mostrar erro"
            onPress={() => Toast.show({ type: 'error', text1: 'Erro', text2: 'Algo deu errado' })}
          />
          <View style={{ height: 12 }} />
          <DemoButton
            label="Mostrar info"
            onPress={() => Toast.show({ type: 'info', text1: 'Info', text2: 'Mensagem informativa' })}
          />
        </>
      )}
      {Platform.OS === 'ios' && (
        <Text style={{ color: FIAP_TEXT, textAlign: 'center' }}>
          Toast não disponível no iOS
        </Text>
      )}
    </View>
  );
}

// Tela de demonstração do ActionSheet com opções: tirar foto e abrir galeria
function ActionSheetDemoScreen() {
  const { showActionSheetWithOptions } = useActionSheet();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const onOpen = () => {
    const options = ['Tirar foto', 'Escolher da galeria', 'Cancelar'];
    const cancelButtonIndex = 2;
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex: undefined,
        title: 'Ação',
        tintColor: FIAP_PINK,
      },
      (selectedIndex?: number) => {
        if (selectedIndex === 0) {
          (async () => {
            const camPerm = await ImagePicker.requestCameraPermissionsAsync();
            if (camPerm.status !== 'granted') {
              Toast.show({ type: 'error', text1: 'Permissão negada' });
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              quality: 0.8,
              allowsEditing: true,
              aspect: [4, 3],
            });
            if (!result.canceled) {
              const uri = result.assets?.[0]?.uri;
              if (uri) setImageUri(uri);
              Toast.show({ type: 'success', text1: 'Foto capturada' });
            }
          })();
        }
        if (selectedIndex === 1) {
          (async () => {
            const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (libPerm.status !== 'granted') {
              Toast.show({ type: 'error', text1: 'Permissão negada' });
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              quality: 0.8,
              allowsEditing: true,
              aspect: [4, 3],
              mediaTypes: ['images'],
            });
            if (!result.canceled) {
              const uri = result.assets?.[0]?.uri;
              if (uri) setImageUri(uri);
              Toast.show({ type: 'success', text1: 'Imagem selecionada' });
            }
          })();
        }
      }
    );
  };
  return (
    <View style={styles.centerBox}>
      <DemoButton label="Abrir ActionSheet" onPress={onOpen} />
      {imageUri && (
        <>
          <View style={{ height: 16 }} />
          <Image source={{ uri: imageUri }} style={{ width: 280, height: 210, borderRadius: 12 }} />
        </>
      )}
    </View>
  );
}

// Tela de demonstração de calendário, com seleção de dia e tema FIAP
function CalendarDemoScreen() {
  const [selected, setSelected] = useState<string | undefined>(undefined);
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <CalendarList
        pastScrollRange={12}
        futureScrollRange={12}
        onDayPress={(day) => setSelected(day.dateString)}
        markedDates={selected ? { [selected]: { selected: true, selectedColor: FIAP_PINK } } : {}}
        theme={{
          selectedDayBackgroundColor: FIAP_PINK,
          todayTextColor: FIAP_PINK,
          arrowColor: FIAP_PINK,
        }}
      />
    </View>
  );
}

// Tela de demonstração de mapa com permissão de localização e estilo customizado
function MapDemoScreen() {
  const [region, setRegion] = useState({
    latitude: -23.560638,
    longitude: -46.652045,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={setRegion}
        customMapStyle={googleMapStyleFiap}
      >
        <Marker coordinate={{ latitude: -23.560638, longitude: -46.652045 }} title="Local" />
      </MapView>
    </View>
  );
}

const googleMapStyleFiap = [
  { elementType: 'geometry', stylers: [{ color: '#fbe7ef' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#4a4a4a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#6b6b6b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#f2b8c6' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#f7d2df' }] },
];

// Tela de demonstração de biometria (Face ID / Touch ID)
function BiometricsDemoScreen() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [result, setResult] = useState<string>('');
  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setSupported(compatible && enrolled);
    })();
  }, []);
  const authenticate = async () => {
    try {
      const resp = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autenticar',
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar código',
      });
      setResult(resp.success ? 'Autenticado com sucesso' : 'Falha/Cancelado');
      Toast.show({ type: resp.success ? 'success' : 'error', text1: resp.success ? 'Autenticado' : 'Não autenticado' });
    } catch (e) {
      setResult('Erro');
      Toast.show({ type: 'error', text1: 'Erro na biometria' });
    }
  };
  return (
    <View style={styles.centerBox}>
      <Text style={{ color: FIAP_TEXT, marginBottom: 12 }}>
        {supported === null ? 'Verificando suporte...' : supported ? 'Biometria disponível' : 'Biometria indisponível'}
      </Text>
      <DemoButton label="Autenticar" onPress={authenticate} />
      {!!result && (
        <>
          <View style={{ height: 12 }} />
          <Text style={{ color: FIAP_TEXT }}>{result}</Text>
        </>
      )}
    </View>
  );
}

// Tela de demonstração de contatos: pede permissão e lista contatos (nome, telefone, email)
function ContactsDemoScreen() {
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [status, setStatus] = useState<string>('');
  const loadContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      setStatus('Permissão negada');
      Toast.show({ type: 'error', text1: 'Permissão negada' });
      return;
    }
    const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails] });
    setContacts(data.slice(0, 30));
    setStatus(`Carregados ${data.length} contatos`);
  };
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.title}>Contatos</Text>
        <Text style={styles.subtitle}>{status || 'Toque para carregar'}</Text>
      </View>
      <DemoButton label="Carregar contatos" onPress={loadContacts} />
      <View style={{ height: 12 }} />
      {contacts.map((c, i) => (
        <View key={i} style={[styles.card, { alignItems: 'flex-start', minWidth: '100%' }]}> 
          <Text style={styles.cardText}>{c.name || 'Sem nome'}</Text>
          {c.phoneNumbers?.[0]?.number && (
            <Text style={{ color: '#6b6b6b', marginTop: 4 }}>{c.phoneNumbers[0].number}</Text>
          )}
          {c.emails?.[0]?.email && (
            <Text style={{ color: '#6b6b6b', marginTop: 4 }}>{c.emails[0].email}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

// Tela de demonstração de câmera: pede permissão, abre preview e tira foto
function CameraDemoScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return <View style={styles.placeholder} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerBox}>
        <Text style={{ color: FIAP_TEXT, marginBottom: 12 }}>Precisamos da permissão da câmera.</Text>
        <DemoButton label="Conceder permissão" onPress={() => requestPermission()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {photoUri ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Image source={{ uri: photoUri }} style={{ width: '90%', height: '70%', borderRadius: 12 }} />
          <View style={{ height: 16 }} />
          <DemoButton label="Tirar outra" onPress={() => setPhotoUri(null)} />
        </View>
      ) : (
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing="back"
          onCameraReady={() => setIsReady(true)}
        />
      )}
      {!photoUri && (
        <View style={styles.cameraFooter}>
          <TouchableOpacity
            style={styles.shutter}
            onPress={async () => {
              try {
                // @ts-ignore
                const result = await cameraRef.current?.takePictureAsync?.({ quality: 0.8, skipProcessing: true });
                if (result?.uri) {
                  setPhotoUri(result.uri);
                  Toast.show({ type: 'success', text1: 'Foto capturada!' });
                }
              } catch (e) {
                Toast.show({ type: 'error', text1: 'Falha ao capturar' });
              }
            }}
            disabled={!isReady}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 24,
    backgroundColor: FIAP_BG,
    flexGrow: 1,
  },
  header: {
    marginBottom: 16,
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: FIAP_PINK,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b6b6b',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 18,
    minWidth: '47%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f7c7d5',
  },
  cardText: {
    color: FIAP_TEXT,
    fontWeight: '700',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  cameraFooter: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ffffff',
    borderWidth: 6,
    borderColor: FIAP_PINK,
  },
});
