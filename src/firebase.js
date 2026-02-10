import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDJGImQAhi5Iot4e9VbYabRCUH69E5qiH0",
  authDomain: "sasthra-6767c.firebaseapp.com",
  databaseURL: "https://sasthra-6767c-default-rtdb.firebaseio.com",
  projectId: "sasthra-6767c",
  storageBucket: "sasthra-6767c.appspot.com",
  messagingSenderId: "840242086368",
  appId: "1:840242086368:web:86ef2c82e61a2ff58ceb85"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
