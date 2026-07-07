# Setting up "My Visits"

This app needs a free Firebase project to store your visits so they sync
across your phone and any other device, anywhere with an internet connection.

## 1. Create a Firebase project

1. Go to https://console.firebase.google.com and create a new project (any
   name, e.g. "my-visits"). Google Analytics is not needed.
2. In the project, click the `</>` (web) icon to register a new web app.
   You don't need Firebase Hosting for this - the app is already served by
   GitHub Pages.
3. Copy the `firebaseConfig` object it shows you and paste the values into
   `visits/firebase-config.js` in this repo.

## 2. Enable Google sign-in

1. In the Firebase console: **Build > Authentication > Sign-in method**.
2. Enable the **Google** provider.

## 3. Enable Firestore

1. In the Firebase console: **Build > Firestore Database > Create database**.
2. Start in **production mode** (we'll set rules explicitly below).
3. Pick any region close to you.

## 4. Lock the data down to just you

By default, production mode denies all reads/writes. Open the app once,
sign in with Google, then find your user ID (UID) in **Authentication >
Users**. Then go to **Firestore Database > Rules** and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /visits/{visitId} {
      allow read, write: if request.auth != null
                          && request.auth.uid == "YOUR_UID_HERE"
                          && request.resource.data.uid == "YOUR_UID_HERE";
      allow delete: if request.auth != null
                    && request.auth.uid == "YOUR_UID_HERE";
    }
  }
}
```

Replace `YOUR_UID_HERE` with your actual UID (in both places), then
**Publish**. This ensures only you can ever read or write visit data, even
though the app is public on GitHub Pages.

## 5. Use it

Open `visits/index.html` (via your GitHub Pages URL) on your phone, sign in
with Google once, and tap **+** to log a visit anywhere in the world - it
grabs your GPS location automatically and saves it to Firestore. Your visits
show up as pins on the map and in the list below, grouped by day, on every
device you sign into.

## Note on the Firebase config values

The values in `firebase-config.js` (API key, project ID, etc.) are not
secret - Firebase's own docs confirm these are safe to expose in client-side
code. Everything is protected by the Firestore security rules above and by
requiring Google sign-in, not by hiding these values.
