const getTime = () => {
  return new Date().getTime();
};

const generateMessages = (user_name,text) => {
  return {
    user_name,
    text,
    createdAt: getTime(),
  };
};

const generateLocation = (user_name,locationUrl) => {
  return {
    user_name,
    locationUrl,
    createdAt: getTime(),
  };
};

module.exports = { generateMessages, generateLocation };
