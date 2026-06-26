export const addNotification = (message) => {

  const existing =
    JSON.parse(
      localStorage.getItem("notifications")
    ) || [];

  const newNotification = {
    id: Date.now(),
    message,
    time: new Date().toLocaleString(),
  };

  const updated = [
    newNotification,
    ...existing,
  ];

  localStorage.setItem(
    "notifications",
    JSON.stringify(updated)
  );
};