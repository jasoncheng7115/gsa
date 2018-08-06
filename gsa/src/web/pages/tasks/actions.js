/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import IconDivider from 'web/components/layout/icondivider';

import {withEntityActions} from 'web/entities/actions';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import ExportIcon from 'web/components/icon/exporticon';

import ImportReportIcon from 'web/pages/tasks/icons/importreporticon';
import ResumeIcon from 'web/pages/tasks/icons/resumeicon';
import ScheduleIcon from 'web/pages/tasks/icons/scheduleicon';
import StartIcon from 'web/pages/tasks/icons/starticon';
import StopIcon from 'web/pages/tasks/icons/stopicon';

const Actions = ({
    entity,
    links,
    onReportImportClick,
    onTaskCloneClick,
    onTaskDeleteClick,
    onTaskDownloadClick,
    onTaskEditClick,
    onTaskResumeClick,
    onTaskStartClick,
    onTaskStopClick,
  }) => {
  return (
    <IconDivider
      align={['center', 'center']}
      grow
    >
      {isDefined(entity.schedule) ?
        <ScheduleIcon
          schedule={entity.schedule}
          links={links}
        /> :
        <StartIcon task={entity} onClick={onTaskStartClick}/>
      }

      <ImportReportIcon task={entity} onClick={onReportImportClick}/>

      <StopIcon task={entity} onClick={onTaskStopClick}/>

      <ResumeIcon task={entity} onClick={onTaskResumeClick}/>

      <TrashIcon
        entity={entity}
        name="task"
        onClick={onTaskDeleteClick}
      />
      <EditIcon
        entity={entity}
        name="task"
        onClick={onTaskEditClick}
      />
      <CloneIcon
        entity={entity}
        name="task"
        onClick={onTaskCloneClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Task')}
        onClick={onTaskDownloadClick}
      />
    </IconDivider>
  );
};

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onReportImportClick: PropTypes.func.isRequired,
  onTaskCloneClick: PropTypes.func.isRequired,
  onTaskDeleteClick: PropTypes.func.isRequired,
  onTaskDownloadClick: PropTypes.func.isRequired,
  onTaskEditClick: PropTypes.func.isRequired,
  onTaskResumeClick: PropTypes.func.isRequired,
  onTaskStartClick: PropTypes.func.isRequired,
  onTaskStopClick: PropTypes.func.isRequired,
};

export default withEntityActions(Actions);

// vim: set ts=2 sw=2 tw=80: