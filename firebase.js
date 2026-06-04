// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDOx7FYMK05gK6lnWzV1TK0hN2-AjDIQ2w",
  authDomain: "qr-code-maker-3c0a3.firebaseapp.com",
  projectId: "qr-code-maker-3c0a3",
  storageBucket: "qr-code-maker-3c0a3.firebasestorage.app",
  messagingSenderId: "228600018483",
  appId: "1:228600018483:web:6f044755abd17dd0641546"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
