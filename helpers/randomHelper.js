function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomEmail() {
  const num = randomNumber(1, 9999);
  return `mauricio-user${num}@test.com`;
}

function randomString(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

module.exports = { randomNumber, randomEmail, randomString };