import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';
import data from '../data/data.json';

describe('Restful-Booker API', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = data.restfulBooker.baseUrl;
  const authData = data.restfulBooker.auth;
  const bookingPayload = data.restfulBooker.booking;
  const bookingUpdatePayload = data.restfulBooker.bookingUpdate;
  const bookingPatchPayload = data.restfulBooker.bookingPatch;

  let authToken = '';
  let createdBookingId = 0;

  p.request.setDefaultTimeout(30000);
  p.request.setDefaultHeaders({
    Accept: 'application/json'
  });

  beforeAll(async () => {
    p.reporter.add(rep);
    authToken = await p
      .spec()
      .post(`${baseUrl}/auth`)
      .withJson({
        username: authData.username,
        password: authData.password
      })
      .expectStatus(StatusCodes.OK)
      .expectJsonLike({
        token: /.+/
      })
      .returns('token');
  });

  afterAll(() => p.reporter.end());

  describe('Healthcheck e Auth', () => {
    it('validar endpoint de healthcheck', async () => {
      await p.spec().get(`${baseUrl}/ping`).expectStatus(StatusCodes.CREATED);
    });

    it('gerar token com credenciais válidas', async () => {
      await p
        .spec()
        .post(`${baseUrl}/auth`)
        .withJson({
          username: authData.username,
          password: authData.password
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          token: /.+/
        });
    });

    it('não gerar token com credenciais inválidas', async () => {
      await p
        .spec()
        .post(`${baseUrl}/auth`)
        .withJson({
          username: authData.username,
          password: authData.invalidPassword
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          reason: 'Bad credentials'
        });
    });
  });

  describe('Bookings', () => {
    it('listar bookings disponíveis', async () => {
      await p
        .spec()
        .get(`${baseUrl}/booking`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'array',
          items: {
            type: 'object',
            properties: {
              bookingid: { type: 'number' }
            },
            required: ['bookingid']
          }
        });
    });

    it('criar novo booking', async () => {
      createdBookingId = await p
        .spec()
        .post(`${baseUrl}/booking`)
        .withJson(bookingPayload)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          booking: {
            firstname: bookingPayload.firstname,
            lastname: bookingPayload.lastname,
            totalprice: bookingPayload.totalprice,
            depositpaid: bookingPayload.depositpaid,
            additionalneeds: bookingPayload.additionalneeds
          }
        })
        .returns('bookingid');
    });

    it('buscar booking criado por id', async () => {
      await p
        .spec()
        .get(`${baseUrl}/booking/${createdBookingId}`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          firstname: bookingPayload.firstname,
          lastname: bookingPayload.lastname,
          totalprice: bookingPayload.totalprice
        });
    });

    it('filtrar booking por firstname e lastname', async () => {
      await p
        .spec()
        .get(
          `${baseUrl}/booking?firstname=${bookingPayload.firstname}&lastname=${bookingPayload.lastname}`
        )
        .expectStatus(StatusCodes.OK)
        .expect(ctx => {
          const bookingIds = ctx.res.body.map(
            (booking: { bookingid: number }) => booking.bookingid
          );

          expect(bookingIds).toContain(createdBookingId);
        });
    });

    it('atualizar booking completo com token', async () => {
      await p
        .spec()
        .put(`${baseUrl}/booking/${createdBookingId}`)
        .withHeaders('Cookie', `token=${authToken}`)
        .withJson(bookingUpdatePayload)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          firstname: bookingUpdatePayload.firstname,
          lastname: bookingUpdatePayload.lastname,
          totalprice: bookingUpdatePayload.totalprice,
          depositpaid: bookingUpdatePayload.depositpaid,
          additionalneeds: bookingUpdatePayload.additionalneeds
        });
    });

    it('validar alteração após atualização completa', async () => {
      await p
        .spec()
        .get(`${baseUrl}/booking/${createdBookingId}`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          firstname: bookingUpdatePayload.firstname,
          lastname: bookingUpdatePayload.lastname,
          totalprice: bookingUpdatePayload.totalprice,
          depositpaid: bookingUpdatePayload.depositpaid
        });
    });

    it('atualizar parcialmente booking com token', async () => {
      await p
        .spec()
        .patch(`${baseUrl}/booking/${createdBookingId}`)
        .withHeaders('Cookie', `token=${authToken}`)
        .withJson(bookingPatchPayload)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          firstname: bookingPatchPayload.firstname,
          additionalneeds: bookingPatchPayload.additionalneeds
        });
    });

    it('validar alteração após atualização parcial', async () => {
      await p
        .spec()
        .get(`${baseUrl}/booking/${createdBookingId}`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          firstname: bookingPatchPayload.firstname,
          additionalneeds: bookingPatchPayload.additionalneeds
        });
    });

    it('não atualizar booking sem autenticação', async () => {
      await p
        .spec()
        .put(`${baseUrl}/booking/${createdBookingId}`)
        .withJson(bookingUpdatePayload)
        .expectStatus(StatusCodes.FORBIDDEN);
    });

    it('deletar booking com token', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/booking/${createdBookingId}`)
        .withHeaders('Cookie', `token=${authToken}`)
        .expectStatus(StatusCodes.CREATED);
    });

    it('retornar not found após deletar booking', async () => {
      await p
        .spec()
        .get(`${baseUrl}/booking/${createdBookingId}`)
        .expectStatus(StatusCodes.NOT_FOUND);
    });
  });
});
