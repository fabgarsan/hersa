type LogoutCallback = () => void;

let _logoutCallback: LogoutCallback | null = null;

export const authEvents = {
  setLogoutCallback(fn: LogoutCallback): void {
    _logoutCallback = fn;
  },
  triggerLogout(): void {
    if (_logoutCallback) {
      _logoutCallback();
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/";
    }
  },
};
