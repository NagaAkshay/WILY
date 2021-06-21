import * as firebase from 'firebase'
require ('@firebase/firestore')
var firebaseConfig = {
    apiKey: "AIzaSyBh-mswSdU5DyFys-h9O-_TS4fDD9S5FWA",
    authDomain: "wily-bd08e.firebaseapp.com",
    projectId: "wily-bd08e",
    storageBucket: "wily-bd08e.appspot.com",
    messagingSenderId: "48122065723",
    appId: "1:48122065723:web:a85aabb534b01c4512fd1e"
  };
firebase.initializeApp(firebaseConfig);
export default firebase.firestore();