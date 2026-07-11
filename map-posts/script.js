const STORAGE_KEY = "map-posts-demo";
const MAX_PHOTO_DIM = 1280;
const PHOTO_QUALITY = 0.75;

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
const formTitleEl = document.getElementById("form-title");
const titleInput = document.getElementById("post-title");
const textInput = document.getElementById("post-text");
const photoInput = document.getElementById("post-photo");
const photoStatus = document.getElementById("photo-status");
const photoPreviewWrap = document.getElementById("photo-preview-wrap");
const photoPreview = document.getElementById("photo-preview");
const removePhotoBtn = document.getElementById("remove-photo-btn");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");
const locateBtn = document.getElementById("locate-btn");
const addBtn = document.getElementById("add-btn");
const tabMap = document.getElementById("tab-map");
const tabList = document.getElementById("tab-list");
const viewMap = document.getElementById("view-map");
const viewList = document.getElementById("view-list");
const listEl = document.getElementById("post-list");
const listEmptyEl = document.getElementById("list-empty");
const toastEl = document.getElementById("toast");

let formMode = "create";
let editingId = null;
let pendingLatLng = null;
let pendingPhotoData = null;
let photoRemoved = false;
const markerById = new Map();

const demoPosts = [
	{
		id: "demo-1",
		lat: 50.8466,
		lng: 4.3528,
		title: "Grand Place",
		text: "First stop of the trip - the square is even more impressive in person.",
		photo:
			"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NDAiIGhlaWdodD0iNDIwIiB2aWV3Qm94PSIwIDAgNjQwIDQyMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZjdiNzMzIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2I1NDcxYiIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjY0MCIgaGVpZ2h0PSI0MjAiIGZpbGw9InVybCgjZykiLz4KICA8ZyBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMyIgb3BhY2l0eT0iMC41NSI+CiAgICA8cGF0aCBkPSJNMTIwIDM0MCBMMTIwIDIwMCBMMTUwIDE2MCBMMTgwIDIwMCBMMTgwIDM0MCBaIi8+CiAgICA8cGF0aCBkPSJNMjIwIDM0MCBMMjIwIDE4MCBMMjYwIDE0MCBMMzAwIDE4MCBMMzAwIDM0MCBaIi8+CiAgICA8cGF0aCBkPSJNMzQwIDM0MCBMMzQwIDIxMCBMMzcwIDE3NSBMNDAwIDIxMCBMNDAwIDM0MCBaIi8+CiAgICA8cGF0aCBkPSJNNDQwIDM0MCBMNDQwIDE2MCBMNDgwIDExMCBMNTIwIDE2MCBMNTIwIDM0MCBaIi8+CiAgPC9nPgogIDx0ZXh0IHg9IjMyMCIgeT0iMzgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtc2l6ZT0iMzAiIGZpbGw9IiNmZmYiIG9wYWNpdHk9IjAuOSI+R3JhbmQgUGxhY2U8L3RleHQ+Cjwvc3ZnPgo=",
		createdAt: Date.now() - 1000 * 60 * 60 * 5,
	},
	{
		id: "demo-2",
		lat: 50.8548,
		lng: 4.3776,
		title: "Cinquantenaire Park",
		text: "Picnic lunch under the arch. Perfect weather today.",
		photo:
			"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NDAiIGhlaWdodD0iNDIwIiB2aWV3Qm94PSIwIDAgNjQwIDQyMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImcyIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzJmOGY1YiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwZjRjODEiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI2NDAiIGhlaWdodD0iNDIwIiBmaWxsPSJ1cmwoI2cyKSIvPgogIDxnIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI0IiBvcGFjaXR5PSIwLjYiPgogICAgPHBhdGggZD0iTTIyMCAzNDAgTDIyMCAxNjAgUTMyMCA5MCA0MjAgMTYwIEw0MjAgMzQwIiAvPgogICAgPGxpbmUgeDE9IjE4MCIgeTE9IjM0MCIgeDI9IjQ2MCIgeTI9IjM0MCIvPgogIDwvZz4KICA8dGV4dCB4PSIzMjAiIHk9IjM4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXNpemU9IjI4IiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjkiPkNpbnF1YW50ZW5haXJlIFBhcms8L3RleHQ+Cjwvc3ZnPgo=",
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

function persistPosts(next) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		return true;
	} catch (e) {
		return false;
	}
}

let posts = loadPosts();

// ---- CRUD ----

function createPost({ lat, lng, title, text, photo }) {
	const post = {
		id: `post-${Date.now()}`,
		lat,
		lng,
		title,
		text,
		photo: photo || null,
		createdAt: Date.now(),
		updatedAt: Date.now(),
	};
	const next = posts.concat(post);
	if (!persistPosts(next)) {
		showToast("Storage full — try a smaller photo or delete an old post", "error");
		return null;
	}
	posts = next;
	renderMarkers();
	renderList();
	return post;
}

function updatePost(id, patch) {
	const idx = posts.findIndex((p) => p.id === id);
	if (idx === -1) return null;
	const updated = { ...posts[idx], ...patch, updatedAt: Date.now() };
	const next = posts.slice();
	next[idx] = updated;
	if (!persistPosts(next)) {
		showToast("Storage full — try a smaller photo", "error");
		return null;
	}
	posts = next;
	renderMarkers();
	renderList();
	return updated;
}

function moveLocation(id, lat, lng) {
	const idx = posts.findIndex((p) => p.id === id);
	if (idx === -1) return;
	posts[idx] = { ...posts[idx], lat, lng, updatedAt: Date.now() };
	if (persistPosts(posts)) {
		showToast("Location updated");
	} else {
		showToast("Could not save new location", "error");
	}
}

function deletePost(id) {
	const next = posts.filter((p) => p.id !== id);
	persistPosts(next);
	posts = next;
	renderMarkers();
	renderList();
	showToast("Post deleted");
}

// ---- Image compression ----

function compressImage(file, maxDim = MAX_PHOTO_DIM, quality = PHOTO_QUALITY) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const img = new Image();
			img.onload = () => {
				let { width, height } = img;
				if (width > maxDim || height > maxDim) {
					if (width > height) {
						height = Math.round((height * maxDim) / width);
						width = maxDim;
					} else {
						width = Math.round((width * maxDim) / height);
						height = maxDim;
					}
				}
				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext("2d");
				ctx.drawImage(img, 0, 0, width, height);
				resolve(canvas.toDataURL("image/jpeg", quality));
			};
			img.onerror = () => reject(new Error("Could not load image"));
			img.src = reader.result;
		};
		reader.onerror = () => reject(new Error("Could not read file"));
		reader.readAsDataURL(file);
	});
}

// ---- Rendering ----

function formatDate(ts) {
	return new Date(ts).toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function escapeHtml(str) {
	const el = document.createElement("div");
	el.textContent = str;
	return el.innerHTML;
}

const PIN_SVG =
	'<svg viewBox="0 0 24 24"><path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>';
const EDIT_SVG =
	'<svg viewBox="0 0 24 24"><path d="M4 20l4-1 10-10-3-3L5 16l-1 4z"/><path d="M14 5l3 3"/></svg>';
const DELETE_SVG =
	'<svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></svg>';

function buildIcon(photo) {
	const style = photo ? `background-image:url('${photo}')` : "";
	return L.divIcon({
		className: "",
		html: `<div class="photo-marker${photo ? "" : " no-photo"}" style="${style}"></div>`,
		iconSize: [44, 44],
		iconAnchor: [22, 22],
		popupAnchor: [0, -20],
	});
}

function buildPopupContent(post) {
	const div = document.createElement("div");
	div.className = "popup-card";
	div.innerHTML = `
		${post.photo ? `<img src="${post.photo}" alt="${escapeHtml(post.title || "photo")}" />` : ""}
		${post.title ? `<h3>${escapeHtml(post.title)}</h3>` : ""}
		${post.text ? `<p>${escapeHtml(post.text)}</p>` : ""}
		<div class="meta">${formatDate(post.createdAt)}</div>
		<div class="popup-actions">
			<button class="edit-link">Edit</button>
			<button class="delete-link">Delete</button>
		</div>
	`;
	div.querySelector(".edit-link").addEventListener("click", () => openForm("edit", post));
	div.querySelector(".delete-link").addEventListener("click", () => {
		if (confirm("Delete this post?")) deletePost(post.id);
	});
	return div;
}

function addMarker(post) {
	const marker = L.marker([post.lat, post.lng], {
		icon: buildIcon(post.photo),
		draggable: true,
	})
		.addTo(map)
		.bindPopup(buildPopupContent(post), {
			maxWidth: 240,
			minWidth: 180,
			maxHeight: Math.round(window.innerHeight * 0.6),
			autoPanPadding: [16, 16],
		});
	marker.on("dragend", (e) => {
		const { lat, lng } = e.target.getLatLng();
		moveLocation(post.id, lat, lng);
	});
	markerById.set(post.id, marker);
}

function renderMarkers() {
	markerById.forEach((marker) => map.removeLayer(marker));
	markerById.clear();
	posts.forEach(addMarker);
}

function buildListItem(post) {
	const li = document.createElement("li");
	li.className = "post-item";

	const thumb = document.createElement("div");
	thumb.className = "post-thumb";
	if (post.photo) {
		thumb.style.backgroundImage = `url('${post.photo}')`;
	} else {
		thumb.innerHTML = PIN_SVG;
	}

	const body = document.createElement("div");
	body.className = "post-body";
	body.innerHTML = `
		<h3>${escapeHtml(post.title || "Untitled post")}</h3>
		${post.text ? `<p>${escapeHtml(post.text)}</p>` : ""}
		<div class="post-meta">${formatDate(post.createdAt)}</div>
	`;
	body.addEventListener("click", () => showOnMap(post));

	const actions = document.createElement("div");
	actions.className = "post-actions";
	actions.innerHTML = `
		<button class="icon-btn edit-btn" title="Edit">${EDIT_SVG}</button>
		<button class="icon-btn delete-btn" title="Delete">${DELETE_SVG}</button>
	`;
	actions.querySelector(".edit-btn").addEventListener("click", () => openForm("edit", post));
	actions.querySelector(".delete-btn").addEventListener("click", () => {
		if (confirm("Delete this post?")) deletePost(post.id);
	});

	li.append(thumb, body, actions);
	return li;
}

function renderList() {
	listEl.innerHTML = "";
	if (posts.length === 0) {
		listEmptyEl.classList.remove("hidden");
		return;
	}
	listEmptyEl.classList.add("hidden");
	const sorted = posts.slice().sort((a, b) => b.createdAt - a.createdAt);
	sorted.forEach((post) => listEl.appendChild(buildListItem(post)));
}

function showOnMap(post) {
	setView("map");
	map.setView([post.lat, post.lng], Math.max(map.getZoom(), 15));
	const marker = markerById.get(post.id);
	if (marker) marker.openPopup();
}

renderMarkers();
renderList();

setTimeout(() => hint.classList.add("hidden"), 4000);

// ---- View toggle ----

function setView(view) {
	const isMap = view === "map";
	viewMap.classList.toggle("hidden", !isMap);
	viewList.classList.toggle("hidden", isMap);
	tabMap.classList.toggle("active", isMap);
	tabMap.setAttribute("aria-selected", String(isMap));
	tabList.classList.toggle("active", !isMap);
	tabList.setAttribute("aria-selected", String(!isMap));
	if (isMap) {
		setTimeout(() => map.invalidateSize(), 50);
	} else {
		renderList();
	}
}

tabMap.addEventListener("click", () => setView("map"));
tabList.addEventListener("click", () => setView("list"));

// ---- Toast ----

let toastTimer;
function showToast(message, type = "success") {
	toastEl.textContent = message;
	toastEl.className = "toast" + (type === "error" ? " toast-error" : "");
	clearTimeout(toastTimer);
	requestAnimationFrame(() => toastEl.classList.add("visible"));
	toastTimer = setTimeout(() => toastEl.classList.remove("visible"), 2600);
}

// ---- Form (create / edit) ----

function showPhotoPreview(src) {
	photoPreview.src = src;
	photoPreviewWrap.classList.remove("hidden");
}

function hidePhotoPreview() {
	photoPreview.src = "";
	photoPreviewWrap.classList.add("hidden");
}

function openForm(mode, data) {
	formMode = mode;
	pendingPhotoData = null;
	photoRemoved = false;
	photoInput.value = "";
	photoStatus.classList.add("hidden");
	saveBtn.disabled = false;

	if (mode === "create") {
		editingId = null;
		pendingLatLng = data;
		formTitleEl.textContent = "New post";
		saveBtn.textContent = "Post to map";
		titleInput.value = "";
		textInput.value = "";
		hidePhotoPreview();
	} else {
		editingId = data.id;
		pendingLatLng = { lat: data.lat, lng: data.lng };
		formTitleEl.textContent = "Edit post";
		saveBtn.textContent = "Save changes";
		titleInput.value = data.title || "";
		textInput.value = data.text || "";
		if (data.photo) showPhotoPreview(data.photo);
		else hidePhotoPreview();
	}

	overlay.classList.remove("hidden");
	formEl.classList.remove("hidden");
	titleInput.focus();
}

function closeForm() {
	overlay.classList.add("hidden");
	formEl.classList.add("hidden");
	pendingLatLng = null;
	editingId = null;
}

map.on("click", (e) => {
	hint.classList.add("hidden");
	openForm("create", e.latlng);
});

addBtn.addEventListener("click", () => {
	hint.classList.add("hidden");
	openForm("create", map.getCenter());
});

photoInput.addEventListener("change", async () => {
	const file = photoInput.files[0];
	if (!file) return;
	photoRemoved = false;
	photoStatus.classList.remove("hidden");
	saveBtn.disabled = true;
	try {
		pendingPhotoData = await compressImage(file);
		showPhotoPreview(pendingPhotoData);
	} catch (e) {
		showToast("Could not read that photo", "error");
	} finally {
		photoStatus.classList.add("hidden");
		saveBtn.disabled = false;
	}
});

removePhotoBtn.addEventListener("click", () => {
	pendingPhotoData = null;
	photoRemoved = true;
	photoInput.value = "";
	hidePhotoPreview();
});

cancelBtn.addEventListener("click", closeForm);
overlay.addEventListener("click", closeForm);

saveBtn.addEventListener("click", () => {
	const title = titleInput.value.trim();
	const text = textInput.value.trim();

	if (formMode === "create") {
		if (!pendingLatLng) return;
		if (!title && !text && !pendingPhotoData) {
			closeForm();
			return;
		}
		const post = createPost({
			lat: pendingLatLng.lat,
			lng: pendingLatLng.lng,
			title,
			text,
			photo: pendingPhotoData,
		});
		if (post) {
			showToast("Post added");
			closeForm();
			const marker = markerById.get(post.id);
			if (marker) marker.openPopup();
		}
	} else {
		const patch = { title, text };
		if (photoRemoved) patch.photo = null;
		else if (pendingPhotoData) patch.photo = pendingPhotoData;
		const updated = updatePost(editingId, patch);
		if (updated) {
			showToast("Post updated");
			closeForm();
			const marker = markerById.get(updated.id);
			if (marker) marker.openPopup();
		}
	}
});

locateBtn.addEventListener("click", () => {
	if (!navigator.geolocation) return;
	navigator.geolocation.getCurrentPosition(
		(pos) => {
			map.setView([pos.coords.latitude, pos.coords.longitude], 15);
		},
		() => {
			showToast("Could not get your location", "error");
		}
	);
});
