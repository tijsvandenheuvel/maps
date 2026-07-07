import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
	getAuth,
	GoogleAuthProvider,
	signInWithPopup,
	signOut,
	onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
	getFirestore,
	collection,
	addDoc,
	deleteDoc,
	doc,
	query,
	where,
	orderBy,
	onSnapshot,
	serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const signinScreen = document.getElementById("signin-screen");
const signinBtn = document.getElementById("signin-btn");
const signinError = document.getElementById("signin-error");
const signoutBtn = document.getElementById("signout-btn");
const appEl = document.getElementById("app");
const addBtn = document.getElementById("add-btn");
const addOverlay = document.getElementById("add-overlay");
const cancelBtn = document.getElementById("cancel-btn");
const saveBtn = document.getElementById("save-btn");
const saveError = document.getElementById("save-error");
const nameInput = document.getElementById("visit-name");
const noteInput = document.getElementById("visit-note");
const dateInput = document.getElementById("visit-date");
const locationStatus = document.getElementById("location-status");
const listContent = document.getElementById("list-content");

let map;
let markers = new Map();
let pendingCoords = null;
let unsubscribeVisits = null;

function todayLocalISODate() {
	const now = new Date();
	now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
	return now.toISOString().slice(0, 10);
}

function initMap() {
	if (map) return;
	map = L.map("map").setView([20, 0], 2);
	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		maxZoom: 19,
		attribution: "&copy; OpenStreetMap contributors",
	}).addTo(map);
}

function getCurrentPosition() {
	return new Promise((resolve, reject) => {
		if (!navigator.geolocation) {
			reject(new Error("Geolocation is not supported on this device."));
			return;
		}
		navigator.geolocation.getCurrentPosition(resolve, reject, {
			enableHighAccuracy: true,
			timeout: 15000,
			maximumAge: 60000,
		});
	});
}

function openAddOverlay() {
	nameInput.value = "";
	noteInput.value = "";
	dateInput.value = todayLocalISODate();
	saveError.textContent = "";
	pendingCoords = null;
	saveBtn.disabled = true;
	locationStatus.textContent = "Getting your location...";
	addOverlay.classList.remove("hidden");

	getCurrentPosition()
		.then((pos) => {
			pendingCoords = {
				lat: pos.coords.latitude,
				lng: pos.coords.longitude,
			};
			locationStatus.textContent = `Location captured (±${Math.round(pos.coords.accuracy)}m)`;
			saveBtn.disabled = false;
		})
		.catch((err) => {
			locationStatus.textContent = "Couldn't get your location: " + err.message;
		});
}

function closeAddOverlay() {
	addOverlay.classList.add("hidden");
}

async function saveVisit() {
	if (!pendingCoords) return;
	const user = auth.currentUser;
	if (!user) return;

	saveBtn.disabled = true;
	saveError.textContent = "";

	try {
		await addDoc(collection(db, "visits"), {
			uid: user.uid,
			name: nameInput.value.trim() || "Unnamed visit",
			note: noteInput.value.trim(),
			lat: pendingCoords.lat,
			lng: pendingCoords.lng,
			date: dateInput.value || todayLocalISODate(),
			timestamp: serverTimestamp(),
		});
		closeAddOverlay();
	} catch (err) {
		saveError.textContent = "Couldn't save: " + err.message;
		saveBtn.disabled = false;
	}
}

async function deleteVisit(id) {
	try {
		await deleteDoc(doc(db, "visits", id));
	} catch (err) {
		alert("Couldn't delete: " + err.message);
	}
}

function renderVisits(visits) {
	markers.forEach((marker) => map.removeLayer(marker));
	markers.clear();
	listContent.innerHTML = "";

	if (visits.length === 0) {
		listContent.innerHTML = '<p class="empty">No visits yet. Tap + to add your first one.</p>';
		return;
	}

	const byDate = new Map();
	for (const visit of visits) {
		if (!byDate.has(visit.date)) byDate.set(visit.date, []);
		byDate.get(visit.date).push(visit);
	}

	const sortedDates = [...byDate.keys()].sort((a, b) => (a < b ? 1 : -1));

	for (const date of sortedDates) {
		const dayGroup = document.createElement("div");
		dayGroup.className = "day-group";

		const dayTitle = document.createElement("h3");
		dayTitle.textContent = date;
		dayGroup.appendChild(dayTitle);

		for (const visit of byDate.get(date)) {
			const marker = L.marker([visit.lat, visit.lng]).addTo(map);
			marker.bindPopup(`<strong>${escapeHtml(visit.name)}</strong>${visit.note ? "<br>" + escapeHtml(visit.note) : ""}`);
			markers.set(visit.id, marker);

			const item = document.createElement("div");
			item.className = "visit-item";
			item.innerHTML = `
				<div class="visit-item-main">
					<div class="visit-item-name">${escapeHtml(visit.name)}</div>
					${visit.note ? `<div class="visit-item-note">${escapeHtml(visit.note)}</div>` : ""}
				</div>
				<button class="visit-delete" title="Delete">&times;</button>
			`;
			item.querySelector(".visit-item-main").addEventListener("click", () => {
				map.setView([visit.lat, visit.lng], 15);
				marker.openPopup();
			});
			item.querySelector(".visit-delete").addEventListener("click", (e) => {
				e.stopPropagation();
				if (confirm(`Delete "${visit.name}"?`)) deleteVisit(visit.id);
			});
			dayGroup.appendChild(item);
		}

		listContent.appendChild(dayGroup);
	}

	const allCoords = visits.map((v) => [v.lat, v.lng]);
	if (allCoords.length > 0) {
		map.fitBounds(allCoords, { padding: [40, 40], maxZoom: 12 });
	}
}

function escapeHtml(str) {
	const div = document.createElement("div");
	div.textContent = str;
	return div.innerHTML;
}

function subscribeToVisits(uid) {
	const q = query(collection(db, "visits"), where("uid", "==", uid), orderBy("timestamp", "desc"));
	unsubscribeVisits = onSnapshot(q, (snapshot) => {
		const visits = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
		renderVisits(visits);
	}, (err) => {
		listContent.innerHTML = `<p class="error">Couldn't load visits: ${escapeHtml(err.message)}</p>`;
	});
}

signinBtn.addEventListener("click", () => {
	signinError.textContent = "";
	signInWithPopup(auth, new GoogleAuthProvider()).catch((err) => {
		signinError.textContent = err.message;
	});
});

signoutBtn.addEventListener("click", () => signOut(auth));
addBtn.addEventListener("click", openAddOverlay);
cancelBtn.addEventListener("click", closeAddOverlay);
saveBtn.addEventListener("click", saveVisit);

onAuthStateChanged(auth, (user) => {
	if (unsubscribeVisits) {
		unsubscribeVisits();
		unsubscribeVisits = null;
	}

	if (user) {
		signinScreen.classList.add("hidden");
		appEl.classList.remove("hidden");
		initMap();
		subscribeToVisits(user.uid);
	} else {
		signinScreen.classList.remove("hidden");
		appEl.classList.add("hidden");
	}
});
