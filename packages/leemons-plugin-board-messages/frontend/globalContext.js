import React from 'react';
import PropTypes from 'prop-types';
import { useStore } from '@common';
import { SocketIoService } from '@socket-io/service';
import { addErrorAlert, addSuccessAlert } from '@layout/alert';

export function Provider({ children }) {
  const [store] = useStore();

  SocketIoService.useOn('FUNDAE_REPORT_CHANGE', (event, data) => {
    if (data.percentageCompleted === 0) {
      addErrorAlert(`Error al crear el reporte del usuario: ${data.name}`);
    }
    if (data.percentageCompleted === 100) {
      addSuccessAlert(`Reporte del usuario: ${data.name} finalizado.`);
    }
  });

  return <>{children}</>;
}

Provider.propTypes = {
  children: PropTypes.node,
};
