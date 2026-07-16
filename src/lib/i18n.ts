export type Lang = "en" | "es" | "fr";

export interface CategoryLabels {
  starters: string;
  mains: string;
  drinks: string;
  desserts: string;
}

export interface Strings {
  tableChip: string;
  webApp: string;
  tagline: string;
  chooseLang: string;
  chooseLangTitle: string;
  openMenu: string;
  scannedNote: string;
  viewInAr: string;
  viewOnTable: string;
  modelActionsUnavailable: string;
  menuModelNote: string;
  menuCategories: string;
  back: string;
  close: string;
  ingredients: string;
  placeDish: string;
  preparing: string;
  detecting: string;
  anchoring: string;
  steadyTip: string;
  fullscreen: string;
  exitFullscreen: string;
  dragHint: string;
  reset: string;
  viewer3d: string;
  viewerHint: string;
  realAr: string;
  realArInstructions: string;
  /** Se muestra mientras sondeamos canActivateAR antes de habilitar el botón nativo. */
  arCheckingSupport: string;
  launchingRealAr: string;
  quickLookFallback: string;
  arLite: string;
  arLiteActivated: string;
  arLiteAim: string;
  cameraStarting: string;
  /** Cámara y modelo listos: el plato se colocará solo en un instante. */
  arLitePlacing: string;
  dishPlaced: string;
  /** Instrucciones de gestos táctiles del modo AR Lite (arrastrar/pellizcar/girar). */
  gestureHint: string;
  markerInitializing: string;
  markerAim: string;
  markerFound: string;
  markerLost: string;
  markerHint: string;
  markerGestureHint: string;
  realSizeLocked: string;
  use3dInstead: string;
  useArLiteInstead: string;
  tableLabel: string;
  arCompatibilityNotice: string;
  arFailedToLite: string;
  cameraNeeded: string;
  cameraDenied: string;
  cameraUnavailable: string;
  cameraBusy: string;
  cameraInsecure: string;
  cameraFailed: string;
  cameraHelp: string;
  cameraHelpSteps: string;
  retryCamera: string;
  openSettings: string;
  cameraFallback3d: string;
  /** CTA que lanza la sesión AR real (Scene Viewer / Quick Look / WebXR). */
  tapToPlace: string;
  /** El dispositivo no puede hacer AR: desktop o webview in-app. */
  arUnsupported: string;
  /** El permiso de cámara está DENEGADO: reintentar no sirve, hay que desbloquearlo. */
  arCameraBlocked: string;
  /** El dispositivo no soporta AR (p. ej. Android sin ARCore). */
  arNoSupport: string;
  /** El AR falló por un motivo que no supimos identificar. No inventamos la causa. */
  arFailed: string;
  /** Abre el diagnóstico real del dispositivo. */
  arWhy: string;
  /** El .glb no se pudo descargar o parsear. */
  modelError: string;
  retry: string;
  modelSoon: string;
  photoSoon: string;
  arNote: string;
  waiterTitle: string;
  waiterSub: string;
  optWaiter: string;
  optBill: string;
  optWater: string;
  waiterConfirm: string;
  cancel: string;
  dishesWord: string;
  cats: CategoryLabels;
}

export const LANGS: { code: string; l: Lang; native: string }[] = [
  { code: "EN", l: "en", native: "English" },
  { code: "ES", l: "es", native: "Español" },
  { code: "FR", l: "fr", native: "Français" },
];

const SUPPORTED_LANGS = LANGS.map((L) => L.l);

/** Reads the browser's preferred languages and matches the first supported one; falls back to "en". */
export function detectBrowserLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const base = candidate.slice(0, 2).toLowerCase();
    const match = SUPPORTED_LANGS.find((l) => l === base);
    if (match) return match;
  }
  return "en";
}

export const STR: Record<Lang, Strings> = {
  en: {
    tableChip: "TABLE 12",
    webApp: "NO APP NEEDED",
    tagline: "See every dish on your table, before you order.",
    chooseLang: "CHOOSE YOUR LANGUAGE",
    chooseLangTitle: "Choose your language",
    openMenu: "Open the menu",
    scannedNote: "Scanned from your table’s QR code",
    viewInAr: "View in AR",
    viewOnTable: "View on my table",
    modelActionsUnavailable: "3D model coming soon",
    menuModelNote: "Table view is available on marked dishes",
    menuCategories: "Menu categories",
    back: "Back",
    close: "Close",
    ingredients: "INGREDIENTS",
    placeDish: "Tries full AR first, with a compatible view if needed",
    preparing: "Loading the 3D dish…",
    detecting: "Point at your table to find a surface…",
    anchoring: "Dish placed — walk around it",
    steadyTip: "Hold your phone steady",
    fullscreen: "View in Fullscreen",
    exitFullscreen: "Tap anywhere to exit fullscreen",
    dragHint: "Drag to rotate · Pinch to zoom",
    reset: "Reset",
    viewer3d: "3D VIEWER",
    viewerHint: "Drag to rotate · Pinch to zoom",
    realAr: "FULL AR",
    realArInstructions: "When native AR opens, move your phone slowly to detect the table, then place the dish.",
    arCheckingSupport: "Checking AR support on this device…",
    launchingRealAr: "Opening native AR…",
    quickLookFallback: "If native AR is not available, a compatible mode opens automatically.",
    arLite: "QR AR",
    arLiteActivated: "Table marker mode activated.",
    arLiteAim: "Point at a clear area of the table.",
    cameraStarting: "Starting the camera…",
    arLitePlacing: "Placing the dish on your table…",
    dishPlaced: "Dish placed · adjust it with your fingers",
    gestureHint: "Drag to move · Pinch to resize · Twist with two fingers to rotate",
    markerInitializing: "Preparing marker tracking…",
    markerAim: "Fit the printed AR reference inside the frame.",
    markerFound: "Table locked · the dish is anchored",
    markerLost: "Reference lost · hold steady while we reacquire it",
    markerHint: "Keep the printed reference flat, visible and free of glare.",
    markerGestureHint: "Locked to the reference · Twist with two fingers to rotate",
    realSizeLocked: "Real size locked",
    use3dInstead: "Use 3D instead",
    useArLiteInstead: "Use QR AR",
    tableLabel: "Table",
    arCompatibilityNotice: "Full AR is not available. We’ll use compatible mode.",
    arFailedToLite: "Full AR could not start. Compatible mode is ready.",
    cameraNeeded: "We need camera access to show the dish on your table.",
    cameraDenied: "Camera access could not be authorized.",
    cameraUnavailable: "No compatible camera is available.",
    cameraBusy: "The camera is being used by another app.",
    cameraInsecure: "Camera access requires a secure HTTPS connection.",
    cameraFailed: "We couldn’t start the camera.",
    cameraHelp: "How to enable camera",
    cameraHelpSteps: "In your browser’s settings for this website, set Camera to Allow, then try again.",
    retryCamera: "Try camera again",
    openSettings: "Open settings",
    cameraFallback3d: "We’ll show the dish in 3D instead.",
    tapToPlace: "Place it on my table",
    arUnsupported: "Open this on your phone to place the dish on your table.",
    arCameraBlocked: "Camera blocked. Tap the 🔒 icon in the address bar → Permissions → Camera → Allow, then reload.",
    arNoSupport: "This device can’t open AR. You can still explore the dish in 3D.",
    arFailed: "AR couldn’t start on this device.",
    arWhy: "Tap to see why",
    modelError: "The 3D dish couldn’t be loaded.",
    retry: "Try again",
    modelSoon: "3D MODEL IN PRODUCTION",
    photoSoon: "PHOTOGRAPHY COMING SOON",
    arNote: "Every dish opens in AR at real size",
    waiterTitle: "How can we help?",
    waiterSub: "A team member will come to table 12",
    optWaiter: "Call a waiter to the table",
    optBill: "Request the bill",
    optWater: "Still or sparkling water",
    waiterConfirm: "A team member is on their way",
    cancel: "Cancel",
    dishesWord: "DISHES",
    cats: { starters: "Starters", mains: "Main Courses", drinks: "Drinks", desserts: "Desserts" },
  },
  es: {
    tableChip: "MESA 12",
    webApp: "SIN APP",
    tagline: "Mira cada plato en tu mesa, antes de pedirlo.",
    chooseLang: "ELIGE TU IDIOMA",
    chooseLangTitle: "Elige tu idioma",
    openMenu: "Abrir el menú",
    scannedNote: "Escaneado desde el código QR de tu mesa",
    viewInAr: "Ver en AR",
    viewOnTable: "Ver en mi mesa",
    modelActionsUnavailable: "Modelo 3D próximamente",
    menuModelNote: "La vista en mesa está disponible en los platos marcados",
    menuCategories: "Categorías del menú",
    back: "Volver",
    close: "Cerrar",
    ingredients: "INGREDIENTES",
    placeDish: "Intenta primero la AR completa y usa una vista compatible si hace falta",
    preparing: "Cargando el plato 3D…",
    detecting: "Apunta a tu mesa para encontrar la superficie…",
    anchoring: "Plato colocado — camina a su alrededor",
    steadyTip: "Mantén el teléfono estable",
    fullscreen: "Ver en pantalla completa",
    exitFullscreen: "Toca para salir de pantalla completa",
    dragHint: "Arrastra para girar · Pellizca para acercar",
    reset: "Restablecer",
    viewer3d: "VISOR 3D",
    viewerHint: "Arrastra para girar · Pellizca para acercar",
    realAr: "AR COMPLETA",
    realArInstructions: "Al abrirse la AR nativa, mueve lentamente el teléfono para detectar la mesa y coloca el plato.",
    arCheckingSupport: "Comprobando la compatibilidad AR de este dispositivo…",
    launchingRealAr: "Abriendo AR nativa…",
    quickLookFallback: "Si la AR nativa no está disponible, se abrirá automáticamente un modo compatible.",
    arLite: "AR CON QR",
    arLiteActivated: "Modo con marcador de mesa activado.",
    arLiteAim: "Apunta a una zona libre de la mesa.",
    cameraStarting: "Iniciando la cámara…",
    arLitePlacing: "Colocando el plato en tu mesa…",
    dishPlaced: "Plato colocado · ajústalo con los dedos",
    gestureHint: "Arrastra para mover · Pellizca para el tamaño · Gira con dos dedos",
    markerInitializing: "Preparando el seguimiento del marcador…",
    markerAim: "Encaja la referencia AR impresa dentro del marco.",
    markerFound: "Mesa fijada · el plato está anclado",
    markerLost: "Referencia perdida · mantén el móvil estable para recuperarla",
    markerHint: "Mantén la referencia impresa plana, visible y sin reflejos.",
    markerGestureHint: "Fijado a la referencia · Gira con dos dedos",
    realSizeLocked: "Tamaño real bloqueado",
    use3dInstead: "Usar visor 3D",
    useArLiteInstead: "Usar AR con QR",
    tableLabel: "Mesa",
    arCompatibilityNotice: "La AR completa no está disponible aquí. Usaremos el modo compatible.",
    arFailedToLite: "No se pudo iniciar el AR completo. El modo compatible está listo.",
    cameraNeeded: "Necesitamos acceso a la cámara para mostrar el plato en tu mesa.",
    cameraDenied: "No fue posible autorizar el acceso a la cámara.",
    cameraUnavailable: "No hay una cámara compatible disponible.",
    cameraBusy: "Otra aplicación está usando la cámara.",
    cameraInsecure: "La cámara requiere una conexión HTTPS segura.",
    cameraFailed: "No pudimos iniciar la cámara.",
    cameraHelp: "Cómo activar la cámara",
    cameraHelpSteps: "En los ajustes de este sitio del navegador, permite la cámara y vuelve a intentarlo.",
    retryCamera: "Reintentar cámara",
    openSettings: "Abrir configuración",
    cameraFallback3d: "Te mostraremos el plato en 3D.",
    tapToPlace: "Colocarlo en mi mesa",
    arUnsupported: "Ábrelo en tu móvil para colocar el plato en tu mesa.",
    arCameraBlocked: "Cámara bloqueada. Toca el icono 🔒 de la barra de direcciones → Permisos → Cámara → Permitir, y recarga.",
    arNoSupport: "Este dispositivo no puede abrir AR. Puedes explorar el plato en 3D.",
    arFailed: "No se pudo iniciar el AR en este dispositivo.",
    arWhy: "Toca para ver por qué",
    modelError: "No se pudo cargar el plato 3D.",
    retry: "Reintentar",
    modelSoon: "MODELO 3D EN PRODUCCIÓN",
    photoSoon: "FOTOGRAFÍA PRÓXIMAMENTE",
    arNote: "Cada plato se abre en AR a tamaño real",
    waiterTitle: "¿Cómo podemos ayudarte?",
    waiterSub: "Un miembro del equipo irá a la mesa 12",
    optWaiter: "Llamar a un mesero a la mesa",
    optBill: "Pedir la cuenta",
    optWater: "Agua con o sin gas",
    waiterConfirm: "Un miembro del equipo va en camino",
    cancel: "Cancelar",
    dishesWord: "PLATOS",
    cats: { starters: "Entradas", mains: "Platos Fuertes", drinks: "Bebidas", desserts: "Postres" },
  },
  fr: {
    tableChip: "TABLE 12",
    webApp: "SANS APPLI",
    tagline: "Voyez chaque plat sur votre table, avant de commander.",
    chooseLang: "CHOISISSEZ VOTRE LANGUE",
    chooseLangTitle: "Choisissez votre langue",
    openMenu: "Ouvrir le menu",
    scannedNote: "Scanné depuis le QR code de votre table",
    viewInAr: "Voir en RA",
    viewOnTable: "Voir sur ma table",
    modelActionsUnavailable: "Modèle 3D bientôt disponible",
    menuModelNote: "La vue sur table est disponible pour les plats indiqués",
    menuCategories: "Catégories du menu",
    back: "Retour",
    close: "Fermer",
    ingredients: "INGRÉDIENTS",
    placeDish: "Essaie d’abord la RA complète, puis une vue compatible si nécessaire",
    preparing: "Chargement du plat 3D…",
    detecting: "Visez votre table pour trouver la surface…",
    anchoring: "Plat placé — tournez autour",
    steadyTip: "Gardez votre téléphone stable",
    fullscreen: "Voir en plein écran",
    exitFullscreen: "Touchez pour quitter le plein écran",
    dragHint: "Glissez pour pivoter · Pincez pour zoomer",
    reset: "Réinitialiser",
    viewer3d: "VISIONNEUSE 3D",
    viewerHint: "Glissez pour pivoter · Pincez pour zoomer",
    realAr: "RA COMPLÈTE",
    realArInstructions: "Quand la RA native s’ouvre, déplacez lentement le téléphone pour détecter la table, puis placez le plat.",
    arCheckingSupport: "Vérification de la compatibilité RA de cet appareil…",
    launchingRealAr: "Ouverture de la RA native…",
    quickLookFallback: "Si la RA native n’est pas disponible, un mode compatible s’ouvre automatiquement.",
    arLite: "RA AVEC QR",
    arLiteActivated: "Mode avec marqueur de table activé.",
    arLiteAim: "Visez une zone libre de la table.",
    cameraStarting: "Démarrage de la caméra…",
    arLitePlacing: "Placement du plat sur votre table…",
    dishPlaced: "Plat placé · ajustez-le avec les doigts",
    gestureHint: "Glissez pour déplacer · Pincez pour la taille · Tournez avec deux doigts",
    markerInitializing: "Préparation du suivi du marqueur…",
    markerAim: "Cadrez la référence RA imprimée dans le repère.",
    markerFound: "Table verrouillée · le plat est ancré",
    markerLost: "Référence perdue · restez stable pour la retrouver",
    markerHint: "Gardez la référence imprimée à plat, visible et sans reflet.",
    markerGestureHint: "Fixé sur la référence · Tournez avec deux doigts",
    realSizeLocked: "Taille réelle verrouillée",
    use3dInstead: "Utiliser la vue 3D",
    useArLiteInstead: "RA avec QR",
    tableLabel: "Table",
    arCompatibilityNotice: "La RA complète n’est pas disponible. Le mode compatible sera utilisé.",
    arFailedToLite: "La RA complète n’a pas démarré. Le mode compatible est prêt.",
    cameraNeeded: "Nous avons besoin de la caméra pour afficher le plat sur votre table.",
    cameraDenied: "L’accès à la caméra n’a pas pu être autorisé.",
    cameraUnavailable: "Aucune caméra compatible n’est disponible.",
    cameraBusy: "La caméra est utilisée par une autre application.",
    cameraInsecure: "La caméra nécessite une connexion HTTPS sécurisée.",
    cameraFailed: "Impossible de démarrer la caméra.",
    cameraHelp: "Comment activer la caméra",
    cameraHelpSteps: "Dans les réglages de ce site du navigateur, autorisez la caméra, puis réessayez.",
    retryCamera: "Réessayer la caméra",
    openSettings: "Ouvrir les réglages",
    cameraFallback3d: "Le plat sera affiché en 3D.",
    tapToPlace: "Le poser sur ma table",
    arUnsupported: "Ouvrez cette page sur votre téléphone pour poser le plat sur votre table.",
    arCameraBlocked: "Caméra bloquée. Touchez l’icône 🔒 dans la barre d’adresse → Autorisations → Caméra → Autoriser, puis rechargez.",
    arNoSupport: "Cet appareil ne peut pas ouvrir la RA. Vous pouvez explorer le plat en 3D.",
    arFailed: "La RA n’a pas pu démarrer sur cet appareil.",
    arWhy: "Touchez pour voir pourquoi",
    modelError: "Le plat 3D n’a pas pu être chargé.",
    retry: "Réessayer",
    modelSoon: "MODÈLE 3D EN PRODUCTION",
    photoSoon: "PHOTOGRAPHIE À VENIR",
    arNote: "Chaque plat s’ouvre en RA à taille réelle",
    waiterTitle: "Comment pouvons-nous aider ?",
    waiterSub: "Un membre de l’équipe viendra à la table 12",
    optWaiter: "Appeler un serveur à la table",
    optBill: "Demander l’addition",
    optWater: "Eau plate ou gazeuse",
    waiterConfirm: "Un membre de l’équipe arrive",
    cancel: "Annuler",
    dishesWord: "PLATS",
    cats: { starters: "Entrées", mains: "Plats", drinks: "Boissons", desserts: "Desserts" },
  },
};

export function stringsForTable(strings: Strings, tableId?: string): Strings {
  if (!tableId) return strings;
  return {
    ...strings,
    tableChip: `${strings.tableLabel.toUpperCase()} ${tableId}`,
    waiterSub: strings.waiterSub.replace("12", tableId),
  };
}
