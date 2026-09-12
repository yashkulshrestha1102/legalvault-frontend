export const addActivity = (message) => {
  try {
    const activities = JSON.parse(localStorage.getItem("activities") || "[]");
    const newActivity = {
      id: Date.now(),
      message,
      date: new Date().toISOString(),
      user: JSON.parse(localStorage.getItem('user') || '{}').name || 'Unknown'
    };
    activities.unshift(newActivity);
    localStorage.setItem("activities", JSON.stringify(activities.slice(0, 50)));
  } catch (e) {
    console.error('Activity log failed:', e);
  }
};