import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const PROFILE_STORAGE_KEY = "send-a-letter-profile-name";
const DEFAULT_PROFILE_NAME = "Linh";

const firebaseConfig = {
  apiKey: "AIzaSyB2nZf2xOue86xR2jW603mr4hx8p9c8--I",
  authDomain: "sendale-202b8.firebaseapp.com",
  projectId: "sendale-202b8",
  storageBucket: "sendale-202b8.firebasestorage.app",
  messagingSenderId: "1077341742534",
  appId: "1:1077341742534:web:23b0e35836ed166c203ec7",
  measurementId: "G-1TFPXM4T61"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const notesCollection = collection(db, "notes");

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `note-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function getStoredProfileName() {
  return localStorage.getItem(PROFILE_STORAGE_KEY)?.trim() || DEFAULT_PROFILE_NAME;
}

function normalizeNote(id, data) {
  const createdAt = data.createdAt?.toDate?.()?.toISOString?.()
    || data.createdAt
    || new Date().toISOString();

  return {
    id,
    sender: data.sender?.trim?.() || DEFAULT_PROFILE_NAME,
    recipient: data.recipient?.trim?.() || DEFAULT_PROFILE_NAME,
    type: data.type === "challenge" ? "challenge" : "note",
    title: data.title?.trim?.() || "Không có tiêu đề",
    content: data.content?.trim?.() || "",
    status: data.status === "accepted" ? "accepted" : "pending",
    pinned: Boolean(data.pinned),
    createdAt
  };
}

async function loadState() {
  const notesQuery = query(notesCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(notesQuery);

  return {
    profileName: getStoredProfileName(),
    notes: snapshot.docs.map((item) => normalizeNote(item.id, item.data()))
  };
}

async function upsertNote(noteInput) {
  const noteId = noteInput.id ?? generateId();
  const payload = {
    sender: noteInput.sender?.trim() || getStoredProfileName(),
    recipient: noteInput.recipient?.trim() || getStoredProfileName(),
    type: noteInput.type === "challenge" ? "challenge" : "note",
    title: noteInput.title?.trim() || "Không có tiêu đề",
    content: noteInput.content?.trim() || "",
    status: noteInput.status === "accepted" ? "accepted" : "pending",
    pinned: Boolean(noteInput.pinned)
  };

  if (noteInput.createdAt) {
    payload.createdAt = Timestamp.fromDate(new Date(noteInput.createdAt));
  } else {
    payload.createdAt = serverTimestamp();
  }

  await setDoc(doc(db, "notes", noteId), payload, { merge: true });
  return noteId;
}

async function updateNote(noteId, changes) {
  await updateDoc(doc(db, "notes", noteId), changes);
}

async function deleteNote(noteId) {
  await deleteDoc(doc(db, "notes", noteId));
}

function updateProfileName(profileName) {
  const nextName = profileName.trim() || DEFAULT_PROFILE_NAME;
  localStorage.setItem(PROFILE_STORAGE_KEY, nextName);
  return nextName;
}

async function seedDemoData(profileName = DEFAULT_PROFILE_NAME) {
  const cleanProfile = updateProfileName(profileName);
  const demoNotes = [
    {
      sender: "Minh",
      recipient: cleanProfile,
      type: "challenge",
      title: "Chụp ảnh buổi sáng",
      content: "Ngày mai hãy chụp một bức ảnh buổi sáng thật đẹp và gửi lên nhóm bạn.",
      status: "pending",
      pinned: false,
      createdAt: new Date().toISOString()
    },
    {
      sender: "Vy",
      recipient: cleanProfile,
      type: "note",
      title: "Một lời nhắn nhỏ",
      content: "Nhớ nghỉ giải lao 10 phút sau khi học xong nhé.",
      status: "pending",
      pinned: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    },
    {
      sender: "An",
      recipient: cleanProfile,
      type: "challenge",
      title: "Đọc 5 trang sách",
      content: "Tối nay đọc 5 trang sách bất kỳ rồi chia sẻ một câu bạn thích nhất.",
      status: "accepted",
      pinned: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
    }
  ];

  await Promise.all(demoNotes.map((note) => upsertNote(note)));
}

export {
  deleteNote,
  loadState,
  seedDemoData,
  updateNote,
  updateProfileName,
  upsertNote
};
