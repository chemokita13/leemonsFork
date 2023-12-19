import React from 'react';
import { OpenIcon } from '@bubbles-ui/icons/outline';
import { ActionButton, Box, TextClamp, Title } from '@bubbles-ui/components';
// TODO: AssetPlayer comes from @common
import { AssetPlayer } from '@bubbles-ui/leemons';
import { LibraryDetailPlayerStyles } from './LibraryDetailPlayer.styles';
import {
  LIBRARY_DETAIL_PLAYER_DEFAULT_PROPS,
  LIBRARY_DETAIL_PLAYER_PROP_TYPES,
} from './LibraryDetailPlayer.constants';

const LibraryDetailPlayer = ({
  name,
  height,
  cover,
  url,
  color,
  variant,
  metadata,
  fileIcon,
  fileType,
  fileExtension,
  titleActionButton,
  ...props
}) => {
  const asset = {
    name,
    cover,
    fileIcon,
    fileType,
    fileExtension,
    metadata,
    url,
  };

  const { classes } = LibraryDetailPlayerStyles({ color }, { name: 'LibraryDetailPlayer' });
  return (
    <Box className={classes.root} data-cypress-id="library-detail-player">
      <Box className={classes.color} />
      <AssetPlayer height={100} width={496} asset={asset} hideURLInfo viewPDF={false} compact />
      <Box className={classes.titleRow}>
        {/* <TextClamp lines={6}>
          <Title order={4} className={classes.title}>
            {name}
          </Title>
        </TextClamp> */}
        {/* <IconButton size={'xs'} icon={<ExpandDiagonalIcon height={16} width={16} />} /> */}
        {variant === 'bookmark' && (
          <ActionButton
            icon={<OpenIcon height={16} width={16} />}
            onClick={() => window.open(url, '_blank')}
          />
        )}
        {titleActionButton ? <ActionButton {...titleActionButton} /> : null}
      </Box>
    </Box>
  );
};

LibraryDetailPlayer.defaultProps = LIBRARY_DETAIL_PLAYER_DEFAULT_PROPS;
LibraryDetailPlayer.propTypes = LIBRARY_DETAIL_PLAYER_PROP_TYPES;

export default LibraryDetailPlayer;
export { LibraryDetailPlayer };
