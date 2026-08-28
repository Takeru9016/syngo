// Silences noisy Expo/RN warnings that aren't actionable in unit tests.
jest.spyOn(console, "warn").mockImplementation(() => {});
