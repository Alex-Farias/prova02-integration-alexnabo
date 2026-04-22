import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';
import data from '../data/data.json';

describe('Go REST API', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = data.goRest.baseUrl;
  const queries = data.goRest.queries;

  const goRestToken = process.env.GOREST_TOKEN;
  const hasGoRestToken = Boolean(goRestToken && goRestToken.trim());

  let firstUserId = 0;

  p.request.setDefaultTimeout(30000);

  beforeAll(async () => {
    p.reporter.add(rep);

    firstUserId = await p
      .spec()
      .get(`${baseUrl}/users`)
      .withQueryParams({
        page: queries.page,
        per_page: 1
      })
      .expectStatus(StatusCodes.OK)
      .returns('[0].id');
  });

  afterAll(() => p.reporter.end());

  describe('Consulta pública', () => {
    it('listar usuários', async () => {
      await p
        .spec()
        .get(`${baseUrl}/users`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'array'
        });
    });

    it('listar usuários com paginação', async () => {
      await p
        .spec()
        .get(`${baseUrl}/users`)
        .withQueryParams({
          page: queries.page,
          per_page: queries.perPage
        })
        .expectStatus(StatusCodes.OK)
        .expect(ctx => {
          expect(ctx.res.body.length).toBeLessThanOrEqual(queries.perPage);
        });
    });

    it('buscar usuário por id dinâmico', async () => {
      await p
        .spec()
        .get(`${baseUrl}/users/${firstUserId}`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          id: firstUserId
        });
    });

    it('listar posts públicos', async () => {
      await p.spec().get(`${baseUrl}/posts`).expectStatus(StatusCodes.OK);
    });

    it('listar comentários públicos', async () => {
      await p.spec().get(`${baseUrl}/comments`).expectStatus(StatusCodes.OK);
    });

    it('listar tarefas públicas', async () => {
      await p.spec().get(`${baseUrl}/todos`).expectStatus(StatusCodes.OK);
    });

    it('filtrar usuários por gênero', async () => {
      await p
        .spec()
        .get(`${baseUrl}/users`)
        .withQueryParams({
          gender: queries.gender
        })
        .expectStatus(StatusCodes.OK)
        .expect(ctx => {
          const allMatch = ctx.res.body.every(
            (user: { gender: string }) => user.gender === queries.gender
          );

          expect(allMatch).toBeTruthy();
        });
    });

    it('filtrar usuários por status', async () => {
      await p
        .spec()
        .get(`${baseUrl}/users`)
        .withQueryParams({
          status: queries.status
        })
        .expectStatus(StatusCodes.OK)
        .expect(ctx => {
          const allMatch = ctx.res.body.every(
            (user: { status: string }) => user.status === queries.status
          );

          expect(allMatch).toBeTruthy();
        });
    });

    it('filtrar posts por user_id', async () => {
      await p
        .spec()
        .get(`${baseUrl}/posts`)
        .withQueryParams({
          user_id: firstUserId
        })
        .expectStatus(StatusCodes.OK)
        .expect(ctx => {
          const allMatch = ctx.res.body.every(
            (post: { user_id: number }) => post.user_id === firstUserId
          );

          expect(allMatch).toBeTruthy();
        });
    });

    it('retornar not found para endpoint inexistente', async () => {
      await p.spec().get(`${baseUrl}/invalid-resource`).expectStatus(404);
    });

    it('não criar usuário sem token', async () => {
      await p
        .spec()
        .post(`${baseUrl}/users`)
        .withJson({
          name: 'User without token',
          email: `user-without-token-${Date.now()}@mail.com`,
          gender: 'male',
          status: 'active'
        })
        .expectStatus(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('Fluxo autenticado com token', () => {
    if (hasGoRestToken) {
      let createdUserId = 0;
      const uniqueId = Date.now();
      const createdUserEmail = `qa-gorest-${uniqueId}@mail.com`;

      it('criar usuário com token', async () => {
        createdUserId = await p
          .spec()
          .post(`${baseUrl}/users`)
          .withHeaders('Authorization', `Bearer ${goRestToken}`)
          .withJson({
            name: 'QA GoRest User',
            email: createdUserEmail,
            gender: 'male',
            status: 'active'
          })
          .expectStatus(StatusCodes.CREATED)
          .returns('id');
      });

      it('atualizar usuário com token', async () => {
        await p
          .spec()
          .put(`${baseUrl}/users/${createdUserId}`)
          .withHeaders('Authorization', `Bearer ${goRestToken}`)
          .withJson({
            name: 'QA GoRest User Updated',
            email: createdUserEmail,
            gender: 'male',
            status: 'inactive'
          })
          .expectStatus(StatusCodes.OK)
          .expectJsonLike({
            id: createdUserId,
            status: 'inactive'
          });
      });

      it('deletar usuário com token', async () => {
        await p
          .spec()
          .delete(`${baseUrl}/users/${createdUserId}`)
          .withHeaders('Authorization', `Bearer ${goRestToken}`)
          .expectStatus(StatusCodes.NO_CONTENT);
      });
    } else {
      it('não executar fluxo autenticado sem GOREST_TOKEN', async () => {
        expect(hasGoRestToken).toBeFalsy();
      });
    }
  });
});
