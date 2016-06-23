/**
 * Copyright 2016, RadiantBlue Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import React from 'react'
import styles from './LoadFailed.css'

export default function LoadFailed({className}) {
  return (
    <div className={`${styles.root} ${className || ''}`}>
      <svg className={styles.glyph} viewBox="0 0 100 100">
        <path d="M50,54.0532653 L8.07989798,95.9733673 L6.05326532,98 L2,93.9467347 L4.02663266,91.920102 L45.9467347,50 L4.02663266,8.07989798 L2,6.05326532 L6.05326532,2 L8.07989798,4.02663266 L50,45.9467347 L91.920102,4.02663266 L93.9467347,2 L98,6.05326532 L95.9733673,8.07989798 L54.0532653,50 L95.9733673,91.920102 L98,93.9467347 L93.9467347,98 L91.920102,95.9733673 L50,54.0532653 Z"/>
      </svg>
      Load Failed
    </div>
  )
}

LoadFailed.propTypes = {
  className: React.PropTypes.string,
}
