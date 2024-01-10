import React from 'react';
import useTranslateLoader from '@multilanguage/useTranslateLoader';
import prefixPN from '@learning-paths/helpers/prefixPN';
import { Text, Box } from '@bubbles-ui/components';
import { htmlToText } from '@learning-paths/components/ModuleDashboard/helpers/htmlToText';
import { INTRODUCTION_PROP_TYPES, INTRODUCTION_DEFAULT_PROPS } from './Introduction.constants';
import { introductionStyles } from './Introduction.styles';
import { Resources } from './components/Resources';

const Introduction = ({ instance }) => {
  const { classes } = introductionStyles();
  const [t] = useTranslateLoader([prefixPN('moduleJourney')]);
  return (
    <Box className={classes.root}>
      <Box>
        <Text className={classes.title}>{t('introduction')}</Text>
      </Box>
      <Box>
        <Text className={classes.introduction}>{htmlToText(instance?.metadata?.statement)}</Text>
      </Box>
      <Box>
        <Text className={classes.title}>{t('resources')}</Text>
      </Box>
      <Resources assignation={{ instance }} />
    </Box>
  );
};

Introduction.propTypes = INTRODUCTION_PROP_TYPES;
Introduction.defaultProps = INTRODUCTION_DEFAULT_PROPS;
Introduction.displayName = 'Introduction';

export default Introduction;
export { Introduction };
