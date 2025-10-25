import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
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
  serverTimestamp 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
// Replace these with your actual Firebase project config
// Vite exposes env vars via import.meta.env. Prefix your variables with VITE_ in
// a .env file at the project root (see .env.example).
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

// Get next order number
export async function getNextOrderNumber() {
  try {
    const counterDocRef = doc(db, 'counters', 'orderCounter');
    const counterDoc = await getDoc(counterDocRef);
    
    let nextNumber = 10000; // Start from 5 digits
    
    if (counterDoc.exists()) {
      const currentCount = counterDoc.data().count;
      nextNumber = currentCount >= 10000 ? currentCount + 1 : 10000;
    }
    
    // Update the counter
    await setDoc(counterDocRef, { count: nextNumber });
    
    return nextNumber;
  } catch (error) {
    console.error('Error getting next order number:', error);
    // Fallback to timestamp-based ID if counter fails
    return 10000 + (Date.now() % 90000); // Ensures 5 digits
  }
}

// Test function to verify Firestore connection
export async function testConnection() {
  try {
    console.log('Testing Firestore connection...');
    const testDoc = doc(db, 'test', 'connection');
    await setDoc(testDoc, { 
      message: 'Hello Firestore!', 
      timestamp: new Date().toISOString() 
    });
    console.log('✅ Firestore connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return false;
  }
}

// Orders CRUD operations
export async function createOrder(orderData) {
  try {
    console.log('Creating order with data:', orderData);
    
    if (orderData.id) {
      // If ID is provided, use setDoc
      const docRef = doc(db, 'orders', orderData.id);
      const docData = {
        ...orderData,
        createdAt: new Date().toISOString(),
        status: 'active',
        checkpoints: orderData.checkpoints || []
      };
      
      console.log('Using setDoc with data:', docData);
      await setDoc(docRef, docData);
      return { id: orderData.id, ...docData };
    } else {
      // Otherwise use addDoc to generate an ID
      const docData = {
        ...orderData,
        createdAt: new Date().toISOString(),
        status: 'active',
        checkpoints: orderData.checkpoints || []
      };
      
      console.log('Using addDoc with data:', docData);
      const docRef = await addDoc(ordersCollection, docData);
      return { id: docRef.id, ...docData };
    }
  } catch (error) {
    console.error('Error in createOrder:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
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
  const q = query(
    ordersCollection, 
    where('customer', '>=', customerName),
    where('customer', '<=', customerName + '\uf8ff')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function searchOrdersById(orderId) {
  const q = query(
    ordersCollection,
    where('id', '==', orderId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function updateOrder(id, data) {
  const docRef = doc(db, 'orders', id);
  await updateDoc(docRef, data);
  return { id, ...data };
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
    deliveredAt: new Date().toISOString()
  });
  return id;
}

export async function addCheckpointToOrder(orderId, checkpoint) {
  if (!orderId) return;
  const docRef = doc(db, 'orders', orderId);
  // Use arrayUnion to append the checkpoint
  await updateDoc(docRef, {
    checkpoints: arrayUnion(checkpoint)
  });
  return checkpoint;
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
    createdAt: new Date().toISOString()
  });
  return { id: docRef.id, ...feedbackData };
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
function generateToken(length = 10) {
  // Simple URL-safe token: base36 + timestamp tail
  const rand = Math.random().toString(36).slice(2);
  const time = Date.now().toString(36).slice(-4);
  return (rand + time).slice(0, length);
}

export async function createFeedbackLink(orderId, opts = {}) {
  const token = generateToken(12);
  const ref = doc(feedbackLinksCollection, token);
  const payload = {
    orderId,
    status: 'active',
    createdAt: new Date().toISOString(),
    ...(opts.expiresAt ? { expiresAt: opts.expiresAt } : {})
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
  // Optional: check expiry
  if (data.expiresAt) {
    try {
      const exp = new Date(data.expiresAt).getTime();
      if (Date.now() > exp) return null;
    } catch (_) {}
  }
  return data.orderId || null;
}

// Enquiry operations
export async function createEnquiry(enquiryData) {
  try {
    console.log('Attempting to create enquiry with data:', enquiryData);
    const docRef = await addDoc(enquiriesCollection, {
      ...enquiryData,
      timestamp: serverTimestamp()
    });
    console.log('Enquiry created successfully with ID:', docRef.id);
    return { id: docRef.id, ...enquiryData };
  } catch (error) {
    console.error('Error creating enquiry:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', JSON.stringify(error));
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