import { initializeApp, setLogLevel } from "firebase/app";
import {
    initializeFirestore,
    persistentLocalCache,
    getFirestore
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyClXDRsBpfEFdkXcADW_7Vwp_kBjFzjfAA",
    authDomain: "peguemonte-581c0.firebaseapp.com",
    projectId: "peguemonte-581c0",
    storageBucket: "peguemonte-581c0.firebasestorage.app",
    messagingSenderId: "343098404202",
    appId: "1:343098404202:web:92631d91e7a479d9564913",
    measurementId: "G-6RGNDBZZFD"
};

const app = initializeApp(firebaseConfig);

// Habilita logs para diagnóstico profundo
setLogLevel("debug");

// CONFIGURAÇÃO DE ALTO COMPATIBILIDADE
// experimentalForceLongPolling: Força o uso de HTTPS simples em vez de WebSockets (resolve bloqueios de rede)
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true
});

export const storage = getStorage(app);
export const auth = getAuth(app);
