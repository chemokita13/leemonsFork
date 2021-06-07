const usersService = require('../services/private/users');
const LeemonsValidator = require('../helpers/leemons-validator');

async function recover(ctx) {
  try {
    const validator = new LeemonsValidator({
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
      },
      required: ['email'],
      additionalProperties: false,
    });
    if (validator.validate(ctx.request.body)) {
      await usersService.recover(ctx.request.body.email);
      ctx.status = 200;
      ctx.body = { status: 200, msg: 'Email sent' };
    } else {
      throw new Error(validator.error);
    }
  } catch (err) {
    ctx.status = 400;
    ctx.body = { status: 400, msg: err.message };
  }
}

async function login(ctx) {
  try {
    const validator = new LeemonsValidator({
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        password: {
          type: 'string',
        },
      },
      required: ['email', 'password'],
      additionalProperties: false,
    });
    if (validator.validate(ctx.request.body)) {
      const user = await usersService.login(ctx.request.body.email, ctx.request.body.password);
      ctx.status = 200;
      ctx.body = { status: 200, user };
    } else {
      throw new Error(validator.error);
    }
  } catch (err) {
    ctx.status = 400;
    ctx.body = { status: 400, msg: err.message };
  }
}

async function create(ctx) {
  /*
  const ajv = new Ajv({ allErrors: true });
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      test: { type: 'string' },
    },
    required: ['name', 'test'],
    additionalProperties: false,
  };
  if (ajv.validate(schema, ctx.request.body)) {
  } else {
    console.log('error', ajv.errors);
  }
  ctx.body = { test: 'Holaaa' };
  return ctx.body;

   */
}

async function createSuperAdmin(ctx) {
  ctx.body = await usersService.registerFirstSuperAdminUser(
    'Pepe',
    'pruebas',
    'testing@test.io',
    'testing'
  );
}

module.exports = {
  recover,
  login,
  create,
  createSuperAdmin,
};
