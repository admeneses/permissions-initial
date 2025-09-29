# Permissions React Native (Expo) – FIAP

Aplicativo de demonstração para aulas de React Native com Expo, cobrindo permissões e recursos comuns:

- Câmera
- Toast
- ActionSheet
- Calendário
- Mapa (com localização)
- Biometria (Face ID / Touch ID)
- Contatos

## Stack

- Expo SDK 54
- React Navigation (Stack)
- react-native-gesture-handler, react-native-screens, react-native-safe-area-context
- expo-camera, expo-image-picker, expo-location, react-native-maps
- @expo/react-native-action-sheet, react-native-toast-message
- react-native-calendars, expo-local-authentication, expo-contacts

## Permissões

As mensagens e permissões necessárias já estão configuradas em `app.json`.

- iOS (infoPlist):
  - NSCameraUsageDescription
  - NSLocationWhenInUseUsageDescription
  - NSPhotoLibraryUsageDescription
  - NSPhotoLibraryAddUsageDescription
  - NSFaceIDUsageDescription
  - NSContactsUsageDescription

- Android (permissions):
  - CAMERA
  - ACCESS_COARSE_LOCATION, ACCESS_FINE_LOCATION
  - USE_BIOMETRIC
  - READ_CONTACTS

## Estrutura (principal)

```
permissions-react-native/
├── App.tsx                     # Navegação, telas e providers (ActionSheet, Toast)
├── app.json                    # Config de permissões e assets
├── src/
│   └── theme/
│       └── colors.ts           # Cores FIAP centralizadas
└── package.json                # Scripts e engines (Node 22+)
```

## Telas e funcionalidades

- Home: navegação para todos os demos
- Câmera: solicita permissão, abre preview e captura foto (botão de shutter)
- Toast: demonstra toasts de sucesso, erro e informativo
- ActionSheet: ações para “Tirar foto” (câmera) e “Escolher da galeria” (image picker), com preview
- Calendário: seleção de datas e tema FIAP usando `react-native-calendars`
- Mapa: solicita localização, centraliza no usuário e aplica estilo customizado
- Biometria: verifica suporte/enrolamento e autentica via `expo-local-authentication`
- Contatos: solicita permissão, lista contatos (nome, telefone, email)

## Como rodar

Pré-requisitos: Node 22+, npm e Expo CLI (via npx).

```bash
# Instalar dependências
npm install

# Iniciar o projeto
npm start
```

- Use os atalhos do Expo para abrir no Android, iOS ou Web.
- Se atualizar de Node anterior, recomenda-se limpar cache:

```bash
npm start -- --clear
```

## Dicas de teste

- Câmera/Imagem: teste em dispositivo ou simulador/emulador com câmera/imagens disponíveis
- Mapa/Localização: permita acesso à localização quando solicitado
- Biometria: requer dispositivo com Face ID/Touch ID configurado
- Contatos: permita acesso para listar contatos; em emuladores, você pode precisar adicionar contatos manualmente

## Licença

Projeto de uso educacional.
