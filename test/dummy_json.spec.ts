import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';
import data from '../data/data.json';

describe('DummyJSON API', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = data.dummyJson.baseUrl;
  const queries = data.dummyJson.queries;
  const auth = data.dummyJson.auth;
  const newProduct = data.dummyJson.newProduct;

  p.request.setDefaultTimeout(30000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  describe('Healthcheck e catálogos', () => {
    it('validar endpoint de teste', async () => {
      await p
        .spec()
        .get(`${baseUrl}/test`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          status: 'ok',
          method: 'GET'
        });
    });

    it('listar produtos com payload paginado', async () => {
      await p
        .spec()
        .get(`${baseUrl}/products`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            products: { type: 'array' },
            total: { type: 'number' },
            skip: { type: 'number' },
            limit: { type: 'number' }
          },
          required: ['products', 'total', 'skip', 'limit']
        });
    });

    it('listar produtos com limite', async () => {
      await p
        .spec()
        .get(`${baseUrl}/products`)
        .withQueryParams({
          limit: queries.productsLimit
        })
        .expectStatus(StatusCodes.OK)
        .expect(ctx => {
          expect(ctx.res.body.products.length).toBeLessThanOrEqual(
            queries.productsLimit
          );
        });
    });

    it('buscar produtos por termo', async () => {
      await p
        .spec()
        .get(`${baseUrl}/products/search`)
        .withQueryParams({
          q: queries.searchTerm
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          products: []
        });
    });

    it('listar categorias de produtos', async () => {
      await p
        .spec()
        .get(`${baseUrl}/products/categories`)
        .expectStatus(StatusCodes.OK)
        .expect(ctx => {
          expect(Array.isArray(ctx.res.body)).toBeTruthy();
          expect(ctx.res.body.length).toBeGreaterThan(0);
        });
    });

    it('listar produtos de uma categoria', async () => {
      await p
        .spec()
        .get(`${baseUrl}/products/category/smartphones`)
        .expectStatus(StatusCodes.OK)
        .expect(ctx => {
          expect(Array.isArray(ctx.res.body.products)).toBeTruthy();
          expect(ctx.res.body.products.length).toBeGreaterThan(0);
        });
    });
  });

  describe('Usuários, posts e carrinhos', () => {
    it('listar usuários com limite', async () => {
      await p
        .spec()
        .get(`${baseUrl}/users`)
        .withQueryParams({
          limit: queries.usersLimit
        })
        .expectStatus(StatusCodes.OK)
        .expect(ctx => {
          expect(ctx.res.body.users.length).toBeLessThanOrEqual(
            queries.usersLimit
          );
        });
    });

    it('buscar usuário por id', async () => {
      await p
        .spec()
        .get(`${baseUrl}/users/1`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          id: 1
        });
    });

    it('listar posts com limite', async () => {
      await p
        .spec()
        .get(`${baseUrl}/posts`)
        .withQueryParams({
          limit: queries.postsLimit
        })
        .expectStatus(StatusCodes.OK)
        .expect(ctx => {
          expect(ctx.res.body.posts.length).toBeLessThanOrEqual(
            queries.postsLimit
          );
        });
    });

    it('listar carrinhos com limite', async () => {
      await p
        .spec()
        .get(`${baseUrl}/carts`)
        .withQueryParams({
          limit: queries.cartsLimit
        })
        .expectStatus(StatusCodes.OK)
        .expect(ctx => {
          expect(ctx.res.body.carts.length).toBeLessThanOrEqual(
            queries.cartsLimit
          );
        });
    });
  });

  describe('Autenticação e escrita simulada', () => {
    it('não realizar login com credenciais inválidas', async () => {
      await p
        .spec()
        .post(`${baseUrl}/auth/login`)
        .withJson({
          username: auth.username,
          password: auth.password
        })
        .expectStatus(StatusCodes.BAD_REQUEST)
        .expectJsonLike({
          message: 'Invalid credentials'
        });
    });

    it('adicionar novo produto no endpoint simulado', async () => {
      await p
        .spec()
        .post(`${baseUrl}/products/add`)
        .withJson(newProduct)
        .expectStatus(StatusCodes.CREATED)
        .expectJsonLike({
          title: newProduct.title,
          price: newProduct.price,
          category: newProduct.category
        });
    });
  });
});
