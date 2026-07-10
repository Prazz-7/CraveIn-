const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const calculateDeliveryCharge = (distance, baseCharge = 50) => {
  const additionalDistance = Math.max(0, distance - 1);
  return baseCharge + Math.ceil(additionalDistance * 10);
};

const calculateEstimatedDeliveryTime = (distance) => {
  return Math.ceil((distance / 15) * 60);
};

module.exports = { calculateDistance, calculateDeliveryCharge, calculateEstimatedDeliveryTime };