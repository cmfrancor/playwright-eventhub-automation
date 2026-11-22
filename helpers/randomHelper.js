function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomString(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

function randomEmail() {
  return `qa-reg-${Date.now()}-${randomString(6)}@test.com`;
}

module.exports = { randomNumber, randomEmail, randomString };
