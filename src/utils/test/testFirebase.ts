import { isFirebaseConfigured, getFirebaseConfig } from '@/config/firebase';

export function testFirebaseConnection() {
  console.log('🔥 Testing Firebase Connection...');
  
  if (isFirebaseConfigured()) {
    console.log('✅ Firebase is configured!');
    const config = getFirebaseConfig();
    if (config) {
      console.log('📦 Project ID:', config.projectId);
      console.log('🌐 Auth Domain:', config.authDomain);
    }
    return true;
  } else {
    console.error('❌ Firebase is NOT configured!');
    return false;
  }
}