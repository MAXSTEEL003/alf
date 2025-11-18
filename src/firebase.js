import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs, 
  query, 
  where, 
  orderBy,
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  arrayUnion,
  serverTimestamp,
  runTransaction,
  addDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration with environment validation
// Vite exposes env vars via import.meta.env. Prefix your variables with VITE_ in
// a .env file at the project root (see .env.example).

// Validate required environment variables
const requiredEnvVars = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Firebase environment variables: ${missingVars.join(', ')}. ` +
    'Please check your .env file and ensure all Firebase configuration values are set.'
  );
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate required Vite env vars and print a clear message if any are missing.
// A missing env var in production (Vercel) is the most common reason the app
// renders a blank page because runtime code can fail silently in the browser.
{
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  const missing = required.filter((k) => !import.meta.env[k]);
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.error('Missing Firebase environment variables:', missing.join(', '));
    // eslint-disable-next-line no-console
    console.error(
      'Set these in Vercel: Project → Settings → Environment Variables (use the same names prefixed with VITE_).',
    );
    // Helpful quick link for debugging in browser
    // eslint-disable-next-line no-console
    console.error('See README.md for deployment instructions.');
  }
}
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
import { setPersistence, browserLocalPersistence } from 'firebase/auth';

export const auth = getAuth(app);
// Set persistence to LOCAL to keep the user logged in
setPersistence(auth, browserLocalPersistence);

// Collection references
const ordersCollection = collection(db, 'orders');
const feedbackCollection = collection(db, 'feedback');
const feedbackLinksCollection = collection(db, 'feedbackLinks');
const countersCollection = collection(db, 'counters');
const enquiriesCollection = collection(db, 'enquiries');

// Get next order number using a Firestore transaction to avoid race conditions.
// Starts at 10000 and increments by 1 atomically.
export async function getNextOrderNumber() {
  try {
    const counterDocRef = doc(db, 'counters', 'orderCounter');
    const nextNumber = await runTransaction(db, async (tx) => {
      const snap = await tx.get(counterDocRef);
      let current = 10000;
      if (snap.exists()) {
        const stored = snap.data().count;
        current = stored >= 10000 ? stored : 10000; // normalize if below baseline
      } else {
        tx.set(counterDocRef, { count: current });
      }
      const next = current + 1; // increment
      tx.set(counterDocRef, { count: next });
      return next;
    });
    return nextNumber;
  } catch (error) {
    console.error('Error getting next order number (transaction fallback):', error);
    // Fallback: derive pseudo-sequential number with time component (still >= 10000)
    return 10000 + (Date.now() % 90000);
  }
}

// Test function to verify Firestore connection
export async function testConnection() {
  try {
    if (import.meta.env.DEV) console.log('[dev] Testing Firestore connection...');
    const testDoc = doc(db, 'test', 'connection');
    await setDoc(testDoc, { 
      message: 'Hello Firestore!', 
      timestamp: serverTimestamp() 
    });
    if (import.meta.env.DEV) console.log('✅ Firestore connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    return false;
  }
}

// Orders CRUD operations
export async function createOrder(orderData) {
  try {
    if (import.meta.env.DEV) console.log('Creating order with data:', orderData);
    // Normalize searchable fields
    const customerLower = (orderData.customer || '').toLowerCase();
    if (orderData.id) {
      const docRef = doc(db, 'orders', orderData.id);
      const docData = {
        ...orderData,
        id: orderData.id,
        customerLower,
        createdAt: serverTimestamp(),
        status: 'active',
        checkpoints: orderData.checkpoints || []
      };
      await setDoc(docRef, docData);
      const snap = await getDoc(docRef);
      return { id: snap.id, ...snap.data() };
    } else {
      // Pre-generate an ID so we can embed it inside the document
      const docRef = doc(ordersCollection);
      const docData = {
        ...orderData,
        id: docRef.id,
        customerLower,
        createdAt: serverTimestamp(),
        status: 'active',
        checkpoints: orderData.checkpoints || []
      };
      await setDoc(docRef, docData);
      const snap = await getDoc(docRef);
      return { id: snap.id, ...snap.data() };
    }
  } catch (error) {
    console.error('Error in createOrder:', error);
    throw error;
  }
}

export async function getOrderById(id) {
  const docRef = doc(db, 'orders', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
}

export async function getAllOrders() {
  const querySnapshot = await getDocs(ordersCollection);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function searchOrdersByCustomer(customerName) {
  const name = customerName || '';
  const lower = name.toLowerCase();
  // Try normalized field first
  const q1 = query(
    ordersCollection,
    where('customerLower', '>=', lower),
    where('customerLower', '<=', lower + '\uf8ff')
  );
  const snap1 = await getDocs(q1);
  if (snap1.size > 0) {
    return snap1.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  // Fallback for legacy docs without customerLower
  const q2 = query(
    ordersCollection,
    where('customer', '>=', name),
    where('customer', '<=', name + '\uf8ff')
  );
  const snap2 = await getDocs(q2);
  return snap2.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function searchOrdersById(orderId) {
  if (!orderId) return [];
  // Direct lookup by document ID is cheaper; we also stored id field for redundancy.
  const direct = await getOrderById(orderId);
  if (direct) return [direct];
  // Fallback: query id field (in case of legacy docs).
  const q = query(ordersCollection, where('id', '==', orderId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateOrder(id, data) {
  const docRef = doc(db, 'orders', id);
  await updateDoc(docRef, data);
  const snap = await getDoc(docRef);
  return { id: snap.id, ...snap.data() };
}

export async function deleteOrderById(orderId) {
  if (!orderId) return;
  const docRef = doc(db, 'orders', orderId);
  await deleteDoc(docRef);
  return orderId;
}

export async function completeOrder(id) {
  const docRef = doc(db, 'orders', id);
  await updateDoc(docRef, {
    status: 'delivered',
    deliveredAt: serverTimestamp()
  });
  const snap = await getDoc(docRef);
  return { id: snap.id, ...snap.data() };
}

export async function addCheckpointToOrder(orderId, checkpoint) {
  if (!orderId || !checkpoint) return;
  const docRef = doc(db, 'orders', orderId);
  const payload = typeof checkpoint === 'string'
    ? { text: checkpoint, at: serverTimestamp() }
    : { ...checkpoint, at: checkpoint.at || serverTimestamp() };
  await updateDoc(docRef, {
    checkpoints: arrayUnion(payload)
  });
  return payload;
}

// Real-time subscriptions
export function subscribeOrders(onChange) {
  const q = query(ordersCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    onChange(orders);
  });
}

export function subscribeOrder(orderId, onChange) {
  if (!orderId) return () => {};
  const docRef = doc(db, 'orders', orderId);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      onChange({ id: doc.id, ...doc.data() });
    } else {
      onChange(null);
    }
  });
}

// Feedback operations
export async function createFeedback(feedbackData) {
  const docRef = await addDoc(feedbackCollection, {
    ...feedbackData,
    createdAt: serverTimestamp()
  });
  const snap = await getDoc(docRef);
  return { id: snap.id, ...snap.data() };
}

export async function getFeedbackByOrderId(orderId) {
  const q = query(feedbackCollection, where('orderId', '==', orderId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function getAllFeedback() {
  const q = query(feedbackCollection, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export function subscribeFeedback(onChange) {
  const q = query(feedbackCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    onChange(list);
  });
}

// Feedback link generation and resolution
function generateToken(length = 24) {
  try {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = new Uint8Array(length);
    // crypto.getRandomValues is available in browsers; if not, fallback.
    (globalThis.crypto || globalThis.msCrypto).getRandomValues(bytes);
    return Array.from(bytes).map(b => alphabet[b % alphabet.length]).join('');
  } catch (_) {
    // Fallback to less secure generation if crypto unavailable (unlikely in modern browsers)
    return Array.from({ length }).map(() => Math.random().toString(36)[2] || 'x').join('');
  }
}

export async function createFeedbackLink(orderId, opts = {}) {
  const token = generateToken();
  const ref = doc(feedbackLinksCollection, token);
  const defaultExpiryMs = 30 * 24 * 60 * 60 * 1000; // 30 days
  const expiresAtIso = new Date(Date.now() + defaultExpiryMs).toISOString();
  const payload = {
    orderId,
    status: 'active',
    createdAt: serverTimestamp(),
    expiresAt: opts.expiresAt || expiresAtIso
  };
  await setDoc(ref, payload);
  return { token, ...payload };
}

export async function getOrderIdByFeedbackToken(token) {
  if (!token) return null;
  const ref = doc(db, 'feedbackLinks', token);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  // Check expiry and status
  if (data.expiresAt) {
    const exp = Date.parse(data.expiresAt);
    if (!Number.isNaN(exp) && Date.now() > exp) {
      try { await updateDoc(ref, { status: 'expired' }); } catch (_) {}
      return null;
    }
  }
  if (data.status === 'expired') return null;
  return data.orderId || null;
}

// Enquiry operations
export async function createEnquiry(enquiryData) {
  try {
    if (import.meta.env.DEV) console.log('[dev] Attempting to create enquiry:', enquiryData);
    const docRef = await addDoc(enquiriesCollection, {
      ...enquiryData,
      timestamp: serverTimestamp()
    });
    if (import.meta.env.DEV) console.log('[dev] Enquiry created with ID:', docRef.id);
    const snap = await getDoc(docRef);
    return { id: snap.id, ...snap.data() };
  } catch (error) {
    console.error('Error creating enquiry:', error);
    throw error;
  }
}

export async function getAllEnquiries() {
  try {
    const q = query(enquiriesCollection, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting enquiries:', error);
    throw error;
  }
}

export default db;