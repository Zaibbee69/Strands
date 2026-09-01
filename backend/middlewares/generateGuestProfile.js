const { faker } = require('@faker-js/faker');

function generateGuestProfile() {
    // 1. Generate a fun, creative username using Faker's internet and word modules
    // Capitalizes the words for clean formatting
    const adjective = faker.word.adjective();
    const animal = faker.animal.type();
    const randomNumber = faker.number.int({ min: 100, max: 999 });

    // Capitalize first letters: e.g., "Neon_Badger_482"
    const formattedAdjective = adjective.charAt(0).toUpperCase() + adjective.slice(1);
    const formattedAnimal = animal.charAt(0).toUpperCase() + animal.slice(1);

    const username = `Guest_${formattedAdjective}_${formattedAnimal}_${randomNumber}`;

    // 2. Generate a creative bio
    const bio = `🚀 ${faker.person.jobDescriptor()} ${faker.person.jobType()} by day. ${faker.hacker.ingverb()} the matrix by night.`;

    return { username, bio };
}

module.exports = { generateGuestProfile }