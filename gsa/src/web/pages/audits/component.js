/* Copyright (C) 2019-2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React, {useEffect, useReducer} from 'react';

import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import _ from 'gmp/locale';

import Filter, {ALL_FILTER} from 'gmp/models/filter';
import {DEFAULT_MIN_QOD} from 'gmp/models/audit';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

import {map} from 'gmp/utils/array';
import {hasId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';

import {
  OPENVAS_DEFAULT_SCANNER_ID,
  OPENVAS_SCANNER_TYPE,
  GREENBONE_SENSOR_SCANNER_TYPE,
} from 'gmp/models/scanner';

import withDownload from 'web/components/form/withDownload';

import EntityComponent from 'web/entity/component';

import AlertComponent from 'web/pages/alerts/component';
import AuditDialog from 'web/pages/audits/dialog';
import ScheduleComponent from 'web/pages/schedules/component';
import TargetComponent from 'web/pages/targets/component';

import {
  loadEntities as loadAlerts,
  selector as alertSelector,
} from 'web/store/entities/alerts';

import {
  loadEntities as loadPolicies,
  selector as policiesSelector,
} from 'web/store/entities/policies';

import {
  loadEntities as loadScanners,
  selector as scannerSelector,
} from 'web/store/entities/scanners';

import {
  loadEntities as loadSchedules,
  selector as scheduleSelector,
} from 'web/store/entities/schedules';

import {
  loadEntities as loadTargets,
  selector as targetSelector,
} from 'web/store/entities/targets';

import {
  loadAllEntities as loadReportFormats,
  selector as reportFormatsSelector,
} from 'web/store/entities/reportformats';

import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';

import {getUsername} from 'web/store/usersettings/selectors';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import withGmp from 'web/utils/withGmp';
import {UNSET_VALUE, generateFilename} from 'web/utils/render';
import stateReducer, {updateState} from 'web/utils/stateReducer';
import useGmp from 'web/utils/useGmp';

const REPORT_FORMATS_FILTER = Filter.fromString(
  'uuid="dc51a40a-c022-11e9-b02d-3f7ca5bdcb11" and active=1 and trust=1',
);

const AuditComponent = props => {
  // const dispatch = useDispatch();
  const gmp = useGmp();
  const cmd = gmp.audit;

  const [state, dispatchState] = useReducer(stateReducer, {
    showDownloadReportDialog: false,
    auditDialogVisible: false,
  });

  useEffect(() => {
    props.loadUserSettingsDefaults();
    props.loadReportFormats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInteraction = () => {
    const {onInteraction} = props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const handleChange = (value, name) => {
    dispatchState(
      updateState({
        [name]: value,
      }),
    );
  };

  const handleAuditStart = audit => {
    const {onStarted, onStartError} = props;

    handleInteraction();

    return cmd.start(audit).then(onStarted, onStartError);
  };

  const handleAuditStop = audit => {
    const {onStopped, onStopError} = props;

    handleInteraction();

    return cmd.stop(audit).then(onStopped, onStopError);
  };

  const handleAuditResume = audit => {
    const {onResumed, onResumeError} = props;

    handleInteraction();

    return cmd.resume(audit).then(onResumed, onResumeError);
  };

  const handleAlertCreated = alertId => {
    props.loadAlerts();

    dispatchState(
      updateState({
        alertIds: [alertId, ...state.alertIds],
      }),
    );
  };

  const handleScheduleCreated = scheduleId => {
    props.loadSchedules();

    dispatchState(updateState({scheduleId}));
  };

  const handleTargetCreated = targetId => {
    props.loadTargets();

    dispatchState(updateState({targetId}));
  };

  const handleSaveAudit = ({
    alertIds,
    alterable,
    auto_delete,
    auto_delete_data,
    comment,
    policyId,
    hostsOrdering,
    id,
    in_assets,
    maxChecks,
    maxHosts,
    name,
    scannerId = OPENVAS_DEFAULT_SCANNER_ID,
    scannerType = OPENVAS_SCANNER_TYPE,
    scheduleId,
    schedulePeriods,
    sourceIface,
    targetId,
    audit,
  }) => {
    const tagId = undefined;
    const addTag = NO_VALUE;

    const applyOverrides = YES_VALUE;
    const minQod = DEFAULT_MIN_QOD;

    handleInteraction();

    if (isDefined(id)) {
      // save edit part
      if (isDefined(audit) && !audit.isChangeable()) {
        // arguments need to be undefined if the audit is not changeable
        targetId = undefined;
        scannerId = undefined;
        policyId = undefined;
      }
      const {onSaved, onSaveError} = props;
      return gmp.audit
        .save({
          alertIds,
          alterable,
          autoDelete: auto_delete,
          autoDeleteData: auto_delete_data,
          applyOverrides,
          comment,
          policyId,
          hostsOrdering,
          id,
          inAssets: in_assets,
          maxChecks,
          maxHosts,
          minQod,
          name,
          scannerId,
          scannerType,
          scheduleId,
          schedulePeriods,
          targetId,
          sourceIface,
        })
        .then(onSaved, onSaveError)
        .then(() => closeAuditDialog());
    }

    const {onCreated, onCreateError} = props;
    return gmp.audit
      .create({
        addTag,
        alertIds,
        alterable,
        applyOverrides,
        autoDelete: auto_delete,
        autoDeleteData: auto_delete_data,
        comment,
        policyId,
        hostsOrdering,
        inAssets: in_assets,
        maxChecks,
        maxHosts,
        minQod,
        name,
        scannerType,
        scannerId,
        scheduleId,
        schedulePeriods,
        sourceIface,
        tagId,
        targetId: targetId,
      })
      .then(onCreated, onCreateError)
      .then(() => closeAuditDialog());
  };

  const closeAuditDialog = () => {
    dispatchState(
      updateState({
        auditDialogVisible: false,
      }),
    );
  };

  const handleCloseAuditDialog = () => {
    closeAuditDialog();
    handleInteraction();
  };

  const openAuditDialog = audit => {
    const {capabilities} = props;

    props.loadAlerts();
    props.loadPolicies();
    props.loadScanners();
    props.loadSchedules();
    props.loadTargets();

    if (isDefined(audit)) {
      const canAccessSchedules =
        capabilities.mayAccess('schedules') && isDefined(audit.schedule);
      const scheduleId = canAccessSchedules ? audit.schedule.id : UNSET_VALUE;
      const schedulePeriods = canAccessSchedules
        ? audit.schedule_periods
        : undefined;

      dispatchState(
        updateState({
          auditDialogVisible: true,
          alertIds: map(audit.alerts, alert => alert.id),
          alterable: audit.alterable,
          applyOverrides: audit.apply_overrides,
          auto_delete: audit.auto_delete,
          auto_delete_data: audit.auto_delete_data,
          comment: audit.comment,
          policyId: hasId(audit.config) ? audit.config.id : undefined,
          hostsOrdering: audit.hosts_ordering,
          id: audit.id,
          in_assets: audit.in_assets,
          maxChecks: audit.max_checks,
          maxHosts: audit.max_hosts,
          minQod: audit.min_qod,
          name: audit.name,
          scannerId: hasId(audit.scanner) ? audit.scanner.id : undefined,
          scheduleId,
          schedulePeriods,
          sourceIface: audit.source_iface,
          targetId: hasId(audit.target) ? audit.target.id : undefined,
          audit,
          title: _('Edit Audit {{name}}', audit),
        }),
      );
    } else {
      const {
        defaultAlertId,
        defaultScannerId = OPENVAS_DEFAULT_SCANNER_ID,
        defaultScheduleId,
        defaultTargetId,
      } = props;

      const alertIds = isDefined(defaultAlertId) ? [defaultAlertId] : [];

      const defaultScannerType = OPENVAS_SCANNER_TYPE;

      dispatchState(
        updateState({
          auditDialogVisible: true,
          alertIds,
          alterable: undefined,
          applyOverrides: undefined,
          auto_delete: undefined,
          auto_delete_data: undefined,
          comment: undefined,
          policyId: undefined,
          hostsOrdering: undefined,
          id: undefined,
          in_assets: undefined,
          maxChecks: undefined,
          maxHosts: undefined,
          minQod: undefined,
          name: undefined,
          scannerId: defaultScannerId,
          scanner_type: defaultScannerType,
          scheduleId: defaultScheduleId,
          schedulePeriods: undefined,
          sourceIface: undefined,
          targetId: defaultTargetId,
          audit: undefined,
          title: _('New Audit'),
        }),
      );
    }
    handleInteraction();
  };

  const handleReportDownload = audit => {
    dispatchState(
      updateState({
        audit,
      }),
    );

    const {
      reportExportFileName,
      username,
      reportFormats = [],
      onDownload,
    } = props;

    const [reportFormat] = reportFormats;

    const extension = isDefined(reportFormat)
      ? reportFormat.extension
      : 'unknown'; // unknown should never happen but we should be save here

    handleInteraction();

    const {id} = audit.last_report;

    return gmp.report
      .download(
        {id},
        {
          reportFormatId: reportFormat.id,
        },
      )
      .then(response => {
        const {data} = response;
        const filename = generateFilename({
          extension,
          fileNameFormat: reportExportFileName,
          id,
          reportFormat: reportFormat.name,
          resourceName: audit.name,
          resourceType: 'report',
          username,
        });
        onDownload({filename, data});
      }); // handleError
  };

  const handleScannerChange = scannerId => {
    dispatchState(
      updateState({
        scannerId,
      }),
    );
  };

  const {
    alerts,
    isLoadingScanners,
    policies,
    reportFormats = [],
    scanners,
    schedules,
    targets,
    children,
    onCloned,
    onCloneError,
    onCreated,
    onCreateError,
    onDeleted,
    onDeleteError,
    onDownloaded,
    onDownloadError,
    onInteraction,
  } = props;

  const {
    alertIds,
    alterable,
    auto_delete,
    auto_delete_data,
    policyId,
    comment,
    hostsOrdering,
    id,
    in_assets,
    maxChecks,
    maxHosts,
    name,
    scannerId,
    scheduleId,
    schedulePeriods,
    sourceIface,
    targetId,
    audit,
    auditDialogVisible,
    title = _('Edit Audit {{name}}', audit),
  } = state;
  const gcrFormatDefined = reportFormats.length > 0;
  return (
    <React.Fragment>
      <EntityComponent
        name="audit"
        onCreated={onCreated}
        onCreateError={onCreateError}
        onCloned={onCloned}
        onCloneError={onCloneError}
        onDeleted={onDeleted}
        onDeleteError={onDeleteError}
        onDownloaded={onDownloaded}
        onDownloadError={onDownloadError}
        onInteraction={onInteraction}
      >
        {other => (
          <React.Fragment>
            {children({
              ...other,
              create: openAuditDialog,
              edit: openAuditDialog,
              start: handleAuditStart,
              stop: handleAuditStop,
              resume: handleAuditResume,
              reportDownload: handleReportDownload,
              gcrFormatDefined,
            })}

            {auditDialogVisible && (
              <TargetComponent
                onCreated={handleTargetCreated}
                onInteraction={onInteraction}
              >
                {({create: createtarget}) => (
                  <AlertComponent
                    onCreated={handleAlertCreated}
                    onInteraction={onInteraction}
                  >
                    {({create: createalert}) => (
                      <ScheduleComponent
                        onCreated={handleScheduleCreated}
                        onInteraction={onInteraction}
                      >
                        {({create: createschedule}) => (
                          <AuditDialog
                            alerts={alerts}
                            alertIds={alertIds}
                            alterable={alterable}
                            auto_delete={auto_delete}
                            auto_delete_data={auto_delete_data}
                            comment={comment}
                            policyId={policyId}
                            hostsOrdering={hostsOrdering}
                            id={id}
                            in_assets={in_assets}
                            isLoadingScanners={isLoadingScanners}
                            maxChecks={maxChecks}
                            maxHosts={maxHosts}
                            name={name}
                            policies={policies}
                            scannerId={scannerId}
                            scanners={scanners}
                            scheduleId={scheduleId}
                            schedulePeriods={schedulePeriods}
                            schedules={schedules}
                            sourceIface={sourceIface}
                            targetId={targetId}
                            targets={targets}
                            audit={audit}
                            title={title}
                            onNewAlertClick={createalert}
                            onNewTargetClick={createtarget}
                            onNewScheduleClick={createschedule}
                            onChange={handleChange}
                            onClose={handleCloseAuditDialog}
                            onSave={handleSaveAudit}
                            onScannerChange={handleScannerChange}
                          />
                        )}
                      </ScheduleComponent>
                    )}
                  </AlertComponent>
                )}
              </TargetComponent>
            )}
          </React.Fragment>
        )}
      </EntityComponent>
    </React.Fragment>
  );
};

AuditComponent.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.model),
  capabilities: PropTypes.capabilities.isRequired,
  children: PropTypes.func.isRequired,
  defaultAlertId: PropTypes.id,
  defaultScannerId: PropTypes.id,
  defaultScheduleId: PropTypes.id,
  defaultTargetId: PropTypes.id,
  gmp: PropTypes.gmp.isRequired,
  isLoadingScanners: PropTypes.bool,
  loadAlerts: PropTypes.func.isRequired,
  loadPolicies: PropTypes.func.isRequired,
  loadReportFormats: PropTypes.func.isRequired,
  loadScanners: PropTypes.func.isRequired,
  loadSchedules: PropTypes.func.isRequired,
  loadTargets: PropTypes.func.isRequired,
  loadUserSettingsDefaults: PropTypes.func.isRequired,
  policies: PropTypes.arrayOf(PropTypes.model),
  reportExportFileName: PropTypes.object,
  reportFormats: PropTypes.array,
  scanners: PropTypes.arrayOf(PropTypes.model),
  schedules: PropTypes.arrayOf(PropTypes.model),
  targets: PropTypes.arrayOf(PropTypes.model),
  username: PropTypes.string,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownload: PropTypes.func.isRequired,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
  onResumeError: PropTypes.func,
  onResumed: PropTypes.func,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
  onStartError: PropTypes.func,
  onStarted: PropTypes.func,
  onStopError: PropTypes.func,
  onStopped: PropTypes.func,
};

const mapStateToProps = (rootState, {match}) => {
  const alertSel = alertSelector(rootState);
  const userDefaults = getUserSettingsDefaults(rootState);
  const policiesSel = policiesSelector(rootState);
  const scannersSel = scannerSelector(rootState);
  const scheduleSel = scheduleSelector(rootState);
  const targetSel = targetSelector(rootState);
  const userDefaultsSelector = getUserSettingsDefaults(rootState);
  const username = getUsername(rootState);

  const reportFormatsSel = reportFormatsSelector(rootState);

  const scannerList = scannersSel.getEntities(ALL_FILTER);
  const scanners = isDefined(scannerList)
    ? scannerList.filter(
        scanner =>
          scanner.scannerType === OPENVAS_SCANNER_TYPE ||
          scanner.scannerType === GREENBONE_SENSOR_SCANNER_TYPE,
      )
    : undefined;

  return {
    alerts: alertSel.getEntities(ALL_FILTER),
    defaultAlertId: userDefaults.getValueByName('defaultalert'),
    defaultScannerId: userDefaults.getValueByName('defaultopenvasscanner'),
    defaultScheduleId: userDefaults.getValueByName('defaultschedule'),
    defaultTargetId: userDefaults.getValueByName('defaulttarget'),
    isLoadingScanners: scannersSel.isLoadingAllEntities(ALL_FILTER),
    reportExportFileName: userDefaultsSelector.getValueByName(
      'reportexportfilename',
    ),
    reportFormats: reportFormatsSel.getAllEntities(REPORT_FORMATS_FILTER),
    policies: policiesSel.getEntities(ALL_FILTER),
    scanners,
    schedules: scheduleSel.getEntities(ALL_FILTER),
    targets: targetSel.getEntities(ALL_FILTER),
    username,
  };
};

const mapDispatchToProp = (dispatch, {gmp}) => ({
  loadAlerts: () => dispatch(loadAlerts(gmp)(ALL_FILTER)),
  loadPolicies: () => dispatch(loadPolicies(gmp)(ALL_FILTER)),
  loadScanners: () => dispatch(loadScanners(gmp)(ALL_FILTER)),
  loadSchedules: () => dispatch(loadSchedules(gmp)(ALL_FILTER)),
  loadTargets: () => dispatch(loadTargets(gmp)(ALL_FILTER)),
  loadUserSettingsDefaults: () => dispatch(loadUserSettingDefaults(gmp)()),
  loadReportFormats: () =>
    dispatch(loadReportFormats(gmp)(REPORT_FORMATS_FILTER)),
});

export default compose(
  withGmp,
  withCapabilities,
  withDownload,
  withRouter,
  connect(mapStateToProps, mapDispatchToProp),
)(AuditComponent);
