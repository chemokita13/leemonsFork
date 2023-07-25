/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const { LeemonsMongoDBMixin, mongoose } = require('leemons-mongodb');
const { LeemonsDeploymentManagerMixin } = require('leemons-deployment-manager');

const path = require('path');
const { addLocales } = require('leemons-multilanguage');
const { hasKey, setKey } = require('leemons-mongodb-helpers');
const { LeemonsCacheMixin } = require('leemons-cache');
const { LeemonsMiddlewaresMixin } = require('leemons-middlewares');
const { getServiceModels } = require('../models');

/** @type {ServiceSchema} */
module.exports = () => ({
  name: 'multilanguage.deploy',
  version: 1,
  mixins: [
    LeemonsMiddlewaresMixin(),
    LeemonsCacheMixin(),
    LeemonsMongoDBMixin({
      models: getServiceModels(),
    }),
    LeemonsDeploymentManagerMixin(),
  ],
  events: {
    'deployment-manager.install': function (ctx) {},
    'multilanguage.newLocale': async function (ctx) {
      if (
        !hasKey(ctx.db.KeyValue, `locale-${ctx.params.code}-configured`) ||
        process.env.RELOAD_I18N_ON_EVERY_INSTALL === 'true'
      ) {
        await addLocales({
          ctx,
          locales: ctx.params.code,
          i18nPath: path.resolve(__dirname, `../i18n/`),
        });
        await setKey(ctx.db.KeyValue, `locale-${ctx.params.code}-configured`);
      }
      return null;
    },
  },
  created() {
    mongoose.connect(process.env.MONGO_URI);
  },
});
