const STORAGE_KEY = "map-posts-demo";

const map = L.map("map", { zoomControl: true }).setView([50.8503, 4.3517], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	attribution:
		'&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
	maxZoom: 19,
	errorTileUrl: "tile-fallback.svg",
}).addTo(map);

const hint = document.getElementById("hint");
const overlay = document.getElementById("overlay");
const formEl = document.getElementById("post-form");
const titleInput = document.getElementById("post-title");
const textInput = document.getElementById("post-text");
const photoInput = document.getElementById("post-photo");
const photoPreview = document.getElementById("photo-preview");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");
const locateBtn = document.getElementById("locate-btn");

let pendingLatLng = null;
let pendingPhotoData = null;
const markerById = new Map();

const demoPosts = [
	{
		id: "demo-1",
		lat: 50.8466,
		lng: 4.3528,
		title: "Grand Place",
		text: "First stop of the trip - the square is even more impressive in person.",
		photo:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Brussels_Grand_Place_02.jpg/640px-Brussels_Grand_Place_02.jpg",
		createdAt: Date.now() - 1000 * 60 * 60 * 5,
	},
	{
		id: "demo-2",
		lat: 50.8548,
		lng: 4.3776,
		title: "Cinquantenaire Park",
		text: "Picnic lunch under the arch. Perfect weather today.",
		photo:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Brussels_Cinquantenaire_02.jpg/640px-Brussels_Cinquantenaire_02.jpg",
		createdAt: Date.now() - 1000 * 60 * 60 * 2,
	},
];

function loadPosts() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return demoPosts.slice();
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : demoPosts.slice();
	} catch (e) {
		return demoPosts.slice();
	}
}

function savePosts(posts) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

let posts = loadPosts();

function formatDate(ts) {
	return new Date(ts).toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function buildIcon(photo) {
	const style = photo ? `background-image:url('${photo}')` : "";
	return L.divIcon({
		className: "",
		html: `<div class="photo-marker${photo ? "" : " no-photo"}" style="${style}">${photo ? "" : "📍"}</div>`,
		iconSize: [44, 44],
		iconAnchor: [22, 22],
		popupAnchor: [0, -20],
	});
}

function buildPopupContent(post) {
	const div = document.createElement("div");
	div.className = "popup-card";
	div.innerHTML = `
		${post.photo ? `<img src="${post.photo}" alt="${post.title || "photo"}" />` : ""}
		${post.title ? `<h3>${escapeHtml(post.title)}</h3>` : ""}
		${post.text ? `<p>${escapeHtml(post.text)}</p>` : ""}
		<div class="meta">${formatDate(post.createdAt)}</div>
		<button class="delete-btn" data-id="${post.id}">Delete post</button>
	`;
	div.querySelector(".delete-btn").addEventListener("click", () => deletePost(post.id));
	return div;
}

function escapeHtml(str) {
	const el = document.createElement("div");
	el.textContent = str;
	return el.innerHTML;
}

function addMarker(post) {
	const marker = L.marker([post.lat, post.lng], { icon: buildIcon(post.photo) })
		.addTo(map)
		.bindPopup(buildPopupContent(post), {
			maxWidth: 240,
			minWidth: 180,
			maxHeight: Math.round(window.innerHeight * 0.6),
			autoPanPadding: [16, 16],
		});
	markerById.set(post.id, marker);
}

function deletePost(id) {
	const marker = markerById.get(id);
	if (marker) {
		map.removeLayer(marker);
		markerById.delete(id);
	}
	posts = posts.filter((p) => p.id !== id);
	savePosts(posts);
}

function renderAllPosts() {
	markerById.forEach((marker) => map.removeLayer(marker));
	markerById.clear();
	posts.forEach(addMarker);
}

renderAllPosts();

setTimeout(() => hint.classList.add("hidden"), 4000);

function openForm(latlng) {
	pendingLatLng = latlng;
	pendingPhotoData = null;
	titleInput.value = "";
	textInput.value = "";
	photoInput.value = "";
	photoPreview.src = "";
	photoPreview.classList.add("hidden");
	overlay.classList.remove("hidden");
	formEl.classList.remove("hidden");
	titleInput.focus();
}

function closeForm() {
	overlay.classList.add("hidden");
	formEl.classList.add("hidden");
	pendingLatLng = null;
}

map.on("click", (e) => {
	hint.classList.add("hidden");
	openForm(e.latlng);
});

photoInput.addEventListener("change", () => {
	const file = photoInput.files[0];
	if (!file) {
		pendingPhotoData = null;
		photoPreview.classList.add("hidden");
		return;
	}
	const reader = new FileReader();
	reader.onload = () => {
		pendingPhotoData = reader.result;
		photoPreview.src = pendingPhotoData;
		photoPreview.classList.remove("hidden");
	};
	reader.readAsDataURL(file);
});

cancelBtn.addEventListener("click", closeForm);
overlay.addEventListener("click", closeForm);

saveBtn.addEventListener("click", () => {
	if (!pendingLatLng) return;
	const title = titleInput.value.trim();
	const text = textInput.value.trim();
	if (!title && !text && !pendingPhotoData) {
		closeForm();
		return;
	}
	const post = {
		id: `post-${Date.now()}`,
		lat: pendingLatLng.lat,
		lng: pendingLatLng.lng,
		title,
		text,
		photo: pendingPhotoData,
		createdAt: Date.now(),
	};
	posts.push(post);
	savePosts(posts);
	addMarker(post);
	markerById.get(post.id).openPopup();
	closeForm();
});

locateBtn.addEventListener("click", () => {
	if (!navigator.geolocation) return;
	navigator.geolocation.getCurrentPosition(
		(pos) => {
			map.setView([pos.coords.latitude, pos.coords.longitude], 15);
		},
		() => {
			alert("Could not get your location.");
		}
	);
});
