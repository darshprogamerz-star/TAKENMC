class Cooldowns {
  constructor() {
    this.entries = new Map();
  }

  remaining(key, cooldownSeconds) {
    const expiresAt = this.entries.get(key);
    if (!expiresAt) return 0;
    const remainingMs = expiresAt - Date.now();
    if (remainingMs <= 0) {
      this.entries.delete(key);
      return 0;
    }
    return Math.ceil(remainingMs / 1000);
  }

  set(key, cooldownSeconds) {
    this.entries.set(key, Date.now() + cooldownSeconds * 1000);
  }
}

module.exports = new Cooldowns();
