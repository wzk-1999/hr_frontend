export default function removeLocalStorageByPattern(pattern) {
  const regex = new RegExp(pattern);

  // Iterate over all keys in localStorage
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);

    // If the key matches the regex pattern, remove it
    if (regex.test(key)) {
      localStorage.removeItem(key);
    }
  }
}
