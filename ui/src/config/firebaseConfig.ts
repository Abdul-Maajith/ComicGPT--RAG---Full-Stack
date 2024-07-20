import { getAuth } from "@firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_DEV,
  authDomain: "agentstack-testing.firebaseapp.com",
  projectId: "agentstack-testing",
  storageBucket: "agentstack-testing.appspot.com",
  messagingSenderId: "432893037878",
  appId: "1:432893037878:web:cccf3b8b33ae07b4ed7797",
  measurementId: "G-X3XJ8SDQV1",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
// const firebaseApp =
//   process.env.NODE_ENV !== "production" ? "" : initializeApp(firebaseConfig);

export { firebaseApp, auth };
