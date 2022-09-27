const _ = require('lodash');
const { table } = require('../tables');

async function getFeedbackResults(id, { userSession, transacting: _transacting } = {}) {
  return global.utils.withTransaction(
    async (transacting) => {
      const [feedbackDates, feedbackResponses, feedbackQuestions] = await Promise.all([
        table.feedbackDates.find({ instance: id }, { transacting }),
        table.feedbackResponse.find({ instance: id }, { transacting }),
      ]);

      // General info of feedback
      let numberOfStartedFeedback = 0;
      let numberOfFinishedFeedback = 0;
      feedbackDates.forEach(({ startDate, endDate }) => {
        if (startDate) numberOfStartedFeedback++;
        if (endDate) numberOfFinishedFeedback++;
      });

      const completionPercentage = Math.trunc(
        (numberOfFinishedFeedback / feedbackDates.length) * 100
      );

      let totalTimeToFinishOfFeedback = 0;
      feedbackDates.forEach(({ timeToFinish }) => {
        if (timeToFinish) totalTimeToFinishOfFeedback += timeToFinish;
      });
      const avgTimeOfCompletion = totalTimeToFinishOfFeedback / numberOfFinishedFeedback;

      const feedbackGeneralInfo = {
        started: numberOfStartedFeedback,
        finished: numberOfFinishedFeedback,
        completionPercentage,
        avgTimeOfCompletion,
      };

      // Info of responses
      const questionResponses = _.groupBy(
        _.map(feedbackResponses, (value) => ({
          ...value,
          response: JSON.parse(value.response),
        })),
        'question'
      );
      const questions = await table.feedbackQuestions.find(
        {
          id_$in: Object.keys(questionResponses),
        },
        { transacting }
      );

      const questionsInfo = {};
      _.forEach(questions, (question) => {
        questionsInfo[question.id] = {
          value: {},
          percentages: {},
          totalValues: 0,
        };
        if (question.type === 'openResponse') {
          questionsInfo[question.id].value = [];
        } else {
          questionsInfo[question.id].avg = 0;
        }
        _.forEach(questionResponses[question.id], (questionResponse) => {
          if (question.type === 'openResponse') {
            questionsInfo[question.id].value.push(questionResponse.response);
            questionsInfo[question.id].totalValues++;
          }
          if (
            question.type === 'singleResponse' ||
            question.type === 'likertScale' ||
            question.type === 'netPromoterScore'
          ) {
            if (!questionsInfo[question.id].value[questionResponse.response]) {
              questionsInfo[question.id].value[questionResponse.response] = 0;
            }
            questionsInfo[question.id].avg += questionResponse.response;
            questionsInfo[question.id].value[questionResponse.response]++;
            questionsInfo[question.id].totalValues++;
          }
          if (question.type === 'multiResponse') {
            _.forEach(questionResponse.response, (response) => {
              if (!questionsInfo[question.id].value[response]) {
                questionsInfo[question.id].value[response] = 0;
              }
              questionsInfo[question.id].avg += questionResponse.response;
              questionsInfo[question.id].value[questionResponse.response]++;
              questionsInfo[question.id].totalValues++;
            });
          }
        });

        if (question.type !== 'openResponse') {
          questionsInfo[question.id].avg /= questionsInfo[question.id].totalValues;
          _.forIn(questionsInfo[question.id].value, (value, key) => {
            questionsInfo[question.id].percentages[key] =
              value / questionsInfo[question.id].totalValues;
          });
        }

        if (question.type === 'netPromoterScore') {
          let detractors = 0;
          let passives = 0;
          let promoters = 0;
          if (questionsInfo[question.id].value[0]) {
            detractors += questionsInfo[question.id].value[0];
          }
          if (questionsInfo[question.id].value[1]) {
            detractors += questionsInfo[question.id].value[1];
          }
          if (questionsInfo[question.id].value[2]) {
            detractors += questionsInfo[question.id].value[2];
          }
          if (questionsInfo[question.id].value[3]) {
            detractors += questionsInfo[question.id].value[3];
          }
          if (questionsInfo[question.id].value[4]) {
            detractors += questionsInfo[question.id].value[4];
          }
          if (questionsInfo[question.id].value[5]) {
            detractors += questionsInfo[question.id].value[5];
          }
          if (questionsInfo[question.id].value[6]) {
            passives += questionsInfo[question.id].value[6];
          }
          if (questionsInfo[question.id].value[7]) {
            passives += questionsInfo[question.id].value[7];
          }
          if (questionsInfo[question.id].value[8]) {
            promoters += questionsInfo[question.id].value[8];
          }
          if (questionsInfo[question.id].value[9]) {
            promoters += questionsInfo[question.id].value[9];
          }
          const avgDetractors = detractors / questionsInfo[question.id].totalValues;
          const avgPromoters = promoters / questionsInfo[question.id].totalValues;
          questionsInfo[question.id].nsp = {
            points: avgPromoters - avgDetractors,
            detractors: {
              number: detractors,
              avg: avgDetractors,
            },
            passives: {
              number: passives,
              avg: passives / questionsInfo[question.id].totalValues,
            },
            promoters: {
              number: promoters,
              avg: avgPromoters,
            },
          };
        }
      });

      return { generalInfo: feedbackGeneralInfo, questionsInfo };
    },
    table.feedbackResponse,
    _transacting
  );
}

module.exports = getFeedbackResults;
