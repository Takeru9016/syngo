import "react-native-unistyles/mocks";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock AsyncStorage for Zustand persistence in tests.
jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    clear: jest.fn(),
  },
}));

// Silences noisy Expo/RN warnings that aren't actionable in unit tests.
jest.spyOn(console, "warn").mockImplementation(() => {});
