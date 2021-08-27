/*!
 * Copyright (c) 2017-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

const { src } = require('gulp');
const clean = require('gulp-clean');
const { install } = require('./util');

const BUILD_DIR = '../generated';

const cleanTask = () => 
  src(`${BUILD_DIR}`, { read: false, allowEmpty: true })
    .pipe(clean({ force: true }));

const installTask = done => {
  install();
  done();
};

module.exports = {
  install: installTask,
  clean: cleanTask
};
