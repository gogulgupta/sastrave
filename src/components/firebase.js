import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDJGImQAhi5Iot4e9VbYabRCUH69E5qiH0",
  authDomain: "sasthra-6767c.firebaseapp.com",
  projectId: "sasthra-6767c",
  messagingSenderId: "840242086368",
  appId: "1:840242086368:web:86ef2c82e61a2ff58ceb85"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);