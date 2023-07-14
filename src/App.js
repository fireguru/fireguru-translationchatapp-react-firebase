import React, { useRef, useState, useEffect } from "react";

import "./App.css";
import { setConfig } from "react-google-translate";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

//import { signOut } from "firebase/auth";

// Setting up Google Cloud API Services
//setConfig({
//  clientEmail: "fireguru@fireguru-chatapp-392406.iam.gserviceaccount.com",
//  privateKey: "AIzaSyDbb_O6zywfCxjIb_ajPtY9WagdNxjbwsM",
//  projectId: "fireguru-chatapp-392406",
//});

//Initializing Firebase Application from Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBNhEBVc5MzZnsqlAKdCtesoYfeCXH8pSc",
  authDomain: "fireguru-chatapp.firebaseapp.com",
  projectId: "fireguru-chatapp",
  storageBucket: "fireguru-chatapp.appspot.com",
  messagingSenderId: "618129494494",
  appId: "1:618129494494:web:2f8f0df376ff146e138d4f",
  measurementId: "G-PWBBXH1TMQ",
});

const analyticsMock = {
  logEvent: () => {},
  setCurrentScreen: () => {},
  setUserId: () => {},
};

const auth = firebase.auth();
const firestore = firebase.firestore();
export const analytics = firebase.analytics.isSupported()
  ? firebase.analytics()
  : analyticsMock;

function App() {
  const [user] = useAuthState(auth);
  const [selectedlanguage, setlanguage] = useState("en");
  console.log(selectedlanguage);

  return (
    <div className="App">
      <header className="App-header">
        <div>
          {user ? (
            <SignOut selectedlanguage={selectedlanguage} />
          ) : (
            <div> {user}</div>
          )}
        </div>
        <div>
          {user ? (
            <Translate
              selectedlanguage={selectedlanguage}
              setlanguage={setlanguage}
            />
          ) : (
            <div> {user}</div>
          )}
        </div>
      </header>
      <section>
        {user ? <ChatRoom selectedlanguage={selectedlanguage} /> : <SignIn />}
      </section>
    </div>
  );
}

function Translate(props) {
  //  console.log(props);
  const availablelanguages = ["de", "en", "es", "fr"];
  return (
    <select
      value={props.selectedlanguage}
      onChange={(e) => props.setlanguage(e.target.value)}
      name="language"
      id="language-select"
    >
      {availablelanguages.map((languagecode) => {
        return (
          <option key={languagecode} value={languagecode}>
            {languagecode}
          </option>
        );
      })}
    </select>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <p>
        Do not violate the community guidelines or you will be banned for life!
      </p>
    </>
  );
}

function SignOut(props) {
  const signOutTranslations = {
    de: "austragen",
    en: "sign out",
    es: "desconectar",
    fr: "se déconnecter",
  };

  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        {signOutTranslations[props.selectedlanguage]}
      </button>
    )
  );
}

function ChatRoom(props) {
  console.log("chatroom props", props);
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);
  const [messages] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  const inputTranslations = {
    de: "Sag etwas Nettes",
    en: "say something nice",
    es: "di algo agradable",
    fr: "dis quelque chose de gentil",
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => (
            <ChatMessage
              selectedlanguage={props.selectedlanguage}
              key={msg.id}
              message={msg}
            />
          ))}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder={inputTranslations[props.selectedlanguage]}
        />
        <button type="submit" disabled={!formValue}>
          🕊️
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL, translated } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
  let translatedmessage;
  if (translated) {
    translatedmessage = translated[props.selectedlanguage];
  } else {
    translatedmessage = "translating...";
  }
  console.log("chat message", props);

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img src={photoURL || "https://placehold.co/600x400"} />
        <p>{translatedmessage}</p>
      </div>
    </>
  );
}

export default App;
