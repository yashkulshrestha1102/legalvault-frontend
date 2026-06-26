export const addActivity = (message) => {

  const activities =
    JSON.parse(
      localStorage.getItem("activities")
    ) || [];

  const newActivity = {
    message,
    date: new Date().toLocaleString(),
  };

  activities.unshift(newActivity);

  localStorage.setItem(
    "activities",
    JSON.stringify(
      activities.slice(0, 20)
    )
  );
};