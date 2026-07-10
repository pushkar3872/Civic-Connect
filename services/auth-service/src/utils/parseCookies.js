const parseCookies = (cookieHeader = '') => {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(';').reduce((cookies, part) => {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (!rawKey) {
      return cookies;
    }
    cookies[rawKey] = decodeURIComponent(rawValue.join('='));
    return cookies;
  }, {});
};

module.exports = parseCookies;
