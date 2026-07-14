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
  viewIn3d: string;
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
  realArReady: string;
  realArInstructions: string;
  launchRealAr: string;
  launchingRealAr: string;
  useArLite: string;
  quickLookFallback: string;
  arLite: string;
  arLiteActivated: string;
  arLiteAim: string;
  cameraStarting: string;
  placeHere: string;
  dishPlaced: string;
  rotateDish: string;
  rotateLeft: string;
  rotateRight: string;
  resizeDish: string;
  moveDish: string;
  smaller: string;
  larger: string;
  moveLeft: string;
  moveRight: string;
  moveUp: string;
  moveDown: string;
  use3dInstead: string;
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
    viewIn3d: "View in 3D",
    viewOnTable: "View on my table",
    modelActionsUnavailable: "3D model coming soon",
    menuModelNote: "3D and table view are available on marked dishes",
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
    realArReady: "Your dish is ready for full AR",
    realArInstructions: "When native AR opens, move your phone slowly to detect the table, then place the dish.",
    launchRealAr: "Start full AR",
    launchingRealAr: "Preparing native AR…",
    useArLite: "Use AR Lite",
    quickLookFallback: "If native AR does not open, use the compatible mode.",
    arLite: "AR LITE",
    arLiteActivated: "Compatible mode activated.",
    arLiteAim: "Point at a clear area of the table.",
    cameraStarting: "Starting the camera…",
    placeHere: "Place dish here",
    dishPlaced: "Dish placed · use the controls to adjust it",
    rotateDish: "Rotate",
    rotateLeft: "Rotate dish left",
    rotateRight: "Rotate dish right",
    resizeDish: "Size",
    moveDish: "Position",
    smaller: "Make dish smaller",
    larger: "Make dish larger",
    moveLeft: "Move dish left",
    moveRight: "Move dish right",
    moveUp: "Move dish up",
    moveDown: "Move dish down",
    use3dInstead: "Use 3D viewer",
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
    viewIn3d: "Ver en 3D",
    viewOnTable: "Ver en mi mesa",
    modelActionsUnavailable: "Modelo 3D próximamente",
    menuModelNote: "Las vistas 3D y en mesa están disponibles en los platos marcados",
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
    realArReady: "Tu plato está listo para AR completa",
    realArInstructions: "Al abrirse la AR nativa, mueve lentamente el teléfono para detectar la mesa y coloca el plato.",
    launchRealAr: "Iniciar AR completa",
    launchingRealAr: "Preparando AR nativa…",
    useArLite: "Usar AR Lite",
    quickLookFallback: "Si el AR nativo no se abre, usa el modo compatible.",
    arLite: "AR LITE",
    arLiteActivated: "Modo compatible activado.",
    arLiteAim: "Apunta a una zona libre de la mesa.",
    cameraStarting: "Iniciando la cámara…",
    placeHere: "Colocar plato aquí",
    dishPlaced: "Plato colocado · usa los controles para ajustarlo",
    rotateDish: "Rotación",
    rotateLeft: "Girar el plato a la izquierda",
    rotateRight: "Girar el plato a la derecha",
    resizeDish: "Tamaño",
    moveDish: "Posición",
    smaller: "Reducir el plato",
    larger: "Aumentar el plato",
    moveLeft: "Mover el plato a la izquierda",
    moveRight: "Mover el plato a la derecha",
    moveUp: "Mover el plato hacia arriba",
    moveDown: "Mover el plato hacia abajo",
    use3dInstead: "Usar visor 3D",
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
    viewIn3d: "Voir en 3D",
    viewOnTable: "Voir sur ma table",
    modelActionsUnavailable: "Modèle 3D bientôt disponible",
    menuModelNote: "La vue 3D et sur table est disponible pour les plats indiqués",
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
    realArReady: "Votre plat est prêt pour la RA complète",
    realArInstructions: "Quand la RA native s’ouvre, déplacez lentement le téléphone pour détecter la table, puis placez le plat.",
    launchRealAr: "Lancer la RA complète",
    launchingRealAr: "Préparation de la RA native…",
    useArLite: "Utiliser RA Lite",
    quickLookFallback: "Si la RA native ne s’ouvre pas, utilisez le mode compatible.",
    arLite: "RA LITE",
    arLiteActivated: "Mode compatible activé.",
    arLiteAim: "Visez une zone libre de la table.",
    cameraStarting: "Démarrage de la caméra…",
    placeHere: "Placer le plat ici",
    dishPlaced: "Plat placé · utilisez les commandes pour l’ajuster",
    rotateDish: "Rotation",
    rotateLeft: "Pivoter le plat vers la gauche",
    rotateRight: "Pivoter le plat vers la droite",
    resizeDish: "Taille",
    moveDish: "Position",
    smaller: "Réduire le plat",
    larger: "Agrandir le plat",
    moveLeft: "Déplacer le plat à gauche",
    moveRight: "Déplacer le plat à droite",
    moveUp: "Déplacer le plat vers le haut",
    moveDown: "Déplacer le plat vers le bas",
    use3dInstead: "Utiliser la visionneuse 3D",
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
