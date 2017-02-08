/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import {is_defined, is_empty, parse_float, map} from '../../utils.js';

import CollectionList from '../collectionlist.js';
import CollectionCounts from '../collectioncounts.js';

import Model from '../model.js';

import Filter from './filter.js';

export function parse_severity(value) {
  return is_empty(value) ? undefined : parse_float(value);
}

export function parse_text(text) {
  if (is_defined(text.__text)) {
    return {
      text: text.__text,
      text_excerpt: text.__excerpt,
    };
  }

  return {
    text,
    text_excerpt: '0',
  };
}

export function parse_counts(element, name) {
  let es = element[name + 's'];
  let ec = element[name + '_count'];
  return {
    first: es._start,
    rows: es._max,
    length: ec.page,
    all: ec.__text,
    filtered: ec.filtered,
  };
}

export function parse_filter(element) {
  return new Filter(element.filters);
}

export function parse_elements(response, name) {
  return response[name];
}

export function parse_entities(response, name, modelclass = Model) {
  return map(parse_elements(response, name),
    element => new modelclass(element));
}

export function parse_collection_counts(response, name) {
  return new CollectionCounts(parse_counts(response, name));
}

export function parse_collection_list(response, name, modelclass) {
  return new CollectionList({
    entries: parse_entities(response, name, modelclass),
    filter: parse_filter(response),
    counts: parse_collection_counts(response, name),
  });
}

// vim: set ts=2 sw=2 tw=80:
