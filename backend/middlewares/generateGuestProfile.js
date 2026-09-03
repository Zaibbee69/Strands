const { faker } = require('@faker-js/faker');

function generateGuestProfile() {

    const adjective = faker.word.adjective();
    const animal = faker.animal.type();
    const randomNumber = faker.number.int({ min: 100, max: 999 });

    const formattedAdjective = adjective.charAt(0).toUpperCase() + adjective.slice(1);
    const formattedAnimal = animal.charAt(0).toUpperCase() + animal.slice(1);

    const username = `Guest_${formattedAdjective}_${formattedAnimal}_${randomNumber}`;

    const bio = `🚀 ${faker.person.jobDescriptor()} ${faker.person.jobType()} by day. ${faker.hacker.ingverb()} the matrix by night.`;

    return { username, bio };
}

module.exports = { generateGuestProfile }