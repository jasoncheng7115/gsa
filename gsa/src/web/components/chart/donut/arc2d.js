/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import Group from '../group';
import ToolTip from '../tooltip';
import {ArcDataPropType} from 'web/components/chart/donut/proptypes';

const Arc2d = ({
  data,
  path,
  x,
  y,
  onDataClick,
}) => {
  const {color = Theme.lightGray, toolTip} = data;
  return (
    <ToolTip
      content={toolTip}
    >
      {({targetRef, hide, show}) => (
        <Group
          onMouseEnter={show}
          onMouseLeave={hide}
          onClick={isDefined(onDataClick) ?
            () => onDataClick(data) : undefined}
        >
          <path
            d={path}
            fill={color}
          />
          <circle // used as positioning ref for tooltips
            ref={targetRef}
            cx={x}
            cy={y}
            r="1"
            visibility="hidden"
          />
        </Group>
      )}
    </ToolTip>
  );
};

Arc2d.propTypes = {
  data: ArcDataPropType.isRequired,
  path: PropTypes.toString.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  onDataClick: PropTypes.func,
};

export default Arc2d;

// vim: set ts=2 sw=2 tw=80:
