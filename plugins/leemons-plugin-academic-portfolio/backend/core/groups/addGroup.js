const { map } = require('lodash');
const { validateAddGroup } = require('../../validations/forms');
const { getNextGroupIndex } = require('./getNextGroupIndex');
const { addNextGroupIndex } = require('./addNextGroupIndex');
const { addClass } = require('../classes/addClass');
const { saveManagers } = require('../managers/saveManagers');

async function addGroup({ data: _data, ctx }) {
  await validateAddGroup({ data: _data, ctx });
  const { subjects, aditionalData, managers, ...data } = _data;
  const index = await getNextGroupIndex({ program: data.program, ctx });
  await addNextGroupIndex({ program: data.program, index, ctx });
  const group = await ctx.tx.db.Groups.create({ ...data, index, type: 'group' });
  await saveManagers({ userAgents: managers, type: 'group', relationship: group.id, ctx });
  if (subjects) {
    await Promise.all(
      map(subjects, (subject) =>
        addClass({
          data: {
            ...aditionalData,
            subject,
            group: group.id,
            program: data.program,
          },
          ctx,
        })
      )
    );
  }
  return group;
}

module.exports = { addGroup };
