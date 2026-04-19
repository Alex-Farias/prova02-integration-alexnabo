import pactum from 'pactum';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';

describe('D&D Combat API', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://dnd-combat-api-7f3660dcecb1.herokuapp.com';

  p.request.setDefaultTimeout(30000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  const characterPayload = {
    name: faker.person.firstName(),
    strength: faker.number.int({ min: 8, max: 20 }),
    dexterity: faker.number.int({ min: 8, max: 20 }),
    hitPoints: faker.number.int({ min: 10, max: 50 }),
    armorClass: faker.number.int({ min: 10, max: 20 })
  };

  const monsterName = 'goblin';

  describe('Monstros', () => {
    it('Listar nomes de monstros na página 1', async () => {
      await p
        .spec()
        .get(`${baseUrl}/api/monsters/names/1`)
        .expectStatus(StatusCodes.OK);
    });

    it('Consultar detalhes de um monstro específico', async () => {
      await p
        .spec()
        .get(`${baseUrl}/api/monsters/${monsterName}`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({ name: 'Goblin' });
    });
  });

  describe('Personagens', () => {
    it('Obter exemplo de personagem e validar contrato', async () => {
      await p
        .spec()
        .get(`${baseUrl}/api/characters/example`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            name: { type: 'string' },
            strength: { type: 'number' },
            dexterity: { type: 'number' },
            hitPoints: { type: 'number' },
            armorClass: { type: 'number' }
          },
          required: ['name', 'strength', 'dexterity', 'hitPoints', 'armorClass']
        });
    });

    it('Validar se o personagem customizado está formatado corretamente', async () => {
      await p
        .spec()
        .post(`${baseUrl}/api/characters/check`)
        .withJson(characterPayload)
        .expectStatus(StatusCodes.OK);
    });
  });

  describe('Combate', () => {
    it('Simular batalha entre personagem gerado e monstro', async () => {
      await p
        .spec()
        .post(`${baseUrl}/api/battle/${monsterName}`)
        .withJson(characterPayload)
        .expectStatus(StatusCodes.OK);
    });
  });
});
